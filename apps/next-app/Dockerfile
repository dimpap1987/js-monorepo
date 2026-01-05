# Install dependencies and build the source code
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

# Declare build arguments
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY

# Set environment variables from build arguments
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY}

ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm build:next

# Production image
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder stage
COPY --chown=nextjs:nodejs --from=builder /usr/src/app/dist/apps/next-app/package.json ./
COPY --chown=nextjs:nodejs --from=builder /usr/src/app/.npmrc ./

# Install production dependencies
RUN pnpm install --prod --ignore-scripts

# Copy the built application
COPY --chown=nextjs:nodejs --from=builder /usr/src/app/dist/apps/next-app/ ./

# Use the non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
