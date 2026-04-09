# AMS DOC Service

Production-ready document generation API with JWT security, PDF streaming, and OpenAPI docs.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)
- [Testing and Code Quality](#testing-and-code-quality)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**AMS DOC Service** is an Express + TypeScript service that generates HR and business documents as PDFs.
It supports multiple document templates, validates access with JWT middleware, streams generated files to clients, and exposes OpenAPI documentation through Swagger UI.

The system is designed for production deployments with security middleware, rate limiting, logging, environment validation, and container support.

---

## Features

- **Template-based document generation** for letters, certificates, reports, and forms.
- **PDF output pipeline** using `pdf-lib` and `pdfkit`.
- **JWT-protected APIs** for document listing, lookup, and generation.
- **Rate limiting** at global and document-generation levels.
- **Security hardening** with `helmet`, `cors`, and controlled trust proxy setup.
- **Centralized error handling** with structured API responses.
- **Swagger/OpenAPI docs** with both production and localhost server targets.
- **Production-safe configuration checks** (for example, strict JWT rules in production).
- **Docker-ready deployment** using `Dockerfile` and `docker-compose.yml`.

---

## Tech Stack

| Category | Technology |
| --- | --- |
| Runtime | [Node.js](https://nodejs.org/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Framework | [Express](https://expressjs.com/) |
| Database | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) |
| Auth | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) |
| Validation | [Joi](https://joi.dev/) |
| PDF | [pdf-lib](https://pdf-lib.js.org/) + [pdfkit](https://pdfkit.org/) |
| API Docs | [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) + [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) |
| Logging | [Winston](https://github.com/winstonjs/winston) |
| Build Tooling | [tsup](https://tsup.egoist.dev/) + [tsx](https://github.com/esbuild-kit/tsx) |
| Linting / Format | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB instance (local or hosted)
- Docker and Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/metaupspace/doc_backend_ams.git
cd doc_backend_ams

# Install dependencies
npm install
```

### Local Environment Setup

Create a `.env` file at the project root (or copy from `.env.example` if available):

```bash
cp .env.example .env
```

If `.env.example` does not exist, create `.env` manually and add the variables listed in [Environment Variables](#environment-variables).

### Run in Development

```bash
npm run dev
```

The API runs on `http://localhost:3000` by default.

### Build and Start in Production Mode

```bash
npm run build
npm run start
```

---

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `tsx watch src/server.ts` | Start backend in watch mode |
| `build` | `npm run typecheck && tsup` | Typecheck and build to `dist/` |
| `start` | `node dist/server.js` | Start compiled production build |
| `test` | `tsx --test tests/**/*.test.ts` | Run test suite |
| `lint` | `eslint . --ext .ts` | Run ESLint checks |
| `typecheck` | `tsc --noEmit -p tsconfig.json` | Run TypeScript type checks |
| `format` | `prettier --write "src/**/*.ts" "tests/**/*.ts"` | Format source and tests |

---

## Docker

### Run with Docker Compose

```bash
# Build and start
docker compose up --build -d

# Follow logs
docker compose logs -f api

# Stop containers
docker compose down
```

By default, the container maps `${HOST_PORT:-3000}` to internal port `3000`.

### Run with Dockerfile Only

```bash
# Build image
docker build -t ams-doc-backend .

# Run container with env file
docker run -p 3000:3000 --env-file .env ams-doc-backend
```

---

## Environment Variables

Create a `.env` file in the project root with the following values:

| Variable | Description | Required |
| --- | --- | --- |
| `NODE_ENV` | Environment (`development` or `production`) | Yes |
| `PORT` | API port (default: `3000`) | No |
| `DATABASE_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing/verification secret | Yes |
| `LOG_LEVEL` | Winston log level (default: `info`) | No |
| `CORS_ORIGIN` | Comma-separated allowed origins | Recommended |
| `ENABLE_API_DOCS` | Enable Swagger UI (`1`, `true`, `yes`, `on`) | No |
| `EXPOSE_OPENAPI_JSON` | Expose `/openapi.json` (`1`, `true`, `yes`, `on`) | No |
| `HOST_PORT` | Host port used in Docker Compose | No |

### Production Rules

- `JWT_SECRET` is mandatory in production.
- `JWT_SECRET` must be at least 32 characters in production.
- `PORT` must be a valid TCP port.
- `CORS_ORIGIN` should be explicitly set for production deployments.

### Git Safety

- Keep `.env` local and never commit secrets.
- Commit `.env.example` only (template values, no real credentials).

---

## API Documentation

Swagger and OpenAPI are built into the service.

- Swagger UI: `/api-docs`
- Raw OpenAPI spec: `/openapi.json`

Swagger UI includes a server selector with:

- `https://docbackendams-production.up.railway.app` (Production)
- `http://localhost:3000` (Local)

This allows users to switch between local and production targets directly in the docs UI.

### Core Endpoints

- `GET /health` - service health check
- `POST /api/v1/documents/generate/:documentType` - generate a document PDF
- `GET /api/v1/documents` - list available/generated documents
- `GET /api/v1/documents/:id` - fetch a document by ID
- `GET /api/v1/documents/auth-test` - auth guard verification endpoint

> Most `/api/v1/documents/*` endpoints require a valid JWT token.

---

## Architecture

### High-Level Flow

```text
Client (Web/App/Postman)
        |
        v
 Express API (src/app.ts)
  - helmet / cors / compression
  - JSON parsers
  - global rate limiter
  - request logger
        |
        v
 Route Layer (src/routes -> /api/v1/documents)
        |
        v
 Document Module
  - controllers
  - services
  - validators
  - generators/templates
  - repository/model
        |
        v
 MongoDB (metadata/persistence) + PDF stream response
```

### Request Processing Pipeline

1. Request enters Express middleware stack.
2. Security, CORS, parsing, and rate limiting are applied.
3. JWT middleware validates protected routes.
4. Controller delegates business logic to service layer.
5. Document generator builds PDF based on template type and payload.
6. API streams response or returns structured error via centralized error handler.

---

## Project Structure

```text
AMS-DOC-Service/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── swagger.ts
│   ├── docs/swagger/
│   │   ├── definition.ts
│   │   ├── components.ts
│   │   ├── routes/
│   │   └── examples/
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── requestLogger.middleware.ts
│   ├── modules/document/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── generators/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── routes/
│   ├── types/
│   └── utils/
├── tests/
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
├── tsup.config.ts
└── package.json
```

---

## Security Notes

- JWT authentication is enforced for document module routes.
- Rate limiting helps protect against abuse and burst traffic.
- CORS policy is dynamic and environment-aware.
- Production startup fails fast for insecure or invalid configuration.
- `helmet` is enabled for secure HTTP headers.

---

## Testing and Code Quality

```bash
# Tests
npm test

# Lint
npm run lint

# Type checking
npm run typecheck

# Formatting
npm run format
```

Recommended pre-merge workflow:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`

---

## Contributing

1. Fork the repository.
2. Create a branch:

   ```bash
   git checkout -b feature/my-change
   ```

3. Install dependencies and run dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Make your changes and validate quality checks:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

5. Commit, push, and open a pull request.

---

## License

This project is private. All rights reserved by [MetaUpSpace](https://github.com/metaupspace).

