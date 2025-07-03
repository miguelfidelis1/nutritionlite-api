const sql = require('mssql');

const config = {
  user: 'nl_admin',
  password: 'Nutrition@2025', // troca aqui pela sua senha real, sem as chaves {}
  server: 'nutritionlite-server.database.windows.net',
  database: 'Nldatabase', // atenção ao "L" maiúsculo/minúsculo, confirma o nome no Azure
  port: 1433,
  options: {
    encrypt: true, // obrigatório no Azure
    trustServerCertificate: false
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('Erro na conexão com o banco de dados:', err);
});

module.exports = {
  poolConnect,
  pool,
  sql
};

