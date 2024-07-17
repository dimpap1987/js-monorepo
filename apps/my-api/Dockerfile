# Install dependencies only when needed
FROM node:21-alpine3.18

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3333

COPY dist/apps/my-api/package*.json ./

RUN npm install --omit=dev --ignore-scripts

RUN addgroup --system nestjs && \
    adduser --system -G nestjs nestjs

# Switch to the nestjs user
USER nestjs

COPY node_modules/.prisma node_modules/.prisma

COPY dist/apps/my-api ./

EXPOSE 3333

CMD [ "node", "main.js" ]