import { Logger, LogLevel, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import helmet from 'helmet'
import { AppModule } from './app/app.module'

expand(config()) // add functionality for .env to use interpolation and more

const logLevelsArray: LogLevel[] = process.env.LOGGER_LEVELS
  ? process.env.LOGGER_LEVELS.split(',').map(
      (level) => level.trim() as LogLevel
    )
  : ['log', 'debug', 'error', 'warn']

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logLevelsArray,
  })
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

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(port)

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  )
}

bootstrap()
