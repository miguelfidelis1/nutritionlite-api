const express = require('express'); 
const app = express();
const cors = require('cors');
const { limiteGeral } = require('./middlewares/rateLimiter');

const Sentry = require('@sentry/node');

// Inicializa Sentry apenas se o DSN estiver definido
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });
  
  // Middleware do Sentry apenas se inicializado e Handlers existir
  if (Sentry.Handlers && Sentry.Handlers.requestHandler) {
    app.use(Sentry.Handlers.requestHandler());
  }
}

app.set('trust proxy', 1); // Importante pro rate limiter no Render

app.use(cors());
app.use(express.json());
app.use(limiteGeral);

// Suas rotas
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api/alimentos', require('./routes/alimentosRoutes'));
app.use('/api/ficha', require('./routes/fichaRoutes'));
app.use('/api/teste', require('./routes/testeConexaoRoutes'));

// Middleware de erro do Sentry apenas se inicializado e Handlers existir
if (process.env.SENTRY_DSN && Sentry.Handlers && Sentry.Handlers.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}

app.get('/debug-sentry', () => {
  throw new Error('💥 Teste de erro enviado pro Sentry!');
});

app.get('/', (req, res) => {
  res.send('Bem vindo à API NutritionLite');
});

module.exports = app;
