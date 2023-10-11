FROM node:lts-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3333
RUN npm run ts-build
CMD ["node", "/dist/index.js"]