
## BUILD NEXT-JS APP

Before you build the image you need to set these two in `apps/next-app/.env`

```.env
NEXT_PUBLIC_AUTH_URL=http://localhost:3333
NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL=ws://localhost:4444/presence
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

docker build -t dimpap/next-app:1.0.100 -f apps/next-app/Dockerfile .

## BUILD API
docker build -t dimpap/my-api:1.0.100 -f apps/my-api/Dockerfile .
