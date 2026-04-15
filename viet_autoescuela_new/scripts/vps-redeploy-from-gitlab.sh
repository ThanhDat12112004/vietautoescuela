#!/usr/bin/env bash
# Deploy VPS (Ubuntu): giống flow thủ công — xóa image cũ tag, pull GitLab, tạo network, xóa container, chạy lại.
#
# Chuẩn bị:
#   docker login registry.gitlab.com
#   cd repo_root  # có file .env
#
#   # URL gateway mà trình duyệt gọi được (bắt buộc cho frontend), ví dụ:
#   export DEPLOY_PUBLIC_API_URL="http://14.225.206.191:8080"
#   # hoặc đặt NEXT_PUBLIC_API_BASE_URL=... trong .env
#
#   ./scripts/vps-redeploy-from-gitlab.sh
#   ./scripts/vps-redeploy-from-gitlab.sh v1.0.0   # tag khác latest
#
# Biến tùy chọn:
#   GITLAB_REGISTRY           — mặc định registry.gitlab.com/thanhdat12112004/vietautoescuela
#   ENV_FILE                  — mặc định <repo>/.env
#   DEPLOY_MYSQL_ROOT_PASSWORD — mật khẩu root MySQL trong container (mặc định lấy từ MYSQL_PASSWORD trong .env, không có thì dùng giống bản deploy tay của bạn)
#   DEPLOY_MYSQL_NO_VOLUME=1  — không gắn volume MySQL (mỗi lần chạy DB rỗng; nguy hiểm prod)
#   DEPLOY_PUBLIC_API_URL     — NEXT_PUBLIC_API_BASE_URL runtime cho frontend
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REGISTRY="${GITLAB_REGISTRY:-registry.gitlab.com/thanhdat12112004/vietautoescuela}"
REGISTRY="$(printf '%s' "$REGISTRY" | tr '[:upper:]' '[:lower:]')"
TAG="${1:-latest}"
ENV_FILE="${ENV_FILE:-${ROOT}/.env}"

IMAGES=(
  frontend
  api-gateway
  user-service
  quiz-service
  media-service
  stats-service
  materials-service
  mysql
)

command -v docker >/dev/null || { echo "Lỗi: chưa có docker trong PATH." >&2; exit 1; }

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Lỗi: không thấy ${ENV_FILE}" >&2
  exit 1
fi

# Mật khẩu MySQL (root container + app): ưu tiên biến, sau đó .env, sau đó fallback deploy tay
MYSQL_PW="${DEPLOY_MYSQL_ROOT_PASSWORD:-}"
if [[ -z "$MYSQL_PW" ]]; then
  MYSQL_PW="$(grep -E '^MYSQL_PASSWORD=' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r' || true)"
fi
if [[ -z "$MYSQL_PW" ]]; then
  MYSQL_PW="vietautoescuela_admin@2026"
fi

# URL API công khai cho browser (Next chỉ đọc NEXT_PUBLIC_* ở build; vẫn set runtime nếu image/entrypoint dùng)
PUBLIC_API="${DEPLOY_PUBLIC_API_URL:-}"
if [[ -z "$PUBLIC_API" ]]; then
  PUBLIC_API="$(grep -E '^NEXT_PUBLIC_API_BASE_URL=' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r' || true)"
fi
if [[ -z "$PUBLIC_API" ]]; then
  echo "Lỗi: đặt DEPLOY_PUBLIC_API_URL hoặc NEXT_PUBLIC_API_BASE_URL trong .env (vd: http://IP-VPS:8080)" >&2
  exit 1
fi

MYSQL_VOL_ARGS=(-v vietauto_mysql_data:/var/lib/mysql)
if [[ "${DEPLOY_MYSQL_NO_VOLUME:-0}" == "1" ]]; then
  MYSQL_VOL_ARGS=()
fi

echo "🚀 VietAuto Deploy — registry=${REGISTRY} tag=${TAG}"

echo "🗑  Gỡ image cũ (tag ${TAG})..."
for img in "${IMAGES[@]}"; do
  docker rmi -f "${REGISTRY}/${img}:${TAG}" 2>/dev/null || true
done

echo "📦 Pull image..."
for img in "${IMAGES[@]}"; do
  docker pull "${REGISTRY}/${img}:${TAG}"
done

echo "🌐 Network vietauto-net..."
docker network create vietauto-net 2>/dev/null || true

echo "🗑  Xóa container cũ..."
for c in vietauto-mysql vietauto-user-service vietauto-quiz-service vietauto-media-service \
         vietauto-stats-service vietauto-materials-service vietauto-api-gateway vietauto-frontend; do
  docker rm -f "$c" 2>/dev/null || true
done

echo "🛢  MySQL..."
docker run -d \
  --name vietauto-mysql \
  --network vietauto-net \
  -e MYSQL_ROOT_PASSWORD="${MYSQL_PW}" \
  -e MYSQL_DATABASE=viet_acosla \
  -p 3306:3306 \
  "${MYSQL_VOL_ARGS[@]}" \
  "${REGISTRY}/mysql:${TAG}"

echo "⏳ Đợi MySQL (10s)..."
sleep 10

COMMON_ENV=(--env-file "$ENV_FILE" -e MYSQL_HOST=vietauto-mysql -e MYSQL_PASSWORD="${MYSQL_PW}")

echo "👤 User Service..."
docker run -d --name vietauto-user-service --network vietauto-net "${COMMON_ENV[@]}" -p 4003:4003 "${REGISTRY}/user-service:${TAG}"

echo "📝 Quiz Service..."
docker run -d --name vietauto-quiz-service --network vietauto-net "${COMMON_ENV[@]}" -p 4001:4001 "${REGISTRY}/quiz-service:${TAG}"

echo "🖼 Media Service..."
docker run -d --name vietauto-media-service --network vietauto-net "${COMMON_ENV[@]}" \
  -e MEDIA_STORAGE_DIR=/app/services/media-service/storage \
  -v vietauto_media_storage:/app/services/media-service/storage \
  -p 4002:4002 \
  "${REGISTRY}/media-service:${TAG}"

echo "📊 Stats Service..."
docker run -d --name vietauto-stats-service --network vietauto-net "${COMMON_ENV[@]}" -p 4004:4004 "${REGISTRY}/stats-service:${TAG}"

echo "📚 Materials Service..."
docker run -d --name vietauto-materials-service --network vietauto-net "${COMMON_ENV[@]}" -p 4005:4005 "${REGISTRY}/materials-service:${TAG}"

echo "🌉 API Gateway..."
docker run -d --name vietauto-api-gateway --network vietauto-net "${COMMON_ENV[@]}" \
  -e USER_SERVICE_URL=http://vietauto-user-service:4003 \
  -e QUIZ_SERVICE_URL=http://vietauto-quiz-service:4001 \
  -e MEDIA_SERVICE_URL=http://vietauto-media-service:4002 \
  -e STATS_SERVICE_URL=http://vietauto-stats-service:4004 \
  -e MATERIALS_SERVICE_URL=http://vietauto-materials-service:4005 \
  -p 8080:8080 \
  "${REGISTRY}/api-gateway:${TAG}"

echo "🎨 Frontend..."
docker run -d --name vietauto-frontend --network vietauto-net \
  -e NEXT_PUBLIC_API_BASE_URL="${PUBLIC_API}" \
  -p 3000:3000 \
  "${REGISTRY}/frontend:${TAG}"

echo "✅ Xong. docker ps — Web :3000 | Gateway :8080/health"
