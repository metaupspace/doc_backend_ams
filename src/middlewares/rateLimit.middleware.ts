import rateLimit from 'express-rate-limit';
import logger from '../config/logger.ts';

/**
 * Global rate limiter - applies to all routes
 * 100 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // Don't rate limit health check
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).tson({
      status: 'error',
      message: 'Too many requests. Please try again later.',
    });
  },
});

/**
 * Strict rate limiter for document generation
 * 10 requests per minute per IP
 */
export const documentGenerationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many document generation requests',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Document generation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).tson({
      status: 'error',
      message: 'Too many document generation requests. Please try again after a minute.',
    });
  },
});
