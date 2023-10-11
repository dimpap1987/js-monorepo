FROM node:lts-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3333
RUN npx tsc --build
CMD ["node", "/dist/index.js"]