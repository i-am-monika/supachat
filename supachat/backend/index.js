const express = require('express');
const cors = require('cors');
const client = require('prom-client');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const chatRequestsTotal = new client.Counter({
  name: 'chat_requests_total',
  help: 'Total number of chat requests',
  registers: [register]
});

// Middleware to track request duration
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Chat route
const chatRoute = require('./routes/chat');
app.use('/api/chat', (req, res, next) => {
  chatRequestsTotal.inc();
  next();
}, chatRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SupaChat backend running on port ${PORT}`);
});