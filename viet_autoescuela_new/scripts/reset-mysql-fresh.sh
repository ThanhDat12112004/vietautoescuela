#!/usr/bin/env bash
# Xóa sạch database (DROP DATABASE) rồi tạo lại + import infra/mysql/init.sql (schema + seed mẫu).
# Không dùng migration từng phần — mỗi lần chạy là DB mới đúng với init.sql.
#
# Đọc biến từ .env ở thư mục gốc repo (nếu có); mặc định giống .env.example.
#
# Cách dùng:
#   bash scripts/reset-mysql-fresh.sh              # mysql client, hoặc tự dùng docker nếu có vietauto-mysql
#   bash scripts/reset-mysql-fresh.sh --docker     # docker exec (VIETAUTO_MYSQL_CONTAINER), user root
#
# Cần quyền DROP DATABASE / CREATE DATABASE (thường dùng user root như .env.example).
#
# Docker xóa cả volume (dữ liệu trên disk của container): stop container rồi
#   docker volume rm <tên_volume_mysql>
#   sau đó chạy lại image (init trong /docker-entrypoint-initdb.d chỉ chạy lần đầu khi volume trống).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INIT_SQL="$ROOT/infra/mysql/init.sql"

if [[ ! -f "$INIT_SQL" ]]; then
  echo "Không thấy $INIT_SQL" >&2
  exit 1
fi

USE_DOCKER=0
if [[ "${1:-}" == "--docker" || "${1:-}" == "-d" ]]; then
  USE_DOCKER=1
elif [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage:
  bash scripts/reset-mysql-fresh.sh           # mysql client, hoặc tự docker exec nếu có container
  bash scripts/reset-mysql-fresh.sh --docker  # bắt buộc docker exec

Biến: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE,
      VIETAUTO_MYSQL_CONTAINER, MYSQL_ROOT_PASSWORD (khi --docker)
EOF
  exit 0
fi

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT/.env"
  set +a
fi

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-root}"
MYSQL_DATABASE="${MYSQL_DATABASE:-viet_acosla}"
VIETAUTO_MYSQL_CONTAINER="${VIETAUTO_MYSQL_CONTAINER:-vietauto-mysql}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-$MYSQL_PASSWORD}"

run_sql_file() {
  local file="$1"
  if [[ "$USE_DOCKER" -eq 1 ]]; then
    if ! docker ps --format '{{.Names}}' | grep -qx "$VIETAUTO_MYSQL_CONTAINER"; then
      echo "Không thấy container đang chạy: $VIETAUTO_MYSQL_CONTAINER" >&2
      exit 1
    fi
    docker exec -i "$VIETAUTO_MYSQL_CONTAINER" \
      mysql -uroot -p"$MYSQL_ROOT_PASSWORD" \
      --default-character-set=utf8mb4 \
      "$MYSQL_DATABASE" < "$file"
  else
    if ! command -v mysql >/dev/null 2>&1; then
      echo "Cần lệnh mysql (client) hoặc container $VIETAUTO_MYSQL_CONTAINER đang chạy." >&2
      exit 1
    fi
    mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
      --default-character-set=utf8mb4 \
      "$MYSQL_DATABASE" < "$file"
  fi
}

# DROP + CREATE database (xóa toàn bộ bảng và dữ liệu cũ, không chỉ các bảng trong init.sql).
reset_database() {
  local drop_create
  drop_create="$(
    printf 'DROP DATABASE IF EXISTS `%s`;
CREATE DATABASE `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
' "$MYSQL_DATABASE" "$MYSQL_DATABASE"
  )"
  if [[ "$USE_DOCKER" -eq 1 ]]; then
    if ! docker ps --format '{{.Names}}' | grep -qx "$VIETAUTO_MYSQL_CONTAINER"; then
      echo "Không thấy container đang chạy: $VIETAUTO_MYSQL_CONTAINER" >&2
      exit 1
    fi
    docker exec -i "$VIETAUTO_MYSQL_CONTAINER" \
      mysql -uroot -p"$MYSQL_ROOT_PASSWORD" \
      --default-character-set=utf8mb4 \
      -e "$drop_create"
  else
    mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
      --default-character-set=utf8mb4 \
      -e "$drop_create"
  fi
}

if [[ "$USE_DOCKER" -eq 0 ]]; then
  if command -v mysql >/dev/null 2>&1; then
    :
  elif command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$VIETAUTO_MYSQL_CONTAINER"; then
    echo ">>> Không có mysql client; dùng docker exec → $VIETAUTO_MYSQL_CONTAINER"
    USE_DOCKER=1
  else
    echo "Cần mysql client, hoặc container Docker $VIETAUTO_MYSQL_CONTAINER đang chạy, hoặc: $0 --docker" >&2
    exit 1
  fi
fi

if [[ "$USE_DOCKER" -eq 1 ]]; then
  if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$VIETAUTO_MYSQL_CONTAINER"; then
    echo "Chưa thấy container đang chạy: $VIETAUTO_MYSQL_CONTAINER" >&2
    exit 1
  fi
fi

echo ">>> DROP + CREATE database (xóa sạch): $MYSQL_DATABASE"
reset_database

echo ">>> Import $INIT_SQL"
run_sql_file "$INIT_SQL"

echo ">>> Xong. Admin: user admin / pass Admin123! (sửa trong infra/mysql/init.sql nếu đổi seed)."
