#!/usr/bin/env sh
set -e

# wait for postgres tcp: postgres:5432
echo "waiting postgres tcp: postgres:5432"
for i in $(seq 1 60); do
  nc -z postgres 5432 && break
  [ $i -eq 60 ] && echo "postgres not ready" && exit 1
  sleep 1
done

pnpm prisma:generate
# use prisma migrate deploy database
npx prisma migrate deploy

if [ "${USE_PM2:-false}" = "true" ]; then
  pm2 startOrReload deploy/pm2/dev.json
  exec pm2 logs --raw
else
  exec node dist/src/main.js
fi