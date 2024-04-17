import cookieParser from 'cookie-parser'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT || 3333
  const globalPrefix = 'api'

  app.setGlobalPrefix(globalPrefix)

  app.use(cookieParser())
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )

  await app.listen(port)

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  )
}

bootstrap()
