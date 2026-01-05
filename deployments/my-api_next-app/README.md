# HOW TO RUN

## BUILD CLIENT

1. npm run build:next
2. docker build -t dimpap/next-app:1.0.100 -f apps/next-app/Dockerfile .

**_ IMPORTANT _**
Before you build the image you need to set .env in `apps/next-app/.env`

```.env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## BUILD API

1. npm run build:my-api
2. docker build -t dimpap/my-api:1.0.100 -f apps/my-api/Dockerfile .
