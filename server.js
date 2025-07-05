require('dotenv').config();
const app = require('./app');
const Sentry = require('./src/config/sentry');

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(Sentry.Handlers.errorHandler());    