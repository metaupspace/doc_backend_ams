# Document Generation Service

Production-ready document generation service built with Node.ts, Express, MongoDB, and PDF streaming.

## Features

- **JWT Token Validation**: Only authenticates requests; no login/register system
- **PDF Generation**: Dynamic PDF generation using PDFKit with support for multiple document types
- **MongoDB Integration**: Mongoose models for storing generation logs and document metadata
- **Rate Limiting**: Global and route-specific rate limiting using express-rate-limit
- **Professional Logging**: Winston logger for requests, errors, and events
- **Security**: Helmet middleware, CORS support, compression, and input validation
- **Streaming Response**: Efficient PDF streaming without disk storage
- **Clean Architecture**: Modular separation of concerns (controller/service/generator)

## Quick Start

1. **Setup environment**:
   ```bash
   cp .env.example .env
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start MongoDB** (ensure MongoDB is running on localhost:27017):
   ```bash
   mongod
   ```

4. **Run server**:
   - Development: `npm run dev`
   - Production: `npm start`

## API Usage

### Generate Document

**Endpoint**: `POST /api/v1/documents/generate`

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "documentType": "invoice",
  "payload": {
    "invoiceNumber": "INV-001",
    "amount": 1000,
    "customerName": "John Doe",
    "items": [
      {
        "name": "Product A",
        "quantity": 2,
        "price": 500
      }
    ]
  }
}
```

**Response**: PDF file stream

**Supported Document Types**: invoice, certificate, report

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok"
}

### Auth Middleware Test Route

Use this route to verify JWT middleware is working without touching DB-heavy handlers.

**Endpoint**: `GET /api/v1/documents/auth-test`

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

### Swagger Documentation

- Swagger UI: `GET /api-docs`
- OpenAPI JSON: `GET /openapi.tson`

Swagger covers health and all document endpoints, including authentication requirements.
```

## Project Structure

```
src/
├── config/
│   ├── db.ts              # MongoDB connection
│   ├── env.ts             # Environment variables
│   └── logger.ts          # Winston logger setup
├── modules/
│   └── document/
│       ├── document.controller.ts    # HTTP handlers
│       ├── document.service.ts       # Business logic
│       ├── document.generator.ts     # PDF generation
│       ├── document.routes.ts        # Route definitions
│       ├── document.validation.ts    # Input validation
│       └── document.model.ts         # MongoDB schema
├── middlewares/
│   ├── auth.middleware.ts           # JWT validation
│   ├── error.middleware.ts          # Error handling
│   ├── rateLimit.middleware.ts      # Rate limiting
│   └── requestLogger.middleware.ts  # Request logging
├── utils/
│   ├── apiResponse.ts               # Response formatter
│   └── asyncHandler.ts              # Async error handler
├── routes/
│   └── index.ts                     # Route loader
├── app.ts                           # Express app setup
└── server.ts                        # Server entrypoint

tests/
├── document.test.ts        # Document generation tests
└── auth.test.ts            # Auth middleware tests

logs/                       # Log files (gitignored)
```

## Configuration

All configuration is managed via `.env`:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT validation
- `LOG_LEVEL`: Winston log level (info/debug/error)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Security

- **Helmet**: Sets security HTTP headers
- **CORS**: Configured for API access
- **Rate Limiting**: Prevents abuse
- **Compression**: Gzip compression for responses
- **JWT Validation**: Only validates, no session management

