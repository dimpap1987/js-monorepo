# ==========================================
# STAGE 1: The Builder (Heavy)
# ==========================================
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

# Copy root monorepo config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source and generate Prisma
COPY . .
RUN pnpm prisma generate --config=libs/prisma/bibikos-db/prisma.config.ts
# Build the API (this also generates the pruned package.json)
RUN pnpm build:bibikos-api

# ==========================================
# STAGE 2: The Pruner (Clean Slate + Prisma)
# ==========================================
FROM node:20-alpine AS pruner
RUN apk add --no-cache openssl # Prisma needs openssl to generate engines
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/apps/bibikos-api/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./

RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts

# 2. COPY the Prisma schema and GENERATE the client
# This creates the missing '.prisma/client/default' module
COPY --from=builder /usr/src/app/libs/prisma/bibikos-db/src/lib/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema

# ==========================================
# STAGE 3: The Runner
# ==========================================
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /usr/src/app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy the PRUNED node_modules (which now includes the generated .prisma folder)
COPY --chown=nestjs:nodejs --from=pruner /usr/src/app/node_modules ./node_modules
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/dist/apps/bibikos-api ./
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/libs/prisma/bibikos-db/src/lib/prisma ./prisma

ENV NODE_ENV=production

USER nestjs
EXPOSE 3333
CMD [ "node", "main.js" ]