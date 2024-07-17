# Install dependencies only when needed
FROM node:21-alpine3.18

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3333

COPY package*.json ./

RUN npm install --ignore-scripts

RUN addgroup --system nestjs && \
    adduser --system -G nestjs nestjs

COPY node_modules/.prisma node_modules/.prisma

COPY dist/apps/my-api ./

RUN chown -R nestjs:nestjs .

USER nestjs

EXPOSE 3333

CMD [ "node", "main.js" ]