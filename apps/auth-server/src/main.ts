import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT || 3333
  const globalPrefix = 'api'

  app.setGlobalPrefix(globalPrefix)

  app.use(cookieParser())
  app.enableCors({
    origin: 'http://localhost:3000',
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
