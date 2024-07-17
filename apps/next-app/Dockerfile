# Install dependencies only when needed
FROM docker.io/node:20.10.0-alpine as deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
ENV NODE_TLS_REJECT_UNAUTHORIZED 0
WORKDIR /usr/src/app
COPY .npmrc dist/apps/next-app/package*.json ./
RUN npm install --omit=dev
RUN npx nx build next-app --prod

# Production image, copy all the files and run next
FROM docker.io/node:20.10.0-alpine as runner
ENV HOST 0.0.0.0
ENV PORT 3000
ENV NODE_ENV production

WORKDIR /usr/src/app
RUN addgroup --system frontend && \
    adduser --system -G frontend frontend

    # Create the public and public/_next directories
RUN mkdir -p /usr/src/app/public /usr/src/app/public/_next
RUN chown -R frontend:frontend /usr/src/app/public /usr/src/app/public/_next

COPY --chown=frontend:frontend --from=deps /usr/src/app/dist/apps/next-app/build/standalone/apps/next-app ./
COPY --chown=frontend:frontend --from=deps /usr/src/app/dist/apps/next-app/build/standalone/node_modules ./node_modules
COPY --chown=frontend:frontend --from=deps /usr/src/app/dist/apps/next-app/build/standalone/public ./public
COPY --chown=frontend:frontend --from=deps /usr/src/app/dist/apps/next-app/build/static ./public/_next

EXPOSE 3000

CMD HOSTNAME="0.0.0.0" node server.js
