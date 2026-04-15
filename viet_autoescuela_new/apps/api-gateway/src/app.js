const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const proxyRoute = require('./routes/modules/proxy.route');

const app = express();

// Trust first proxy hop (ngrok/reverse proxy) for correct client IP detection.
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        frameAncestors: [
          "'self'",
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https:',
        ],
      },
    },
  })
);
app.use(cors());
app.use(morgan('dev'));
const gatewayRatePerMinute = Number(process.env.API_GATEWAY_RATE_LIMIT_PER_MINUTE || 400);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: Number.isFinite(gatewayRatePerMinute) && gatewayRatePerMinute > 0 ? gatewayRatePerMinute : 400,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => {
  return res.json({ service: 'api-gateway', status: 'ok' });
});

app.use(proxyRoute);

module.exports = app;
