import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from '@js-monorepo/auth'
import { NotificationController } from './controllers/notification.controller'
import { EventsService } from './services/event.service'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${ENV}`, `environments/.env.${ENV}`],
    }),
    AuthModule.forRoot({
      sessionSecret: process.env.SESSION_SECRET,
      jwtSercret: process.env.JWT_SECRET_KEY,
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callBackUrl: process.env.GITHUB_REDIRECT_URL,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callBackUrl: process.env.GOOGLE_REDIRECT_URL,
      },
      redirectUiUrl: process.env.AUTH_LOGIN_REDIRECT,
    }),
  ],
  controllers: [AppController, NotificationController],
  providers: [AppService, EventsService],
})
export class AppModule {}
