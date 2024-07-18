import { Logger, Module } from '@nestjs/common'
import { ChannelService } from './services/channel.service'

import { AuthModule } from '@js-monorepo/auth'
import { PrismaModule } from '@js-monorepo/db'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { AuthUser } from '@prisma/client'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AdminController } from './controllers/admin.controller'
import { NotificationController } from './controllers/notification.controller'
import {
  ApiExceptionFilter,
  BadRequestExceptionFilter,
  GlobalExceptionFilter,
  PrismaClientExceptionFilter,
  ZodExceptionFilter,
} from './exceptions/filter'
import { AdminService } from './services/admin.service'
import { EventsService } from './services/event.service'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${ENV}`, `environments/.env.${ENV}`],
    }),
    PrismaModule,
    AuthModule.forRootAsync({
      imports: [AppModule],
      useFactory: async (channelService: ChannelService) => {
        return {
          sessionSecret: process.env.SESSION_SECRET,
          accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
          refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
          csrfEnabled: true,
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
          onRegister: async (user: AuthUser) => {
            Logger.log(`User: '${user.username}' created successfully 😍`)
            try {
              channelService.assignUserToChannels(user.id, 'global')
            } catch (e) {
              Logger.error(e)
            }
          },
          onLogin: async (user: AuthUser) => {
            Logger.log(`User: '${user.username}' has successfully logged in 😁`)
          },
        }
      },
    }),
  ],
  controllers: [AppController, NotificationController, AdminController],
  providers: [
    AppService,
    EventsService,
    ChannelService,
    AdminService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
  exports: [ChannelService],
})
export class AppModule {}
