import { capitalize } from '@js-monorepo/auth/nest/common/utils'
import { PaymentsModule } from '@js-monorepo/payments-server'
import KeyvRedis, { Keyv } from '@keyv/redis'
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { RedisSessionKey } from '@js-monorepo/auth/nest/common/types'
import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import { AuthSessionMiddleware, AuthSessionModule } from '@js-monorepo/auth/nest/session'
import { PrismaModule, PrismaService } from '@js-monorepo/db'
import { REDIS, RedisModule } from '@js-monorepo/nest/redis'
import {
  Events as NotificationEvent,
  NotificationServerModule,
  NotificationService,
} from '@js-monorepo/notifications-server'
import { AuthUserDto } from '@js-monorepo/types'
import { Events, UserPresenceModule, UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import RedisStore from 'connect-redis'
import session from 'express-session'
import moment from 'moment'
import { ClsModule } from 'nestjs-cls'
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown'
import passport from 'passport'
import { RedisClientType } from 'redis'
import { v4 as uuidv4 } from 'uuid'
import { apiLogger } from '../main'
import { LoggerMiddleware } from '../middlewares/logger.middleware'
import { AnnouncementsController } from './controllers/announcements'
import { AppController } from './controllers/app.controller'
import { ExceptionController } from './controllers/exception.controller'
import { AdminProviderModule } from './modules/admin/admin.module'
import { FilterProviderModule } from './modules/filter.modules'
import { HealthModule } from './modules/health/health.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`],
    }),
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
    PrismaModule,
    GracefulShutdownModule.forRoot({
      cleanup: async (app, signal) => {
        apiLogger.warn(`Shutdown hook received with signal: ${signal}`)
        app.close()
      },
      gracefulShutdownTimeout: Number(process.env.GRACEFUL_SHUTDOWN_TIMEOUT ?? 3000),
      keepNodeProcessAlive: true,
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
      imports: [UserPresenceModule, ConfigModule],
      inject: [UserPresenceWebsocketService, ConfigService],
      useFactory: async (userPresenceWebsocketService: UserPresenceWebsocketService, configService: ConfigService) => ({
        google: {
          clientId: configService.get('GOOGLE_CLIENT_ID'),
          clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
          callBackUrl: configService.get('GOOGLE_REDIRECT_URL'),
        },
        github: {
          clientId: configService.get('GITHUB_CLIENT_ID'),
          clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
          callBackUrl: configService.get('GITHUB_REDIRECT_URL'),
        },
        csrf: {
          enabled: true,
          middlewareExclusions: ['exceptions', 'admin/(.*)', 'health', 'payments/webhook'],
        },
        redirectUiUrl: configService.get('AUTH_LOGIN_REDIRECT'),
        onRegister: async (user: AuthUserDto) => {
          userPresenceWebsocketService.broadcast(Events.announcements, [`'${user.username}' has joined 🚀`])
        },
        onLogin: async (user) => {
          userPresenceWebsocketService.broadcast(Events.announcements, [`'${user.username}' is online 😎`])
        },
      }),
    }),
    FilterProviderModule,
    AdminProviderModule,
    UserModule,
    NotificationServerModule.forRootAsync({
      imports: [UserPresenceModule],
      inject: [UserPresenceWebsocketService],
      useFactory: async (userPresenceWebsocketService) => ({
        onNotificationCreation(receiverIds, notification) {
          apiLogger.log(
            `Notification created with id: '${notification.id}' and publish it to users : [${receiverIds?.join(', ')}]`
          )
          userPresenceWebsocketService.sendToUsers(receiverIds, NotificationEvent.notifications, {
            data: {
              notification,
            },
          })
        },
      }),
    }),
    PaymentsModule.forRootAsync({
      imports: [UserPresenceModule, NotificationServerModule],
      inject: [UserPresenceWebsocketService, NotificationService],
      useFactory: async (userPresenceWebsocketService, notificationService) => ({
        onSubscriptionCreateSuccess: (userId, subscription) => {
          notificationService.createNotification({
            receiverIds: [userId],
            message: `Your <strong>${capitalize(subscription.name)}</strong> subscription plan has been successfully activated! 🎉`,
          })
        },
        onSubscriptionEvent: (userId, event) => {
          apiLogger.log(`Subscription event callback received with event: '${event}' and userId id : ${userId}`)
          userPresenceWebsocketService.sendToUsers([userId], Events.refreshSession, true)
        },
        onSubscriptionDeleteSuccess(userId, subscription) {
          const dateMessage = `<strong>${moment(subscription.cancelAt).format('YYYY-MM-DD')}</strong>`
          const timeMessage = `<strong>${moment(subscription.cancelAt).format('hh:mm A')}</strong>`

          notificationService.createNotification({
            receiverIds: [userId],
            message: `Your <strong>${capitalize(subscription.name)}</strong> subscription plan will be canceled at the end of the period ${dateMessage} at ${timeMessage}`,
          })
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [REDIS, ConfigService],
      useFactory: async (redisClient: RedisClientType, configService: ConfigService) => {
        const redisStore = new Keyv({
          store: new KeyvRedis(redisClient, {
            keyPrefixSeparator: ':caches:',
          }),
          ttl: 5000,
          useKeyPrefix: false,
          namespace: configService.get('REDIS_NAMESPACE'),
        })
        return {
          stores: redisStore,
        }
      },
    }),
  ],
  controllers: [ExceptionController, AnnouncementsController, AppController],
  providers: [LoggerMiddleware],
})
export class AppModule implements NestModule {
  constructor(
    @Inject(REDIS) private readonly redis: RedisClientType,
    @Inject(RedisSessionKey) private redisSessionPath: string,
    private readonly configService: ConfigService
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redis,
            prefix: this.redisSessionPath,
          }),
          genid: () => uuidv4(),
          saveUninitialized: false,
          secret: this.configService.get('SESSION_SECRET'),
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
      .exclude('health', 'payments/(.*)')
      .forRoutes('*')
  }
}
