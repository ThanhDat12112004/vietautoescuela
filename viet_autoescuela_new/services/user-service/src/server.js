const path = require('path');
require('dotenv').config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../../.env'),
});
const app = require('./app');

const port = Number(process.env.USER_SERVICE_PORT);

if (!port) {
  throw new Error('Missing USER_SERVICE_PORT in environment');
}

// Attach `error` before async listen completes so EADDRINUSE is never an unhandled exception.
const server = app.listen(port);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[user-service] Port ${port} is already in use. Free it then save a file to retry nodemon, e.g.:\n  kill $(lsof -t -i:${port})`
    );
    process.exit(1);
    return;
  }
  console.error('[user-service] listen error:', err);
  process.exit(1);
});

server.on('listening', () => {
  console.log(`user-service listening on port ${port}`);
});

function shutdown(signal) {
  return () => {
    server.close((closeErr) => {
      if (closeErr) console.error('[user-service] server.close:', closeErr);
      process.exit(closeErr ? 1 : 0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
}

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));
