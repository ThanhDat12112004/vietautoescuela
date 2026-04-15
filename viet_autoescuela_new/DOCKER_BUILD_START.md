# Docker Build & Start (No Compose)

Run all commands from the project root:

`/Users/devduongthanhdat/frelancer/Bản sao viet_acosla 3.worktrees/viet-autoescola/21h23_03_2025/26_03/vietautoescola`

## 1) Build images

```bash
docker build -f Dockerfile.mysql -t vietauto-mysql .
docker build -f apps/api-gateway/Dockerfile -t vietauto-api-gateway .
docker build -f services/user-service/Dockerfile -t vietauto-user-service .
docker build -f services/quiz-service/Dockerfile -t vietauto-quiz-service .
docker build -f services/media-service/Dockerfile -t vietauto-media-service .
docker build -f services/stats-service/Dockerfile -t vietauto-stats-service .
docker build -f services/materials-service/Dockerfile -t vietauto-materials-service .
docker build -f Dockerfile.frontend -t vietauto-frontend .
```

## 2) Create network

```bash
docker network create vietauto-net || true
```

## 3) Start MySQL

```bash
docker run -d \
  --name vietauto-mysql \
  --network vietauto-net \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=viet_acosla \
  -p 3306:3306 \
  -v vietauto_mysql_data:/var/lib/mysql \
  vietauto-mysql
```

## 4) Start backend services

```bash
docker run -d --name vietauto-user-service --network vietauto-net --env-file .env -e MYSQL_HOST=vietauto-mysql -p 4003:4003 vietauto-user-service
docker run -d --name vietauto-quiz-service --network vietauto-net --env-file .env -e MYSQL_HOST=vietauto-mysql -p 4001:4001 vietauto-quiz-service
docker run -d --name vietauto-media-service --network vietauto-net --env-file .env -e MYSQL_HOST=vietauto-mysql -e MEDIA_STORAGE_DIR=/app/services/media-service/storage -p 4002:4002 -v vietauto_media_storage:/app/services/media-service/storage vietauto-media-service
docker run -d --name vietauto-stats-service --network vietauto-net --env-file .env -e MYSQL_HOST=vietauto-mysql -p 4004:4004 vietauto-stats-service
docker run -d --name vietauto-materials-service --network vietauto-net --env-file .env -e MYSQL_HOST=vietauto-mysql -p 4005:4005 vietauto-materials-service
```

## 5) Start API gateway

```bash
docker run -d \
  --name vietauto-api-gateway \
  --network vietauto-net \
  --env-file .env \
  -e USER_SERVICE_URL=http://vietauto-user-service:4003 \
  -e QUIZ_SERVICE_URL=http://vietauto-quiz-service:4001 \
  -e MEDIA_SERVICE_URL=http://vietauto-media-service:4002 \
  -e STATS_SERVICE_URL=http://vietauto-stats-service:4004 \
  -e MATERIALS_SERVICE_URL=http://vietauto-materials-service:4005 \
  -p 8080:8080 \
  vietauto-api-gateway
```

## 6) Start frontend

```bash
docker run -d \
  --name vietauto-frontend \
  --network vietauto-net \
  --env-file .env \
  -e NEXT_PUBLIC_API_BASE_URL=http://vietauto-api-gateway:8080 \
  -p 3000:3000 \
  vietauto-frontend
```

## 7) Useful commands

```bash
# list running containers
docker ps

# logs
docker logs -f vietauto-api-gateway
docker logs -f vietauto-frontend

# stop all app containers
docker stop vietauto-frontend vietauto-api-gateway vietauto-materials-service vietauto-stats-service vietauto-media-service vietauto-quiz-service vietauto-user-service vietauto-mysql

# remove all app containers
docker rm -f vietauto-frontend vietauto-api-gateway vietauto-materials-service vietauto-stats-service vietauto-media-service vietauto-quiz-service vietauto-user-service vietauto-mysql
```

## Notes

- Do not run `docker rm -v vietauto-mysql` if you want to keep DB data.
- MySQL data is stored in `vietauto_mysql_data`.
