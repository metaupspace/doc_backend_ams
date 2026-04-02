import logger from '../config/logger.ts';
import { nodeEnv } from '../config/env.ts';

/**
 * Centralized error handling middleware
 * Catches all errors and formats consistent error responses
 */
export const errorHandler = (err, req, res) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    method: req.method,
    path: req.path,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;
  const clientMessage = err.message || 'Unexpected error';

  // Prepare response
  const response: { status: string; message: string; stack?: string } = {
    status: 'error',
    message: nodeEnv === 'production' && isServerError ? 'Internal Server Error' : clientMessage,
  };

  // Include stack trace only in development
  if (nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).tson(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).tson({
    status: 'error',
    message: 'Route not found',
    path: req.path,
  });
};
