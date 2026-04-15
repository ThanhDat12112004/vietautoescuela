# Architecture Overview

## Service boundaries

- `user-service`: account lifecycle, auth tokens, RBAC and premium payment requests
- `quiz-service`: quizzes, categories, attempts, grading
- `materials-service`: material topics, subject-based and tier-based access
- `media-service`: upload/download static assets and PDFs
- `stats-service`: leaderboard and dashboard aggregates
- `api-gateway`: auth propagation, rate limiting, routing

## Data flow

1. Client calls `api-gateway`.
2. Gateway validates auth and forwards to service.
3. Services read/write MySQL.
4. Media payloads are stored by `media-service`.
5. Aggregated stats are read through `stats-service`.

## Frontend architecture

- Route layer in `apps/web/src/app`
- Feature-first modules in `apps/web/src/features`
- API adapters in `features/*/api`
- UI shared components in `apps/web/src/components`
- i18n dictionaries in `packages/i18n`
