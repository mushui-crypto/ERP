#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

stop_from_pid_file() {
  local name="$1"
  local pid_file="$2"

  if [ ! -f "$pid_file" ]; then
    echo "$name 没有 PID 记录。"
    return
  fi

  local pid
  pid="$(tr -cd '0-9' < "$pid_file")"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    echo "$name 已停止（PID $pid）。"
  else
    echo "$name 未在运行。"
  fi
  rm -f "$pid_file"
}

stop_from_pid_file "后端" "$PROJECT_DIR/.backend-local.pid"
stop_from_pid_file "前端" "$PROJECT_DIR/.frontend-local.pid"
