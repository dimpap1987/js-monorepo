# HOW TO RUN

## BUILD CLIENT

1. npm run build:next
2. docker build -t dimpap/next-app:1.0.100 -f apps/next-app/Dockerfile .

**_ IMPORTANT _**
Before you build the image you need to set .env in `apps/next-app/.env`

```.env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_AUTH_URL=http://localhost:80                         ##  Replace with your domain
NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL=ws://localhost:80/presence    ## Replace with your domain
```

## BUILD API

1. npm run build:my-api
2. docker build -t dimpap/my-api:1.0.100 -f apps/my-api/Dockerfile .
