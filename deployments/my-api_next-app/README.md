# HOW TO RUN

## BUILD CLIENT

1. npm run build:next
2. docker build \
    -f apps/next-app/Dockerfile \
    --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
  --build-arg NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY} \
    -t next-app:dev .

**_ IMPORTANT _**
Before you build the image you need to set .env in `apps/next-app/.env`

```.env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## BUILD API

1. npm run build:my-api
2. docker build -f apps/my-api/Dockerfile -t my-api:dev .
