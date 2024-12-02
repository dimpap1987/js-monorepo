import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import {
  AuthSessionMiddleware,
  AuthSessionModule,
  SESSION_REDIS_PATH,
} from '@js-monorepo/auth/nest/session'
import { PrismaModule, PrismaService } from '@js-monorepo/db'
import { REDIS, RedisModule } from '@js-monorepo/nest/redis'
import { NotificationServerModule } from '@js-monorepo/notifications-server'
import { AuthUserDto } from '@js-monorepo/types'
import {
  Events,
  UserPresenceModule,
  UserPresenceWebsocketService,
} from '@js-monorepo/user-presence'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { ConfigModule, ConfigService } from '@nestjs/config'
import RedisStore from 'connect-redis'
import session from 'express-session'
import { ClsModule } from 'nestjs-cls'
import passport from 'passport'
import { RedisClientType } from 'redis'
import { v4 as uuidv4 } from 'uuid'
import { LoggerMiddleware } from '../middlewares/logger.middleware'
import { GLOBAL_CHANNEL } from './constants'
import { AnnouncementsController } from './controllers/announcements'
import { ExceptionController } from './controllers/exception.controller'
import { AdminProviderModule } from './modules/admin/admin.module'
import { ChannelProviderModule } from './modules/channel/channel.module'
import { ChannelService } from './modules/channel/channel.service'
import { FilterProviderModule } from './modules/filter.modules'
import { HealthModule } from './modules/health/health.module'
import { UserModule } from './modules/user/user.module'

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
          userPresenceWebsocketService.broadcast(Events.announcements, [
            `'${user.username}' has joined 🚀`,
          ])
        },
        onLogin: async (user) => {
          userPresenceWebsocketService.broadcast(Events.announcements, [
            `'${user.username}' is online 😎`,
          ])
        },
      }),
    }),
    PrismaModule,
    FilterProviderModule,
    ChannelProviderModule,
    AdminProviderModule,
    NotificationServerModule,
    UserModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          if (req.cookies['JSESSIONID']) {
            cls.set('session-id', req.cookies['JSESSIONID'])
          }
        },
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
  ],
  controllers: [ExceptionController, AnnouncementsController],
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
            prefix: SESSION_REDIS_PATH,
          }),
          genid: () => uuidv4(),
          saveUninitialized: false,
          secret: process.env['SESSION_SECRET'],
          resave: false,
          rolling: true, // Reset the expiration on every request
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
