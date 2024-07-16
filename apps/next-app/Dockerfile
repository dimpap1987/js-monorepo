# Production image, copy all the files and run next
FROM node:21-alpine3.18 as runner
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /usr/src/app
# Copy the node_modules folder from the GitHub Actions workflow
COPY ./node_modules ./node_modules
COPY dist/apps/next-app/public ./public
COPY dist/apps/next-app/.next ./.next
RUN chown -R node:node .
USER node
EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED=1
