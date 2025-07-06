const express = require('express'); 
const app = express();
const cors = require('cors');
const { limiteGeral } = require('./middlewares/rateLimiter');

const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});

app.set('trust proxy', 1); // Importante pro rate limiter no Render
app.use(Sentry.Handlers.requestHandler());

app.use(cors());
app.use(express.json());
app.use(limiteGeral);

// Suas rotas
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api/alimentos', require('./routes/alimentosRoutes'));
app.use('/api/ficha', require('./routes/fichaRoutes'));
app.use('/api/teste', require('./routes/testeConexaoRoutes'));

// Middleware de erro do Sentry
app.use(Sentry.Handlers.errorHandler());

app.get('/debug-sentry', () => {
  throw new Error('💥 Teste de erro enviado pro Sentry! Logs: ');
});

app.get('/', (req, res) => {
  res.send('Bem vindo à API NutritionLite');
});

module.exports = app;
