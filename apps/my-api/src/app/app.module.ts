import { capitalize } from '@js-monorepo/auth/nest/common/utils'
import { PaymentsModule } from '@js-monorepo/payments-server'
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import { AuthSessionMiddleware, AuthSessionModule, getRedisSessionPath } from '@js-monorepo/auth/nest/session'
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
import { ConfigModule, ConfigService } from '@nestjs/config'
import RedisStore from 'connect-redis'
import session from 'express-session'
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

const ENV = process.env.NODE_ENV
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${ENV}`, `.env`],
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
      imports: [UserPresenceModule],
      inject: [UserPresenceWebsocketService],
      useFactory: async (userPresenceWebsocketService: UserPresenceWebsocketService) => ({
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
          middlewareExclusions: ['exceptions', 'admin/(.*)', 'health', 'payments/webhook'],
        },
        redirectUiUrl: process.env.AUTH_LOGIN_REDIRECT,
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
            senderId: 1,
            message: `Your <strong>${capitalize(subscription.name)}</strong> subscription plan has been successfully activated! 🎉`,
          })
        },
        onSubscriptionEvent: (userId, event) => {
          apiLogger.log(`Subscription event callback received with event: '${event}' and userId id : ${userId}`)
          userPresenceWebsocketService.sendToUsers([userId], Events.refreshSession, true)
        },
      }),
    }),
  ],
  controllers: [ExceptionController, AnnouncementsController, AppController],
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
            prefix: getRedisSessionPath(),
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
      .exclude('health', 'payments/(.*)')
      .forRoutes('*')
  }
}
