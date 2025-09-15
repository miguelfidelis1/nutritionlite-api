const axios = require('axios');

const conversarComIA = async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).json({ mensagem: 'Envie uma mensagem para a IA!' });
  }

  try {
    const resposta = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: mensagem,
      stream: false
    });

    return res.status(200).json({
      resposta: resposta.data.response
    });

  } catch (error) {
    console.error('Erro ao conversar com a IA:', error.message);
    return res.status(500).json({ mensagem: 'Erro ao gerar resposta da IA.' });
  }
};

module.exports = { conversarComIA };
