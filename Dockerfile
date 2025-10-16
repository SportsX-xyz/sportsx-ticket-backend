FROM node:20-alpine AS deps
WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY prisma ./prisma
RUN pnpm prisma:generate
COPY . .
RUN mkdir -p .config/solana
COPY .config/solana/id.json .config/solana/id.json
RUN pnpm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
# install netcat-openbsd for healthcheck and startup probe
RUN apk add --no-cache netcat-openbsd curl && corepack enable && pnpm add -g pm2
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.config ./config
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 4000
CMD ["/entrypoint.sh"]
