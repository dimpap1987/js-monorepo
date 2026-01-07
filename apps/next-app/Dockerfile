# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY} \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm build:next

# Delete the webpack/swc cache after the build is done
RUN rm -rf dist/apps/next-app/.next/cache
# ------------------------------------

# ==========================================
# STAGE 2: Pruner
# ==========================================
FROM node:20-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/apps/next-app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./

# 1. Create a surgical .npmrc file
# This forces pnpm to only grab the binaries we need for Alpine ARM64
RUN printf "supported-architectures.os=linux\n\
            supported-architectures.cpu=arm64\n\
            supported-architectures.libc=musl\n\
            link-workspace-packages=false" > .npmrc

# 2. Run the install (now without the unsupported flag)
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts --prefer-offline

# 3. Surgical Cleanup of any "GNU" or "Darwin" folders that leaked in
RUN find node_modules/.pnpm -name "*linux-arm64-gnu*" -exec rm -rf {} + && \
    find node_modules/.pnpm -name "*darwin*" -exec rm -rf {} + && \
    find node_modules/.pnpm -name "*win32*" -exec rm -rf {} + && \
    rm -rf node_modules/react-icons && \
    pnpm store prune

# ==========================================
# STAGE 3: Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

COPY --chown=nextjs:nodejs --from=pruner /usr/src/app/node_modules ./node_modules

COPY --chown=nextjs:nodejs --from=builder /usr/src/app/dist/apps/next-app ./

USER nextjs
EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]