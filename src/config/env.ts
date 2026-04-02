import dotenv from 'dotenv';

dotenv.config();

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseCsv = (value) => {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const nodeEnv = process.env.NODE_ENV || 'development';
export const port = Number(process.env.PORT || 3000);
export const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/doc-gen-service';
export const jwtSecret = process.env.JWT_SECRET || '';
export const logLevel = process.env.LOG_LEVEL || 'info';
export const corsOrigins = parseCsv(process.env.CORS_ORIGIN);
export const enableApiDocs = parseBoolean(process.env.ENABLE_API_DOCS, nodeEnv !== 'production');
export const exposeOpenApiSpec = parseBoolean(
  process.env.EXPOSE_OPENAPI_JSON,
  nodeEnv !== 'production'
);

// Validation
if (nodeEnv === 'production') {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set in production');
  }

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}

if (!Number.isFinite(port) || port <= 0 || port > 65535) {
  throw new Error('PORT must be a valid TCP port number');
}
