const express = require('express');
const router = express.Router();
const { poolConnect, pool } = require('../config/db');

router.get('/conexao', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT GETDATE() AS dataHora');
    res.json({
      mensagem: 'Conexão com o banco de dados funcionando!',
      dataHoraServidor: result.recordset[0].dataHora
    });
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({ erro: 'Erro ao testar conexão com o banco de dados.' });
  }
});

module.exports = router;
