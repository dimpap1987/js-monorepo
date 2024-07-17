# Install dependencies only when needed
FROM node:21-alpine3.18 as deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++ alpine-sdk && rm -rf /var/cache/apk/*
WORKDIR /usr/src/app
COPY .npmrc dist/apps/next-app/package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Production image, copy all the files and run next
FROM node:21-alpine3.18 as runner
RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /usr/src/app

COPY --from=deps --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /usr/src/app/package.json ./package.json
COPY --chown=nextjs:nodejs dist/apps/next-app/public ./public
COPY --chown=nextjs:nodejs dist/apps/next-app/.next ./.next

USER nextjs
EXPOSE 3000


CMD ["dumb-init", "node_modules/.bin/next", "start"]
