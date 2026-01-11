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

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm nx build gym-client --prod

# Delete the webpack/swc cache after the build is done
RUN rm -rf dist/apps/gym-client/.next/cache

# ==========================================
# STAGE 2: Pruner
# ==========================================
FROM node:20-alpine AS pruner
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/apps/gym-client/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./

RUN printf "supported-architectures.os=linux\n\
            supported-architectures.cpu=arm64\n\
            supported-architectures.libc=musl\n\
            link-workspace-packages=false" > .npmrc

RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts --prefer-offline

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
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_NAME="FitGym" \
    NEXT_PUBLIC_SITE_URL="http://localhost:4200" \
    NEXT_PUBLIC_SITE_DESCRIPTION="Your fitness journey starts here" \
    NEXT_PUBLIC_EN_DOMAIN="fitgym.com" \
    NEXT_PUBLIC_EL_DOMAIN="fitgym.gr" \
    ANALYZE=false

COPY --chown=nextjs:nodejs --from=pruner /usr/src/app/node_modules ./node_modules
COPY --chown=nextjs:nodejs --from=builder /usr/src/app/dist/apps/gym-client ./

USER nextjs
EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
