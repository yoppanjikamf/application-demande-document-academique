#!/usr/bin/env sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Applying Prisma migrations..."
  npx prisma migrate deploy
else
  echo "DATABASE_URL not set — skipping prisma migrate deploy"
fi

exec node server.js
