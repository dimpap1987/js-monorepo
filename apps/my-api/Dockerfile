# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
COPY libs/prisma/db/src/lib/prisma ./prisma
RUN pnpm prisma generate --schema=./prisma/schema

RUN pnpm build:my-api


# Production stage
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG DIRECT_URL
ENV DIRECT_URL=$DIRECT_URL

ENV NODE_ENV=production
ENV PORT=3333

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application from builder stage
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/dist/apps/my-api ./
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/dist/apps/my-api/package.json ./

# Install production dependencies
RUN pnpm install --prod --ignore-scripts

# Copy Prisma files
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/prisma ./prisma
RUN pnpm prisma generate --schema=./prisma/schema

RUN mkdir -p /usr/src/app/logs && \
    chown -R nestjs:nodejs /usr/src/app/logs && \
    chown -R nestjs:nodejs ./node_modules/.pnpm/@prisma* 2>/dev/null || true && \
    chown -R nestjs:nodejs ./node_modules/@prisma 2>/dev/null || true

USER nestjs

EXPOSE 3333

CMD [ "node", "main.js" ]
