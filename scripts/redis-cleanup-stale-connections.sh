#!/bin/bash
# Script to clean up stale Redis connections
# Kills connections that are idle for more than the specified time (default: 1 hour)
# Usage: pnpm redis:cleanup [idle-seconds]

IDLE_THRESHOLD=${1:-3600} # Default: 1 hour (3600 seconds)

echo "Cleaning up stale Redis connections (idle > ${IDLE_THRESHOLD}s)..."
echo "================================================"

# Find Redis container
find_redis_container() {
  # Try common container names
  for name in redis_container redis redis_dev redis-prod; do
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
      echo "$name"
      return 0
    fi
  done
  # Fallback to any container with redis in name (excluding exporters)
  docker ps --format '{{.Names}}' | grep -i "^redis" | grep -v exporter | head -1
}

REDIS_CONTAINER=$(find_redis_container)

if [ -z "$REDIS_CONTAINER" ]; then
  echo "Error: Redis container not found"
  exit 1
fi

echo "Using Redis container: $REDIS_CONTAINER"
echo ""

# Get connections that are idle longer than threshold
STALE_CONNECTIONS=$(docker exec "$REDIS_CONTAINER" redis-cli CLIENT LIST 2>/dev/null | \
  awk -v threshold="$IDLE_THRESHOLD" -F'[ =]' '
  {
    id=""; idle=""; name=""
    for(i=1;i<=NF;i++) {
      if($i=="id") id=$(i+1)
      if($i=="idle") idle=$(i+1)
      if($i=="name") name=$(i+1)
    }
    if(idle+0 > threshold && id != "") {
      # Skip connections with names (they are active applications)
      if(name == "" || name == "(not set)") {
        print id
      }
    }
  }')

if [ -z "$STALE_CONNECTIONS" ]; then
  echo "✓ No stale connections found (idle > ${IDLE_THRESHOLD}s)"
  exit 0
fi

COUNT=$(echo "$STALE_CONNECTIONS" | wc -l | tr -d ' ')
echo "Found $COUNT stale connection(s):"
echo "$STALE_CONNECTIONS" | while read -r conn_id; do
  if [ -n "$conn_id" ]; then
    docker exec "$REDIS_CONTAINER" redis-cli CLIENT LIST 2>/dev/null | \
      grep "id=$conn_id" | \
      awk -F'[ =]' '{for(i=1;i<=NF;i++){if($i=="addr")addr=$(i+1);if($i=="idle")idle=$(i+1);if($i=="age")age=$(i+1)}} {printf "  ID: %s | Addr: %s | Idle: %ss | Age: %ss\n", $0, addr, idle, age}' | head -1
  fi
done

echo ""
read -p "Kill these connections? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

# Kill stale connections
KILLED=0
while IFS= read -r conn_id; do
  if [ -n "$conn_id" ]; then
    if docker exec "$REDIS_CONTAINER" redis-cli CLIENT KILL ID "$conn_id" >/dev/null 2>&1; then
      KILLED=$((KILLED + 1))
    fi
  fi
done <<< "$STALE_CONNECTIONS"

# Count again to verify
REMAINING=$(docker exec "$REDIS_CONTAINER" redis-cli CLIENT LIST 2>/dev/null | \
  awk -v threshold="$IDLE_THRESHOLD" -F'[ =]' '
  {
    idle=""; name=""
    for(i=1;i<=NF;i++) {
      if($i=="idle") idle=$(i+1)
      if($i=="name") name=$(i+1)
    }
    if(idle+0 > threshold && (name == "" || name == "(not set)")) {
      count++
    }
  }
  END {print count+0}')

echo "✓ Cleanup complete. Killed $KILLED connection(s). Remaining stale connections: $REMAINING"
