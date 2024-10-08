import { LoggerService } from '@js-monorepo/nest/logger'
import { RedisIoAdapter } from '@js-monorepo/user-presence'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import helmet from 'helmet'
import { ClsService } from 'nestjs-cls'
import { AppModule } from './app/app.module'

expand(config()) // add functionality for .env to use interpolation and more

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    forceCloseConnections: true,
  })

  app.useLogger(
    new LoggerService(app.get(ClsService), process.env.LOGGER_LEVEL)
  )

  const port = process.env.PORT || 3333
  const globalPrefix = 'api'

  app.setGlobalPrefix(globalPrefix)

  app.use(cookieParser())
  app.enableCors({
    origin: process.env.CORS_ORIGIN_DOMAINS,
    credentials: true,
  })
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )

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

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  )
}

bootstrap()
