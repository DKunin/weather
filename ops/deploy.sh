#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN_DIR="${NODE_BIN_DIR:-/home/dekunin/.nvm/versions/node/v24.10.0/bin}"
NPM_BIN="${NPM_BIN:-${NODE_BIN_DIR}/npm}"
PM2_BIN="${PM2_BIN:-${NODE_BIN_DIR}/pm2}"
ENV_FILE="${ENV_FILE:-${APP_DIR}/.env.production}"

export PATH="${NODE_BIN_DIR}:${PATH}"
cd "${APP_DIR}"

if [[ -n "$(git status --short)" ]]; then
  echo "Refusing to deploy a dirty checkout." >&2
  exit 1
fi
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}." >&2
  exit 1
fi
if [[ "$(stat -c '%a' "${ENV_FILE}")" != "600" ]]; then
  echo "${ENV_FILE} must have mode 600." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a
: "${WEATHER_SOCKS_PROXY:?WEATHER_SOCKS_PROXY must not be empty}"
umask 022

git pull --ff-only origin main
"${NPM_BIN}" ci --no-audit --no-fund
"${NPM_BIN}" run check
chmod -R u=rwX,go=rX "${APP_DIR}/dist"

APP_VERSION="$(git rev-parse HEAD)"
export APP_VERSION
"${PM2_BIN}" startOrReload ecosystem.config.cjs --only weather --update-env
"${PM2_BIN}" save

for attempt in {1..20}; do
  health="$(curl --noproxy '*' --fail --silent http://127.0.0.1:4175/healthz 2>/dev/null || true)"
  if [[ "${health}" == *"\"version\":\"${APP_VERSION}\""* ]] && [[ "${health}" == *"\"proxyConfigured\":true"* ]]; then
    printf '%s\n' "${health}"
    exit 0
  fi
  sleep 1
done

echo "Weather did not report revision ${APP_VERSION} with its proxy configured." >&2
exit 1
