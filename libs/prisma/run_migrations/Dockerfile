FROM node:21

WORKDIR /app

COPY db/src/lib/prisma ./prisma
COPY run_migrations/wait-for-postgres.sh ./prisma/wait-for-postgres.sh
RUN chmod +x ./prisma/wait-for-postgres.sh

RUN npm install -g prisma
RUN npx prisma generate

RUN apt update
RUN apt --assume-yes install postgresql-client
RUN apt --assume-yes install dos2unix
RUN dos2unix ./prisma/wait-for-postgres.sh

CMD sh ./prisma/wait-for-postgres.sh ${DB_HOST} ${DATABASE_USER} ${DATABASE_DB} npx prisma migrate deploy && npx prisma db seed --preview-feature
