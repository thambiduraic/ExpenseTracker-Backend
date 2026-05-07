const { NODE_ENV } = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${status}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
