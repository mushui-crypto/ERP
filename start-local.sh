#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/server"
FRONTEND_DIR="$PROJECT_DIR/traewordp"
BACKEND_PID_FILE="$PROJECT_DIR/.backend-local.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend-local.pid"

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "未找到 Node.js/npm，请先安装 Node.js。"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "未找到 python3。"
  exit 1
fi

cd "$BACKEND_DIR"
if [ ! -d node_modules ]; then
  npm install
fi

chmod +x node_modules/.bin/* node_modules/@nestjs/cli/bin/nest.js 2>/dev/null || true
if ! node -e "require('sqlite3')" >/dev/null 2>&1; then
  npm rebuild sqlite3
fi
npm run build

if port_in_use 3001; then
  echo "后端端口 3001 已在使用，跳过启动。"
else
  DB_TYPE=sqlite APP_PORT=3001 nohup node dist/main.js > "$PROJECT_DIR/.backend-local.log" 2>&1 &
  echo $! > "$BACKEND_PID_FILE"
  echo "后端已启动：http://127.0.0.1:3001/api"
fi

if port_in_use 8090; then
  echo "前端端口 8090 已在使用，跳过启动。"
else
  cd "$FRONTEND_DIR"
  nohup python3 -m http.server 8090 --bind 127.0.0.1 > "$PROJECT_DIR/.frontend-local.log" 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"
  echo "前端已启动：http://127.0.0.1:8090"
fi

echo "API 文档：http://127.0.0.1:3001/api/docs"
