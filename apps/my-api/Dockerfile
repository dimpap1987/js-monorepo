# Install dependencies only when needed
FROM node:21-alpine3.18 as deps

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

# Install app dependencies
# RUN npm install --omit=dev --ignore-scripts

COPY dist/apps/my-api ./

CMD [ "node", "main.js" ]

