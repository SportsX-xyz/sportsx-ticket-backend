# README

## .env

.env is for vars not often changed, like port, throttler config, etc.

.env.[mode] is for vars often changed, like db url, privy app id, etc.

## Deploy

### Deploy steps

1. git pull
2. pnpm install
3. pnpm prisma:generate
4. pnpm run build
5. npx dotenv -e .env.production prisma migrate deploy
6. start service

### Start service using pm2

pm2 startOrReload deploy/pm2/dev.json

### Start service using node

NODE_ENV=production node dist/src/main.js
