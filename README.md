# Next-app

## How to dockerize


- project.json
```json
        "production": {
+         "generateLockfile": true
        }
```
- npm install -D @nx-tools/nx-container
- npm exec nx g @nx-tools/nx-container:init next-app --template next --engine docker

> (source: https://dev.to/sebastiandg7/nx-nextjs-docker-the-nx-way-containerizing-our-application-1mi7)