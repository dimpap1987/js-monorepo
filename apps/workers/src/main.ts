import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { WorkersModule } from './workers.module'

expand(config()) // add functionality for .env to use interpolation and more

const logger = new Logger('WorkersBootstrap')

async function bootstrap() {
  logger.log('Starting BullMQ workers microservice...')

  const workersHost = process.env['WORKERS_HOST'] || '0.0.0.0'
  const workersPort = Number(process.env['WORKERS_PORT'] || 3001)
  const shutdownTimeout = Number(process.env['GRACEFUL_SHUTDOWN_TIMEOUT'] ?? 10000)

  // Create microservice application
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(WorkersModule, {
    transport: Transport.TCP,
    options: {
      host: workersHost,
      port: workersPort,
    },
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  })

  // Setup graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`)
    const timeout = setTimeout(() => {
      logger.warn('Graceful shutdown timeout exceeded, forcing exit')
      process.exit(1)
    }, shutdownTimeout)

    try {
      await app.close()
      clearTimeout(timeout)
      logger.log('✅ Workers microservice closed gracefully')
      process.exit(0)
    } catch (error) {
      clearTimeout(timeout)
      logger.error('Error during shutdown', error instanceof Error ? error.stack : String(error))
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  await app.listen()
  logger.log(`✅ BullMQ workers microservice started on ${workersHost}:${workersPort}`)
}

bootstrap().catch((error) => {
  logger.error('Failed to start workers microservice', error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
