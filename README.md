# Commerce API (NestJS + Prisma)

A modular NestJS backend for user, product, and order management with PostgreSQL (Prisma), JWT authentication, and a simple recommendation engine.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env.development` (and `.env.production` if needed) with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
PORT=3000
API_URL=http://localhost:3000
GLOBAL_PREFIX=api
CORS=http://localhost:4200
JWT_ACCESS_TOKEN_SECRET=your-admin-secret
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_CLIENT_ACCESS_TOKEN_SECRET=your-client-secret
JWT_CLIENT_ACCESS_TOKEN_EXPIRY=1h
RATE_LIMIT=100
```

### 3. Generate Prisma Client & Apply Schema

```bash
pnpm run prisma:generate
pnpm run prisma:migrate:dev --name init
```

### 4. Run the App

```bash
# development
pnpm run start:dev
```

Visit Swagger UI at `http://localhost:3000/api/docs`.

## Testing

```bash
# unit tests
pnpm run test

# coverage
pnpm run test:cov
```

Tests cover auth token handling, order helper logic, and recommendation edge cases.

## Docker (optional)

Add a Dockerfile and docker-compose.yml if containerized deployment is required.

## Scripts

See `package.json` for Prisma and testing shortcuts (`prisma:migrate:deploy`, `prisma:studio`, etc.).

## Notes

- Rate limiting and CORS are configured in `src/config.main.ts`.
- Recommendation engine: `GET /products/recommendations/:userId`.
- Ensure PostgreSQL version supports `gen_random_uuid()` or adjust the migration accordingly.
