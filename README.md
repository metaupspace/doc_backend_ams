# Document Generation Service (AMS DOC Backend)

Production-ready document generation backend for AMS — generates PDF documents, streams responses, and exposes JWT-protected endpoints and OpenAPI documentation.

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Install](#install)
- [Environment variables](#environment-variables)
- [Run & Development](#run--development)
- [Docker](#docker)
- [API docs](#api-docs)
- [Project structure](#project-structure)
- [Testing & Linting](#testing--linting)
- [Contributing](#contributing)
- [License](#license)

## Features
- Generate a variety of printable documents (letters, certificates, reports)
- Stream PDF responses to clients
- JWT-based authentication for protected endpoints
- Rate limiting, request logging, and security hardening (helmet)
- OpenAPI (Swagger) documentation

## Tech stack
- Node.js (TypeScript)
- Express
- MongoDB / Mongoose
- PDF generation via `pdf-lib` / `pdfkit`
- Swagger docs via `swagger-jsdoc` + `swagger-ui-express`
- Testing with `tsx --test`

## Prerequisites
- Node.js >= 18
- npm (or yarn)
- MongoDB (local or hosted)
- Docker & docker-compose (optional, recommended for production-like runs)

## Install
1. Clone the repo

```bash
git clone https://github.com/metaupspace/doc_backend_ams.git
cd doc_backend_ams
```

2. Install dependencies

```bash
npm install
```

## Environment variables
Create a `.env` in the project root (see `.env.example` if available). The main environment variables used by the service are:

- `NODE_ENV` — `development` | `production` (default: `development`)
- `PORT` — TCP port the app listens on (default: `3000`)
- `DATABASE_URL` — MongoDB connection string (default: `mongodb://localhost:27017/doc-gen-service`)
- `JWT_SECRET` — Secret used to sign/verify JWT tokens (required in production; min 32 chars)
- `LOG_LEVEL` — Logging level for Winston (default: `info`)
- `CORS_ORIGIN` — Comma-separated list of allowed CORS origins (optional)
- `ENABLE_API_DOCS` — `1|true` to enable Swagger UI (defaults to true in non-production)
- `EXPOSE_OPENAPI_JSON` — `1|true` to expose `/openapi.json` (defaults to true in non-production)

Notes:
- In production `JWT_SECRET` must be set and at least 32 characters long. The app validates this on start.
- `CORS_ORIGIN` when empty allows non-browser and server-to-server calls in non-production, but in production you should set explicit origins.

## Run & Development

- Development (auto-reload):

```bash
npm run dev
```

- Build:

```bash
npm run build
```

- Start (production build):

```bash
npm run start
```

## Docker
This repo includes a `Dockerfile` and `docker-compose.yml`. To build and run with Docker:

```bash
docker-compose up --build
```

This will start the app and a database service (as defined in `docker-compose.yml`).

## API docs
- When `ENABLE_API_DOCS` is enabled (default in dev), the Swagger UI is served at `/api-docs`.
- The raw OpenAPI JSON is available at `/openapi.json` when `EXPOSE_OPENAPI_JSON` is enabled.

Example endpoints:
- `GET /health` — health check
- `POST /api/generate` — generate a document (see docs for payloads and examples)

## Project structure
Top-level layout (important folders/files):

- `src/app.ts` — Express app setup (middleware, routes, swagger)
- `src/server.ts` — server bootstrap and DB connection
- `src/config/` — configuration (env, db, swagger, logger)
- `src/modules/document/` — document-related controllers, services, generators, templates
- `src/routes/` — route wiring
- `src/middlewares/` — auth, error handling, rate limiting, logging
- `src/docs/` — Swagger/OpenAPI definitions and examples
- `tests/` — unit/integration tests

The code aims to keep concerns separated: controllers handle request/response, services contain business logic, generators produce PDF output.

## Testing & Linting
- Run tests:

```bash
npm test
```

- Lint:

```bash
npm run lint
```

- Type check:

```bash
npm run typecheck
```

- Format:

```bash
npm run format
```