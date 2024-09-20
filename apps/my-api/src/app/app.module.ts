import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import {
  AuthSessionMiddleware,
  AuthSessionModule,
} from '@js-monorepo/auth/nest/session'
import { PrismaModule } from '@js-monorepo/db'
import { REDIS, RedisModule } from '@js-monorepo/nest/redis'
import {
  PubSubService,
  RedisEventPubSubModule,
} from '@js-monorepo/nest/redis-event-pub-sub'
import { AuthUserDto } from '@js-monorepo/types'
import { BrokerEvents, UserPresenceModule } from '@js-monorepo/user-presence'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
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
import { ExceptionController } from './controllers/exception.controller'
import { NotificationController } from './controllers/notification.controller'
import { AdminProviderModule } from './modules/admin.module'
import { ChannelProviderModule } from './modules/channel.module'
import { FilterProviderModule } from './modules/filter.modules'
import { NotificationProviderModule } from './modules/notifications.module'
import { ChannelService } from './services/channel.service'
const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${ENV}`, `.env`],
    }),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
      }),
      isGlobal: true,
    }),
    RedisEventPubSubModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('REDIS_URL') ?? '',
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({
      global: true,
    }),
    UserPresenceModule,
    AuthSessionModule.forRootAsync({
      imports: [AppModule, ChannelProviderModule],
      inject: [ChannelService, PubSubService],
      useFactory: async (
        channelService: ChannelService,
        pubSubService: PubSubService
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
        onRegister: async (user: AuthUserDto) => {
          await channelService.assignUserToChannels(user.id, GLOBAL_CHANNEL)
          pubSubService.emit(BrokerEvents.announcements, {
            data: [`'${user.username}' has joined 🚀`],
          })
        },
        onLogin: async (user) => {
          pubSubService.emit(BrokerEvents.announcements, {
            data: [`'${user.username}' is online 😎`],
          })
        },
      }),
    }),
    PrismaModule,
    FilterProviderModule,
    ChannelProviderModule,
    AdminProviderModule,
    NotificationProviderModule,
  ],
  controllers: [
    AppController,
    NotificationController,
    AdminController,
    ExceptionController,
  ],
  providers: [AppService, LoggerMiddleware],
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
          genid: () => uuidv4(),
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
