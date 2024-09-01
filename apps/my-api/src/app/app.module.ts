import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import {
  AuthSessionMiddleware,
  AuthSessionModule,
} from '@js-monorepo/auth/nest/session'
import { PrismaModule } from '@js-monorepo/db'
import { REDIS, RedisModule } from '@js-monorepo/nest/redis'
import { ConfigModule } from '@nestjs/config'
import RedisStore from 'connect-redis'
import session from 'express-session'
import passport from 'passport'
import { RedisClientType } from 'redis'
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
    RedisModule.register({
      url: process.env['REDIS_URL'],
    }),
    AuthSessionModule.forRootAsync({
      useFactory: () => ({
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
          middlewareExclusions: ['exceptions'],
        },
        redirectUiUrl: process.env.AUTH_LOGIN_REDIRECT,
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
    NotificationController,
    AdminController,
    ExceptionController,
  ],
  providers: [AppService, EventsService, LoggerMiddleware],
})
export class AppModule implements NestModule {
  constructor(@Inject(REDIS) private readonly redis: RedisClientType) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redis,
            prefix: 'myapp:sessions:',
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
