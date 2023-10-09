# Next-app

## How to dockerize

- project.json
```json
        "production": {
+         "generateLockfile": true
        }
```
- npm install -D @nx-tools/nx-container
- npm exec nx g @nx-tools/nx-container:init {next application} --template next --engine docker

> (source: https://dev.to/sebastiandg7/nx-nextjs-docker-the-nx-way-containerizing-our-application-1mi7)


## How to run the docker container in dev mode

`npm run docker-compose:dev`

## How to run the docker container in prod mode

docker-compose -f docker-compose.prod.yml up -d --build