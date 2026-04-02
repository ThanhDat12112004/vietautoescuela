#!/usr/bin/env bash
# Build and push all service images to GitLab Container Registry.
#
# Dùng path lồng: registry.gitlab.com/<group>/<project>/<service>:<tag>
# (mỗi service một "repository" con trong UI GitLab; dễ pull hơn kiểu :frontend là tag trên cùng project.)
#
# Prerequisite:
#   docker login registry.gitlab.com
#
# Usage (from repo root):
#   ./scripts/docker-push-gitlab.sh           # tag mặc định: latest
#   ./scripts/docker-push-gitlab.sh abc1234 # tag = git short SHA / version
#
# Env:
#   GITLAB_REGISTRY — base không có slash cuối: registry.gitlab.com/thanhdat12112004/vietautoescuela
#   INTERNAL_API_BASE_URL — build-arg cho frontend (mặc định http://vietauto-api-gateway:8080)
#   DOCKER_BUILD_PLATFORM — mặc định linux/amd64 (VPS x86). Mac ARM: build mặc định ra arm64 → VPS pull lỗi "no matching manifest for linux/amd64".

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REGISTRY="${GITLAB_REGISTRY:-registry.gitlab.com/thanhdat12112004/vietautoescuela}"
REGISTRY="$(printf '%s' "$REGISTRY" | tr '[:upper:]' '[:lower:]')"
TAG="${1:-latest}"
INTERNAL_API="${INTERNAL_API_BASE_URL:-http://vietauto-api-gateway:8080}"
PLATFORM="${DOCKER_BUILD_PLATFORM:-linux/amd64}"

echo ">> docker-push-gitlab: repo root = ${ROOT}"
echo ">> Kiểm tra Docker..."
command -v docker >/dev/null || { echo "Lỗi: chưa có lệnh docker trong PATH." >&2; exit 1; }

build_push() {
  local component="$1"
  local dockerfile="$2"
  local image="${REGISTRY}/${component}:${TAG}"
  echo "=== ${component} -> ${image} (platform ${PLATFORM}) ==="
  docker buildx build \
    --platform "$PLATFORM" \
    -f "$dockerfile" \
    -t "$image" \
    --push \
    .
}

echo "Registry base: ${REGISTRY}"
echo "Image tag: ${TAG}"
echo "Platform: ${PLATFORM}"
echo ""

# Bật từng dòng khi cần push image tương ứng:
# build_push mysql Dockerfile.mysql
# build_push api-gateway apps/api-gateway/Dockerfile
# build_push user-service services/user-service/Dockerfile
# build_push quiz-service services/quiz-service/Dockerfile
# build_push media-service services/media-service/Dockerfile
# build_push stats-service services/stats-service/Dockerfile
# build_push materials-service services/materials-service/Dockerfile

FE_IMAGE="${REGISTRY}/frontend:${TAG}"
echo "=== frontend -> ${FE_IMAGE} (platform ${PLATFORM}) ==="
docker buildx build \
  --platform "$PLATFORM" \
  -f Dockerfile.frontend \
  --build-arg "INTERNAL_API_BASE_URL=${INTERNAL_API}" \
  -t "$FE_IMAGE" \
  --push \
  .

echo "Done."
