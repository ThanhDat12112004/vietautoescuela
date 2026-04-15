# Runbook

## Start local stack

```bash
npm install
cp .env.example .env
npm run dev
```

## Reset database

```bash
npm run db:reset
```

## Production-style start

```bash
npm run build
npm run start
```

## Docker deployment

```bash
docker compose up -d --build
docker compose logs -f
```

## Health checks

- Gateway: `GET /health`
- User service: `GET /health`
- Quiz service: `GET /health`
- Materials service: `GET /health`
- Stats service: `GET /health`
- Media service: `GET /health`
