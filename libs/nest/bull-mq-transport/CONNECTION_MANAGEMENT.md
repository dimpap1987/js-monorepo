# Connection Management

## Overview

BullMQ requires Redis connections to operate. This module implements a **shared connection strategy** to minimize the number of Redis connections created.

## How It Works

### Shared Connection Manager

The module uses a **shared ioredis connection** that is reused by all workers and queues:

1. **Single Connection Creation**: One ioredis connection is created when the first worker/queue is initialized
2. **Connection Reuse**: All subsequent workers and queues share this same connection
3. **Automatic Cleanup**: The connection is closed when the consumer module is destroyed

### Connection Count

**Expected Behavior:**
BullMQ workers require multiple connections by design:
- **Base connection**: 1 shared ioredis connection (reused for regular operations)
- **Per Worker**: 2 connections each (regular + blocking for BLPOP/BRPOP)
- **Base Redis**: 1 node-redis connection (from RedisModule)

**Example with 2 workers:**
- 1 shared ioredis (base)
- 2 workers × 2 connections = 4 connections
- 1 node-redis (base)
- **Total: ~6-7 connections** (this is normal and expected)

**Without shared connection:**
- Each worker would create its own base connection
- 2 workers × 3 connections = 6 connections
- Plus base Redis = 7+ connections
- **Shared connection reduces base connections but workers still need blocking connections**

## Why Multiple Connections?

BullMQ workers need multiple connections because:

1. **Regular Commands**: Standard Redis operations (GET, SET, etc.) - **Shared connection**
2. **Blocking Commands**: BLPOP, BRPOP for job polling - **Separate connection per worker (required)**
3. **Event Listening**: QueueEvents may need additional connections

**Important**: BullMQ **cannot** share blocking connections between workers because:
- BLPOP/BRPOP are blocking operations that wait for jobs
- Each worker needs its own blocking connection to poll independently
- This is a fundamental requirement of BullMQ's architecture

The shared connection manager reduces the base connection count, but workers will still create additional connections for blocking operations. This is **normal and expected behavior**.

## Configuration

The shared connection is automatically created from your `REDIS_URL`:

```typescript
BullMqConsumerModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    redisUrl: configService.get('REDIS_URL'), // Required for shared connection
    queueNamePrefix: 'workers',
  }),
})
```

## Monitoring Connections

To monitor Redis connections:

```bash
# Check active connections
redis-cli CLIENT LIST | wc -l

# Check connections by client name
redis-cli CLIENT LIST | grep -i bullmq
```

## Best Practices

1. **Always provide `redisUrl`**: Required for shared connection management
2. **Monitor connection count**: Ensure it stays within Redis limits
3. **Use connection pooling**: Redis handles multiple connections efficiently
4. **Close gracefully**: The module automatically closes shared connections on shutdown

## Troubleshooting

### Too Many Connections

If you see excessive connections:
1. Verify `redisUrl` is provided (shared connection won't work without it)
2. Check for multiple module instances (each creates its own shared connection)
3. Ensure workers are properly closed on shutdown

### Connection Errors

If connections fail:
1. Verify Redis URL is correct
2. Check Redis server connection limits
3. Ensure ioredis is installed (BullMQ dependency)

## Technical Details

The shared connection uses:
- **ioredis**: Required by BullMQ internally
- **Connection Options**: `maxRetriesPerRequest: null`, `enableReadyCheck: false` (required for BullMQ)
- **Singleton Pattern**: One connection instance shared across all workers/queues

