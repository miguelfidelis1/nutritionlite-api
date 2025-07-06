const express = require('express'); 
const app = express();
const cors = require('cors');
const { limiteGeral } = require('./middlewares/rateLimiter');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: "production",
});


app.use(cors());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());

app.use(limiteGeral);

const userRoutes = require('./routes/userRoutes');
const alimentosRoutes = require('./routes/alimentosRoutes');
const fichaRoutes = require('./routes/fichaRoutes');
const testeConexaoRoutes = require('./routes/testeConexaoRoutes');

app.set('trust proxy', 1);
app.use('/api/usuarios', userRoutes);
app.use('/api/alimentos', alimentosRoutes);
app.use('/api/ficha', fichaRoutes);
app.use('/api/teste', testeConexaoRoutes);


app.use(Sentry.Handlers.errorHandler());

app.get('/debug-sentry', (req, res) => {
    throw new Error('💥 Teste de erro do Sentry!');
  });

app.get('/', (req, res) => {
    res.send('Bem vindo a API NutritionLite');
});

module.exports = app;
