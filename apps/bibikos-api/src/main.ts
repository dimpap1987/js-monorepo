import { DATE_CONFIG } from '@js-monorepo/utils/date'
process.env.TZ = DATE_CONFIG.SERVER_TIMEZONE

import { Logger, ValidationPipe } from '@nestjs/common'
export const apiLogger = new Logger('BIBIKOS-API')

import './otel'
import { LOGGER_CONFIG, LoggerConfig, LoggerService } from '@js-monorepo/nest/logger'
import { rawBodyMiddleware } from '@js-monorepo/payments-server'
import { getAllowedOriginsFromEnv, isOriginAllowed as isOriginAllowedUtil } from '@js-monorepo/utils/common'
import { TimeoutInterceptor } from '@js-monorepo/nest/interceptors'
import { RedisIoAdapter } from '@js-monorepo/user-presence'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import helmet from 'helmet'
import { ClsService } from 'nestjs-cls'
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown'
import { AppModule } from './app/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { validateEnv } from './config/env.schema'
import { ZodError } from 'zod'

expand(config()) // add functionality for .env to use interpolation and more

const port = process.env.PORT || 3333
const globalPrefix = 'api'
const allowedOrigins = getAllowedOriginsFromEnv(process.env)

function validateEnvironmentVariables() {
  try {
    validateEnv(process.env)
    apiLogger.log('Environment variables validation passed')

    // Log warnings for optional OAuth variables if they're missing
    const oauthVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URL',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'GITHUB_REDIRECT_URL',
      'STRIPE_WEBHOOK_SECRET',
    ]
    const missingOauth = oauthVars.filter((varName) => !process.env[varName])

    if (missingOauth.length > 0) {
      apiLogger.warn(`Optional OAuth environment variables not set: ${missingOauth.join(', ')}`)
      apiLogger.warn('OAuth authentication features will not be available')
    }
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod validation error - format issues for better readability
      const errorMessages = error.issues
        .map((issue) => {
          const path = issue.path.join('.')
          return `${path}: ${issue.message}`
        })
        .join(', ')
      const errorMessage = `Environment variable validation failed: ${errorMessages}`
      apiLogger.error(errorMessage)
      throw new Error(errorMessage)
    }
    throw error
  }
}

function logServerMetadata() {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const host = process.env.HOST || 'localhost'
  apiLogger.log('Process ID: ' + process.pid)
  apiLogger.log('Parent Process ID: ' + process.ppid)
  apiLogger.log('Node Version: ' + process.version)
  apiLogger.log('Platform: ' + process.platform)
  apiLogger.log(`Bibikos-Api is up on: ${protocol}://${host}:${port}/${globalPrefix}`)
}

async function bootstrap() {
  apiLogger.log('Starting application...')
  validateEnvironmentVariables()

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
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
    origin: (origin, callback) => {
      const isAllowed = isOriginAllowedUtil(origin || undefined, allowedOrigins)
      if (isAllowed) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", process.env.APP_URL],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
          connectSrc: ["'self'", process.env.APP_URL, 'https://api.stripe.com'],
          frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https://*.stripe.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
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
  app.useGlobalInterceptors(new TimeoutInterceptor(30_000))
  app.set('trust proxy', 1)

  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()

  app.useWebSocketAdapter(redisIoAdapter)
  await app.listen(port, '0.0.0.0')
  logServerMetadata()
}

bootstrap()
