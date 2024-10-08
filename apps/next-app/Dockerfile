# Install dependencies and build the source code
FROM node:lts-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

# Declare build arguments
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL

# Set environment variables from build arguments
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_AUTH_URL=${NEXT_PUBLIC_AUTH_URL}
ENV NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL=${NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL}

ENV NEXT_TELEMETRY_DISABLED=1
# Copy package files and install dependencies
COPY package*.json .npmrc ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build:next

# Production image
FROM node:lts-alpine AS runner
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder stage
COPY --chown=nextjs:nodejs --from=builder /usr/src/app/dist/apps/next-app/package*.json /usr/src/app/.npmrc ./

# Install production dependencies
RUN npm install --omit=dev --ignore-scripts

# Copy the built application
COPY --chown=nextjs:nodejs --from=builder /usr/src/app/dist/apps/next-app/ ./

# Use the non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]