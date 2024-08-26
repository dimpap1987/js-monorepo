FROM node:21-alpine3.18

WORKDIR /usr/src/app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG DIRECT_URL
ENV DIRECT_URL=$DIRECT_URL

ENV NODE_ENV=production
ENV PORT=3333

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY --chown=nestjs:nodejs dist/apps/my-api/package*.json ./

RUN npm install --omit=dev --ignore-scripts

COPY --chown=nestjs:nodejs dist/apps/my-api ./
COPY --chown=nestjs:nodejs libs/prisma/db/src/lib/prisma ./prisma

RUN npx prisma generate --schema=./prisma/schema
# Ensure permissions are set for .prisma directory
RUN chown -R nestjs:nodejs ./node_modules/.prisma

USER nestjs

EXPOSE 3333

CMD [ "node", "main.js" ]