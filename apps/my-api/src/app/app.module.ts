import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import {
  AuthSessionMiddleware,
  AuthSessionModule,
} from '@js-monorepo/auth/nest/session'
import { PrismaModule } from '@js-monorepo/db'
import { REDIS, RedisModule } from '@js-monorepo/nest/redis'
import { AuthUserDto } from '@js-monorepo/types'
import { ConfigModule } from '@nestjs/config'
import RedisStore from 'connect-redis'
import session from 'express-session'
import passport from 'passport'
import { RedisClientType } from 'redis'
import { v4 as uuidv4 } from 'uuid'
import { LoggerMiddleware } from '../middlewares/logger.middleware'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GLOBAL_CHANNEL } from './constants'
import { AdminController } from './controllers/admin.controller'
import { EventsController } from './controllers/events.controller'
import { ExceptionController } from './controllers/exception.controller'
import { NotificationController } from './controllers/notification.controller'
import { AdminProviderModule } from './modules/admin.module'
import { ChannelProviderModule } from './modules/channel.module'
import { FilterProviderModule } from './modules/filter.modules'
import { NotificationProviderModule } from './modules/notifications.module'
import { ChannelService } from './services/channel.service'
import { EventsService } from './services/event.service'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    RedisModule.register({
      url: process.env['REDIS_URL'],
    }),
    AuthSessionModule.forRootAsync({
      imports: [AppModule, ChannelProviderModule],
      inject: [EventsService, ChannelService],
      useFactory: async (
        eventsService: EventsService,
        channelService: ChannelService
      ) => ({
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callBackUrl: process.env.GOOGLE_REDIRECT_URL,
        },
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callBackUrl: process.env.GITHUB_REDIRECT_URL,
        },
        csrf: {
          enabled: true,
          middlewareExclusions: ['exceptions', 'events'],
        },
        redirectUiUrl: process.env.AUTH_LOGIN_REDIRECT,
        onLogin: async (user: AuthUserDto) => {
          eventsService.emit(GLOBAL_CHANNEL, {
            id: uuidv4(),
            data: {
              announcements: [`'${user.username}' is online`],
            },
            time: new Date(),
            type: 'announcement',
          })
        },
        onRegister: async (user: AuthUserDto) => {
          await channelService.assignUserToChannels(user.id, GLOBAL_CHANNEL)

          eventsService.emit(GLOBAL_CHANNEL, {
            id: uuidv4(),
            data: {
              announcements: [`'${user.username}' has just joined!`],
            },
            time: new Date(),
            type: 'announcement',
          })
        },
      }),
    }),
    PrismaModule,
    FilterProviderModule,
    ChannelProviderModule,
    AdminProviderModule,
    NotificationProviderModule,
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${ENV}`, `environments/.env.${ENV}`],
    }),
  ],
  controllers: [
    AppController,
    EventsController,
    NotificationController,
    AdminController,
    ExceptionController,
  ],
  providers: [AppService, EventsService, LoggerMiddleware],
  exports: [EventsService],
})
export class AppModule implements NestModule {
  constructor(@Inject(REDIS) private readonly redis: RedisClientType) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redis,
            prefix: `${process.env['REDIS_NAMESPACE']}:sessions:`,
          }),
          saveUninitialized: false,
          secret: process.env['SESSION_SECRET'],
          resave: false,
          name: 'JSESSIONID',
          cookie: {
            ...authCookiesOptions,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
          },
        }),
        passport.initialize(),
        passport.session()
      )
      .forRoutes('*')
      .apply(LoggerMiddleware) // Apply LoggerMiddleware
      .forRoutes('*')
      .apply(AuthSessionMiddleware)
      .forRoutes('*')
  }
}
