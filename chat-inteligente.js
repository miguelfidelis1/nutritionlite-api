require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    enableArithAbort: true,
    connectTimeout: 30000
  },
};

const nutrientes = {
  'proteína': 'proteina',
  'proteínas': 'proteina',
  'massa muscular': 'proteina',
  'músculo': 'proteina',
  'carboidrato': 'carboidratos',
  'carboidratos': 'carboidratos',
  'açúcar': 'carboidratos',
  'gordura': 'lipideos',
  'gorduras': 'lipideos',
  'gordo': 'lipideos',
  'energia': 'energia_kcal',
  'calorias': 'energia_kcal',
  'fibra': 'fibra_alimentar',
  'fibras': 'fibra_alimentar',
  'digestão': 'fibra_alimentar',
  'saudável': 'energia_kcal',
  'leve': 'energia_kcal'
};

const respostasRapidas = [
  {
    padrao: /ovo.*engorda/i,
    resposta: "Ovo é uma excelente fonte de proteína e, consumido com moderação, não engorda. O que importa é o contexto da dieta e o modo de preparo. Evite frituras se estiver controlando calorias."
  },
  {
    padrao: /p(ã|a)o.*(noite|janta)/i,
    resposta: "Pão à noite não é proibido! Mas dê preferência a versões integrais e controle as quantidades. O equilíbrio ao longo do dia é o que faz a diferença."
  },
  {
    padrao: /comer.*(noite|tarde).*faz mal/i,
    resposta: "Comer à noite não é o problema — o excesso sim. Prefira refeições leves e com boa digestão se for comer próximo da hora de dormir."
  },
  {
    padrao: /posso.*café.*(sem|antes).*comer/i,
    resposta: "Tomar café puro em jejum não é problema para a maioria das pessoas. Mas se você sente desconforto, é melhor comer algo leve antes."
  },
  {
    padrao: /posso.*(comer)?.*arroz/i,
    resposta: "Claro que pode! O arroz é uma ótima fonte de energia. Se estiver buscando reduzir carboidratos, a versão integral é mais indicada."
  }
];

function identificarFiltro(mensagem) {
  const msg = mensagem.toLowerCase();
  for (const termo in nutrientes) {
    if (msg.includes(termo)) {
      return nutrientes[termo];
    }
  }
  return null;
}

app.post('/api/chat-inteligente', async (req, res) => {
  const { mensagem, userId } = req.body;

  if (!mensagem || !userId) {
    return res.status(400).json({ error: 'mensagem e userId são obrigatórios.' });
  }

  for (const filtro of respostasRapidas) {
    if (filtro.padrao.test(mensagem)) {
      return res.json({ resposta: filtro.resposta });
    }
  }

  try {
    await sql.connect(dbConfig);

    const filtroColuna = identificarFiltro(mensagem);
    let alimentos;

    if (filtroColuna) {
      const ordem = /pouco|menos|min|baixo|evitar/i.test(mensagem) ? 'ASC' : 'DESC';
      const query = `SELECT TOP 5 * FROM tbltacoNL ORDER BY ${filtroColuna} ${ordem}`;
      alimentos = (await sql.query(query)).recordset;
    } else {
      const alimentoQuery = await sql.query`
        SELECT TOP 3 * FROM tbltacoNL WHERE nome_alimento LIKE ${'%' + mensagem + '%'}
      `;
      alimentos = alimentoQuery.recordset;
    }

    const fichaQuery = await sql.query`
      SELECT TOP 1 * FROM fichaAlimentar WHERE usuario_id = ${userId} ORDER BY id DESC
    `;
    const ficha = fichaQuery.recordset[0];

    // Prompt da IA Salus
    let contexto = `Você é Salus, um(a) nutricionista virtual inteligente, criado para promover saúde, bem-estar e alimentação acessível. 
Responda com base apenas nas informações fornecidas abaixo. 
Seja amigável, direto(a), objetivo(a) e evite usar linguagem técnica demais. 
Sempre que possível, leve em conta o objetivo nutricional do usuário e os alimentos encontrados no banco de dados. 
Não invente dados externos, só quando necessário — foque no que foi informado! 
Se o usuário não tiver uma ficha alimentar, responda com uma sugestão perguntando se ele deseja criar uma ou se deseja continuar sem ela.
Também se o usuário resolver falar coisas fora do assunto de Nutrição ou Saúde, avise que você não foi programada para responder esse tipo de pergunta. 
--------------------------------`;

    if (alimentos.length > 0) {
      contexto += '\nALIMENTOS ENCONTRADOS:\n';
      alimentos.forEach(a => {
        contexto += `- ${a.nome_alimento}: ${a.energia_kcal} kcal, ${a.proteina}g prot, ${a.carboidratos}g carb, ${a.lipideos}g gordura\n`;
      });
    } else {
      contexto += '\nNenhum alimento encontrado. Responda com uma sugestão genérica baseada em alimentação saudável.\n';
    }

    if (ficha) {
      contexto += `\nFICHA DO USUÁRIO:\nObjetivo: ${ficha.objetivo}\nCalorias: ${ficha.total_kcal}\nProteínas: ${ficha.total_proteina}\nCarboidratos: ${ficha.total_carboidrato}\nGorduras: ${ficha.total_lipidio}\n`;
    }

    contexto += `\nPergunta do usuário: ${mensagem}`;

    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'mistral',
      stream: false,
      messages: [
        { role: 'system', content: contexto },
        { role: 'user', content: mensagem }
      ]
    });

    const respostaIA = response.data?.message?.content;
    res.json({ resposta: respostaIA });

  } catch (err) {
    console.error('Erro no chat inteligente:', err);
    res.status(500).json({ error: 'Erro ao processar a requisição.' });
  }
});

const PORT = process.env.CHAT_PORT || 3001;
app.listen(PORT, () => {
  console.log(`💬 Chat Inteligente rodando em http://localhost:${PORT}`);
});
