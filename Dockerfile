# syntax=docker/dockerfile:1

# ---- Dependencies (full) ----
# Install ALL deps (including dev) needed for prisma generate + nest build
FROM oven/bun:1.3.14 AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---- Production dependencies ----
# Minimal node_modules with only runtime deps for the runner stage
FROM oven/bun:1.3.14 AS prod-deps
WORKDIR /app

# --omit=peer prevents @prisma/client from pulling prisma CLI + typescript as peer deps
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --omit=peer

# Prune Prisma WASM query compilers — keep only postgresql (saves ~57 MB)
RUN rm -f node_modules/@prisma/client/runtime/*.cockroachdb.wasm* \
    && rm -f node_modules/@prisma/client/runtime/*.mysql.wasm* \
    && rm -f node_modules/@prisma/client/runtime/*.sqlite.wasm* \
    && rm -f node_modules/@prisma/client/runtime/*.sqlserver.wasm*

# ---- Builder ----
FROM oven/bun:1.3.14 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bunx prisma generate && bun run build

# ---- Runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Production node_modules only (already cleaned in prod-deps stage)
COPY --from=prod-deps /app/node_modules ./node_modules

# Compiled output
COPY --from=builder /app/dist ./dist
# Entrypoint for Docker secrets → env vars
COPY --chmod=755 scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
