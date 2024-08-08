import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ChannelService } from './services/channel.service'

import { AuthModule } from '@js-monorepo/auth/nest'
import { PrismaModule } from '@js-monorepo/db'
import { ConfigModule } from '@nestjs/config'
import { AuthUser } from '@prisma/client'
import { LoggerMiddleware } from '../middlewares/logger.middleware'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AdminController } from './controllers/admin.controller'
import { ExceptionController } from './controllers/exception.controller'
import { NotificationController } from './controllers/notification.controller'
import { AdminProviderModule } from './modules/admin.module'
import { ChannelProviderModule } from './modules/channel.module'
import { FilterProviderModule } from './modules/filter.modules'
import { NotificationProviderModule } from './modules/notifications.module'
import { EventsService } from './services/event.service'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    PrismaModule,
    FilterProviderModule,
    ChannelProviderModule,
    AdminProviderModule,
    NotificationProviderModule,
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${ENV}`, `environments/.env.${ENV}`],
    }),
    AuthModule.forRootAsync({
      imports: [ChannelProviderModule],
      inject: [ChannelService],
      useFactory: async (channelService: ChannelService) => {
        return {
          csrf: {
            enabled: true,
            middlewareExclusions: ['exceptions'],
          },
          tokenRoation: {
            enabled: true,
            middlewareExclusions: ['exceptions'],
          },
          accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
          refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
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
            channelService.assignUserToChannels(user.id, 'global')
          },
          onLogin: async (user: AuthUser) => {
            Logger.log(`User: '${user.username}' has successfully logged in 😁`)
          },
        }
      },
    }),
  ],
  controllers: [
    AppController,
    NotificationController,
    AdminController,
    ExceptionController,
  ],
  providers: [AppService, EventsService, LoggerMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
