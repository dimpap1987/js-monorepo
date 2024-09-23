## BUILD NEXT-JS APP


npm run build:next

Before you build the image you need to set these two in `apps/next-app/.env`

```.env
NEXT_PUBLIC_AUTH_URL=http://localhost:3333
NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL=ws://localhost:3333/presence
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

docker build -t dimpap/next-app:1.0.100 -f apps/next-app/Dockerfile .

## BUILD API

npm run build:my-api

docker build -t dimpap/my-api:1.0.100 -f apps/my-api/Dockerfile .
