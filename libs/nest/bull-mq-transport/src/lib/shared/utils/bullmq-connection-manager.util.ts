import { Logger } from '@nestjs/common'
import { ConnectionOptions } from 'bullmq'

const logger = new Logger('BullMQConnectionManager')

// Singleton connection manager
let IORedis: any
let sharedConnection: any = null
let isCreatingConnection = false
let connectionPromise: Promise<any> | null = null
let connectionCreationCount = 0

/**
 * Creates or returns a shared ioredis connection for BullMQ
 * This ensures all workers and queues share the same connection
 * This reduces Redis connections from N (per worker) to 1 (shared)
 * 
 * Note: BullMQ workers still need additional connections internally for blocking operations,
 * but sharing the base connection significantly reduces total connections.
 */
export function getSharedBullMqConnection(redisUrl?: string): any {
  // Return existing connection if available (regardless of status)
  // This check must be first to prevent duplicate creation
  if (sharedConnection) {
    return sharedConnection
  }

  if (!redisUrl) {
    throw new Error('Redis URL is required to create BullMQ connection')
  }

  // Prevent multiple simultaneous connection attempts
  // If already creating, return null and let the caller retry
  // (In practice, this shouldn't happen due to module initialization order)
  if (isCreatingConnection) {
    // Return the connection if it was created while we were waiting
    // Otherwise, this is a race condition that shouldn't happen
    return sharedConnection
  }

  // Set flag immediately to prevent race conditions
  isCreatingConnection = true

  try {
    // Synchronously load ioredis (will throw if not available)
    // In practice, BullMQ includes ioredis, so this should work
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    IORedis = require('ioredis')
  } catch (error) {
    isCreatingConnection = false
    throw new Error(
      'ioredis is required for BullMQ. Please install it: npm install ioredis'
    )
  }

  try {
    const url = new URL(redisUrl)
    const options: any = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false, // Required for BullMQ
      lazyConnect: false,
    }

    if (url.password) {
      options.password = url.password
    }

    if (url.pathname && url.pathname.length > 1) {
      const db = parseInt(url.pathname.slice(1), 10)
      if (!isNaN(db)) {
        options.db = db
      }
    }

    if (url.username) {
      options.username = url.username
    }

    // Create connection (should only happen once)
    connectionCreationCount++
    if (connectionCreationCount > 1) {
      logger.warn(`⚠️  WARNING: Shared connection being created ${connectionCreationCount} times! This should only happen once.`)
    }
    
    sharedConnection = new IORedis(options)
    
    // Set up event handlers only once
    let connectLogged = false
    let readyLogged = false

    sharedConnection.on('error', (err: Error) => {
      logger.error(`Shared Redis connection error: ${err.message}`)
    })

    sharedConnection.on('connect', () => {
      if (!connectLogged) {
        logger.log(`✅ Shared Redis connection established (connection #${connectionCreationCount}, reused by all workers)`)
        connectLogged = true
      }
    })

    sharedConnection.on('ready', () => {
      if (!readyLogged) {
        logger.log(`✅ Shared Redis connection ready (this is the ONLY shared connection)`)
        readyLogged = true
      }
    })

    isCreatingConnection = false
    return sharedConnection
  } catch (error) {
    isCreatingConnection = false
    sharedConnection = null
    throw new Error(`Failed to create shared BullMQ connection: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Closes the shared connection
 */
export async function closeSharedBullMqConnection(): Promise<void> {
  if (sharedConnection) {
    try {
      await sharedConnection.quit()
    } catch (error) {
      // Ignore errors during shutdown
      logger.warn(`Error closing shared connection: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      sharedConnection = null
      isCreatingConnection = false
      connectionPromise = null
    }
  }
}

/**
 * Creates BullMQ connection options using shared connection
 * 
 * Note: BullMQ workers still create additional connections internally for:
 * - Blocking operations (BLPOP, BRPOP)
 * - Event listening
 * 
 * However, sharing the base connection reduces the total connection count.
 */
export function createBullMqConnectionOptions(redisUrl?: string): ConnectionOptions {
  if (!redisUrl) {
    throw new Error('Redis URL is required')
  }

  const connection = getSharedBullMqConnection(redisUrl)
  
  // Return connection options that BullMQ will use
  // BullMQ will still create additional connections for blocking operations,
  // but will reuse this connection for regular operations
  return {
    // Pass the shared ioredis instance
    // BullMQ will use this for regular operations and create additional
    // connections internally for blocking operations (this is by design)
    connection,
    // Note: We cannot prevent BullMQ from creating blocking connections
    // as they are required for BLPOP/BRPOP operations
  } as ConnectionOptions
}

