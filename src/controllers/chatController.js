require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { poolConnect, sql } = require("../config/db.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

const conversarComIA = async (req, res) => {
  const { mensagem } = req.body;
  const userId = req.user?.id || 1;

  if (!mensagem) {
    return res.status(400).json({ mensagem: "Envie uma mensagem para a IA!" });
  }

  try {
    let fichaInfo = "O usuário não possui ficha alimentar registrada.";
    let alimentosInfo = "";


    const pool = await poolConnect;

    const fichaResult = await pool
      .request()
      .input("usuario_id", sql.Int, userId)
      .query("SELECT TOP 1 * FROM fichaAlimentar WHERE usuario_id = @usuario_id");

    if (fichaResult.recordset.length > 0) {
      const ficha = fichaResult.recordset[0];
      fichaInfo = `O objetivo do usuário é: ${ficha.objetivo}.
Ele já consumiu ${ficha.total_kcal} kcal, ${ficha.total_proteina}g proteínas, ${ficha.total_carboidratos}g carboidratos e ${ficha.total_gordura}g gorduras.`;
    }

    const alimentoResult = await pool
      .request()
      .input("nome", sql.VarChar, `%${mensagem}%`)
      .query("SELECT TOP 3 * FROM tbltacoNL WHERE nome_alimento LIKE @nome");

    if (alimentoResult.recordset.length > 0) {
      alimentosInfo = "Alimentos encontrados no banco:\n";
      alimentoResult.recordset.forEach((a) => {
        alimentosInfo += `- ${a.descricao}: ${a.kcal} kcal, ${a.proteina}g proteínas, ${a.carboidrato}g carboidratos, ${a.gordura}g gorduras\n`;
      });
    }

    const prompt = `
Você é Salus, um(a) nutricionista virtual inteligente, criado para promover saúde, bem-estar e alimentação acessível.  
Responda com base apenas nas informações fornecidas abaixo.  
Seja amigável, direto(a), objetivo(a) e evite usar linguagem técnica demais.  
Sempre que possível, leve em conta o objetivo nutricional do usuário e os alimentos encontrados no banco de dados.  
Não invente dados externos, só quando necessário — foque no que foi informado!  
Se o usuário não tiver uma ficha alimentar, responda sugerindo criar uma ou continuar sem ela.  
Se o usuário perguntar sobre algo fora de Nutrição ou Saúde, responda que não foi programada para isso.  

------------------  
📌 Ficha do usuário:  
${fichaInfo}  

📌 Alimentos encontrados:  
${alimentosInfo}  

❓ Pergunta do usuário: ${mensagem}
    `;

    const result = await model.generateContent(prompt);
    const resposta = result.response.text();

    return res.status(200).json({ resposta });
  } catch (error) {
    console.error("Erro ao conversar com a IA:", error);
    return res.status(500).json({ mensagem: "Erro ao gerar resposta da IA." });
  }
};

module.exports = { conversarComIA };
