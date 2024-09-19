
## BUILD NEXT-JS APP
docker build -t dimpap/next-app:1.0.100 -f apps/next-app/Dockerfile .

## BUILD API
docker build -t dimpap/my-api:1.0.100 -f apps/my-api/Dockerfile .
