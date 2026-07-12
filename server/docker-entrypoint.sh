#!/bin/sh
set -e

echo "Applying database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "Seeding demo data (idempotent — safe to run on every start)..."
  node dist/prisma/seed.js
else
  echo "Skipping seed (SEED_ON_START=$SEED_ON_START)"
fi

echo "Starting TransitOps API..."
exec "$@"
