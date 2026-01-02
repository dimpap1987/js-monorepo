import './otel'
import { LOGGER_CONFIG, LoggerConfig, LoggerService } from '@js-monorepo/nest/logger'
import { rawBodyMiddleware } from '@js-monorepo/payments-server'
import { RedisIoAdapter } from '@js-monorepo/user-presence'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import helmet from 'helmet'
import { ClsService } from 'nestjs-cls'
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown'
import { AppModule } from './app/app.module'

expand(config()) // add functionality for .env to use interpolation and more

export const apiLogger = new Logger('API')
const port = process.env.PORT || 3333
const globalPrefix = 'api'

function logServerMetadata() {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const host = process.env.HOST || 'localhost'
  apiLogger.log('Process ID: ' + process.pid)
  apiLogger.log('Parent Process ID: ' + process.ppid)
  apiLogger.log('Node Version: ' + process.version)
  apiLogger.log('Platform: ' + process.platform)
  apiLogger.log(`Api is up on: ${protocol}://${host}:${port}/${globalPrefix}`)
}

async function bootstrap() {
  apiLogger.log('Starting application...')
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    forceCloseConnections: true,
  })

  setupGracefulShutdown({ app })

  // Get logger config from DI container (configured via LoggerModule.forRootAsync)
  const loggerConfig = app.get<LoggerConfig>(LOGGER_CONFIG)
  app.useLogger(new LoggerService(app.get(ClsService), loggerConfig))
  app.setGlobalPrefix(globalPrefix)
  app.use(cookieParser())
  app.enableCors({
    origin: process.env.APP_URL,
    credentials: true,
  })
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", process.env.APP_URL],
          connectSrc: ["'self'", process.env.APP_URL],
        },
      },
    })
  )
  app.use(rawBodyMiddleware())
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    })
  )

  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()

  app.useWebSocketAdapter(redisIoAdapter)
  await app.listen(port)
  logServerMetadata()
}

bootstrap()
