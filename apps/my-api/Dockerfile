# Build stage
FROM node:21-alpine3.18 AS builder

WORKDIR /usr/src/app

COPY package*.json .npmrc ./
RUN npm ci

COPY . .
COPY libs/prisma/db/src/lib/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema

RUN npm run build:my-api


# Production stage
FROM node:21-alpine3.18 AS runner

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
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/dist/apps/my-api/package*.json ./

# Install production dependencies
RUN npm install --omit=dev --ignore-scripts

# Copy Prisma files
COPY --chown=nestjs:nodejs --from=builder /usr/src/app/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema

RUN chown -R nestjs:nodejs ./node_modules/@prisma && \
    chown -R nestjs:nodejs ./node_modules/.prisma

USER nestjs

EXPOSE 3333

CMD [ "node", "main.js" ]