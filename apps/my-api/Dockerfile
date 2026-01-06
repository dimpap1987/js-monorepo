# Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
COPY libs/prisma/db/src/lib/prisma ./prisma
RUN pnpm prisma generate --schema=./prisma/schema

RUN pnpm build:my-api

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy built application
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/dist/apps/my-api ./
# Copy node_modules directly (Contains the generated Prisma binaries)
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/node_modules ./node_modules
# Copy schema for migrations
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3333

USER nestjs

EXPOSE 3333

CMD [ "node", "main.js" ]
