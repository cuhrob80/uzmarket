# UzMarket

Production-oriented monorepo foundation for UzMarket.

## Requirements

- Node.js 24 LTS and npm 11
- Docker with Docker Compose

## Local setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp database/docker/.env.example database/docker/.env
npm ci
npm run db:up
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:3000`. Backend health:
`http://localhost:3001/api/v1/health`.

## Quality

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run audit
```

Backend tests require PostgreSQL. Schema synchronization and automatic migration
execution are disabled; all future schema changes must use explicit migrations.
