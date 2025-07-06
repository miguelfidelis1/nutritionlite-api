// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa o app principal
const app = require('./src/app');

// Define a porta a ser usada
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ NutritionLite API está rodando em: http://localhost:${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
