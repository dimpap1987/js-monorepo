import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import {
  AuthSessionMiddleware,
  AuthSessionModule,
} from '@js-monorepo/auth/nest/session'
import { PrismaModule } from '@js-monorepo/db'
import { REDIS, RedisModule } from '@js-monorepo/nest/redis'
import { AuthUserDto } from '@js-monorepo/types'
import {
  BrokerEvents,
  UserPresenceModule,
  UserPresenceWebsocketService,
} from '@js-monorepo/user-presence'
import { ConfigModule, ConfigService } from '@nestjs/config'
import RedisStore from 'connect-redis'
import session from 'express-session'
import passport from 'passport'
import { RedisClientType } from 'redis'
import { v4 as uuidv4 } from 'uuid'
import { LoggerMiddleware } from '../middlewares/logger.middleware'
import { GLOBAL_CHANNEL } from './constants'
import { AdminController } from './controllers/admin.controller'
import { ExceptionController } from './controllers/exception.controller'
import { NotificationController } from './controllers/notification.controller'
import { AdminProviderModule } from './modules/admin.module'
import { ChannelProviderModule } from './modules/channel.module'
import { FilterProviderModule } from './modules/filter.modules'
import { HealthModule } from './modules/health/health.module'
import { NotificationProviderModule } from './modules/notifications.module'
import { ChannelService } from './services/channel.service'
const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${ENV}`, `.env`],
    }),
    HealthModule,
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
      }),
      isGlobal: true,
    }),
    UserPresenceModule,
    AuthSessionModule.forRootAsync({
      imports: [UserPresenceModule],
      inject: [ChannelService, UserPresenceWebsocketService],
      useFactory: async (
        channelService: ChannelService,
        userPresenceWebsocketService: UserPresenceWebsocketService
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
          middlewareExclusions: ['exceptions', 'admin/(.*)', 'health'],
        },
        redirectUiUrl: process.env.AUTH_LOGIN_REDIRECT,
        onRegister: async (user: AuthUserDto) => {
          await channelService.assignUserToChannels(user.id, GLOBAL_CHANNEL)
          userPresenceWebsocketService.broadcast(BrokerEvents.announcements, [
            `'${user.username}' has joined 🚀`,
          ])
        },
        onLogin: async (user) => {
          userPresenceWebsocketService.broadcast(BrokerEvents.announcements, [
            `'${user.username}' is online 😎`,
          ])
        },
      }),
    }),
    PrismaModule,
    FilterProviderModule,
    ChannelProviderModule,
    AdminProviderModule,
    NotificationProviderModule,
  ],
  controllers: [NotificationController, AdminController, ExceptionController],
  providers: [LoggerMiddleware],
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
      .exclude('health')
      .forRoutes('*')
  }
}
