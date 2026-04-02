import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.ts';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.ts';
import { requestLoggerMiddleware } from './middlewares/requestLogger.middleware.ts';
import { globalRateLimiter } from './middlewares/rateLimit.middleware.ts';
import swaggerSpec from './config/swagger.ts';
import { corsOrigins, enableApiDocs, exposeOpenApiSpec, nodeEnv } from './config/env.ts';

const app = express();

// Security & Performance Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients and server-to-server calls.
      if (!origin) return callback(null, true);

      if (corsOrigins.length === 0) {
        if (nodeEnv !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('CORS is not configured for this environment'));
      }

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS policy'));
    },
    credentials: corsOrigins.length > 0,
  })
);
app.use(compression()); // Gzip compression

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use(globalRateLimiter);

// Logging
app.use(requestLoggerMiddleware);

// Health check route (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

if (enableApiDocs) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

if (exposeOpenApiSpec) {
  app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(swaggerSpec);
  });
}

// API routes (protected by validateToken middleware)
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
