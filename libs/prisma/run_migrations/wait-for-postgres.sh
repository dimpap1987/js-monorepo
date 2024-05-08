#!/bin/sh

set -e
  
host="$1"
user="$2"
auth="$3"
shift
shift
shift
cmd="$@"
  
until PGPASSWORD=$DATABASE_PASSWORD psql -h "$host" -U "$user" -d "$auth" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"

exec $cmd