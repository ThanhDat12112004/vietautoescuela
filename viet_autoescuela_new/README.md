# Viet Autoescuela New

Monorepo clean architecture cho hệ thống học và luyện thi bằng lái xe Tây Ban Nha.

## Monorepo structure

- `apps/web`: Next.js App Router frontend
- `apps/api-gateway`: gateway cho toàn bộ backend services
- `services/user-service`: auth, profile, RBAC, premium flows
- `services/quiz-service`: quiz catalog, quiz take, attempts
- `services/materials-service`: materials catalog, access tier
- `services/media-service`: upload/static media
- `services/stats-service`: leaderboard và analytics
- `packages/shared-types`: domain types dùng chung
- `packages/shared-utils`: utility dùng chung
- `packages/i18n`: i18n resources/config typed
- `infra`: mysql init, docs, scripts vận hành

## i18n strategy

- Supported locales: `vi`, `es`, `en`
- Next middleware redirect mặc định về `/{locale}`
- Locale-aware routing tại `apps/web/src/app/[locale]/[[...slug]]`
- Shared dictionaries tại `packages/i18n`

## Local development

1. Cài dependencies

```bash
npm install
```

2. Tạo `.env` từ `.env.example`

```bash
cp .env.example .env
```

3. Chạy toàn bộ stack

```bash
npm run dev
```

## Docker

```bash
docker compose up --build
```

## Quality gates

- `npm run lint`
- `npm run test`
- `npm run build`

Pipeline CI tại `.github/workflows/ci.yml`.
