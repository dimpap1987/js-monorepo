FROM node:22

WORKDIR /app

# Copy Prisma schema, migrations and config
COPY libs/prisma/db/src/lib/prisma/schema ./src/lib/prisma/schema
COPY libs/prisma/db/src/lib/prisma/migrations ./src/lib/prisma/migrations
COPY libs/prisma/db/prisma.config.ts ./prisma.config.ts
COPY libs/prisma/run_migrations/wait-for-postgres.sh ./wait-for-postgres.sh
RUN chmod +x ./wait-for-postgres.sh

# Install dependencies
RUN npm install -g prisma@7 dotenv

RUN apt update && apt --assume-yes install postgresql-client dos2unix
RUN dos2unix ./wait-for-postgres.sh

CMD sh ./wait-for-postgres.sh ${DB_HOST} ${DATABASE_USER} ${DATABASE_DB} npx prisma migrate deploy --config=prisma.config.ts
