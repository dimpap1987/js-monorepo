FROM docker.io/node:lts-alpine as deps
RUN apk add --no-cache libc6-compat python3 make g++ alpine-sdk && rm -rf /var/cache/apk/*
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

# Production image, copy all the files and run next
FROM docker.io/node:lts-alpine as runner
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
ENV PORT 3333
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package.json ./package.json
COPY dist/apps/webhook-server .
RUN chown -R node:node .
USER node
EXPOSE 3333
ENV NEXT_TELEMETRY_DISABLED 1
CMD ["dumb-init", "node", "main.js"]