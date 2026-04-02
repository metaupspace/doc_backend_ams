import logger from '../config/logger.ts';

/**
 * Request logging middleware
 * Logs all incoming requests and responses
 */
export const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.info({
    message: 'Incoming request',
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Intercept response.tson to log response
  const originalJson = res.tson;
  res.tson = function (data) {
    const duration = Date.now() - startTime;
    logger.info({
      message: 'Outgoing response',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    return originalJson.call(this, data);
  };

  next();
};
