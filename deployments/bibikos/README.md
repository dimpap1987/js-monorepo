# HOW TO RUN

## BUILD CLIENT

```zsh
source apps/bibikos-client/.env && docker build \
      -f apps/bibikos-client/Dockerfile \
      --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
      --build-arg NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY} \
      --build-arg NEXT_PUBLIC_EN_DOMAIN=${NEXT_PUBLIC_EN_DOMAIN} \
      --build-arg NEXT_PUBLIC_EL_DOMAIN=${NEXT_PUBLIC_EL_DOMAIN} \
      -t bibikos-app:dev .
```

## BUILD API

```zsh
docker build -f apps/bibikos-api/Dockerfile -t bibikos-api:dev .
```
