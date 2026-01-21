import { ContactServerModule } from '@js-monorepo/contact-server'
import { FeatureFlagsModule } from '@js-monorepo/feature-flags-server'
import { VaultModule } from '@js-monorepo/nest/vault'
import { PaymentsModule } from '@js-monorepo/payments-server'
import KeyvRedis, { Keyv } from '@keyv/redis'
import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { RedisSessionKey } from '@js-monorepo/auth/nest/common/types'
import { authCookiesOptions } from '@js-monorepo/auth/nest/common/utils'
import { AuthSessionMiddleware, AuthSessionModule } from '@js-monorepo/auth/nest/session'
import { PrismaModule, PrismaService } from '@js-monorepo/bibikos-db'
import { DistributedLockModule } from '@js-monorepo/nest/distributed-lock'
import { IdempotencyModule } from '@js-monorepo/nest/idempotency'
import { LoggerModule } from '@js-monorepo/nest/logger'
import { REDIS, RedisModule } from '@js-monorepo/nest/redis'
import {
  Events as NotificationEvent,
  NotificationServerModule,
  NotificationService,
} from '@js-monorepo/notifications-server'
import { AuthUserDto } from '@js-monorepo/types/auth'
import { Events, UserPresenceModule, UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
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
import { AdminProviderModule } from './modules/admin/admin.module'
import { FilterProviderModule } from './modules/filter.modules'
import { HealthModule } from './modules/health/health.module'
import { SchedulingModule } from './modules/scheduling/scheduling.module'
import { AppUserService } from './modules/scheduling/app-users/app-user.service'
import { BibikosCacheService } from './modules/scheduling/cache'
import { SUBSCRIPTION_STATUS_KEY } from './modules/scheduling/cache/constants'
import { UserModule } from './modules/user/user.module'
import { getContactMessage } from './notifications/contact-form'
import {
  getSubscriptionActivatedMessage,
  getSubscriptionCanceledMessage,
  getSubscriptionExpiredMessage,
  getSubscriptionRenewedMessage,
  getTrialExpiredMessage,
  getTrialStartedMessage,
} from './notifications/subscription-notifications'

@Module({
  imports: [
    LoggerModule.forRootAsync(),
    VaultModule.register({
      path: process.env.VAULT_PATH || '',
      endpoint: process.env.VAULT_ADDR || '',
      roleId: process.env.VAULT_ROLE_ID || '',
      secretId: process.env.VAULT_SECRET_ID || '',
      apiVersion: 'v1',
      envFilePaths: [process.env['BIBIKOS_ENV_PATH']],
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
    PrismaModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        databaseUrl: configService.get('BIBIKOS_DATABASE_URL'),
        clientName: 'bibikos_db',
      }),
    }),
    GracefulShutdownModule.forRoot({
      cleanup: async (app, signal) => {
        apiLogger.warn(`Shutdown hook received with signal: ${signal}`)

        // Shutdown WebSocket connections before Redis closes
        try {
          const httpServer = app.getHttpServer()
          const io = (httpServer as any)?.io
          if (io) {
            apiLogger.debug('Closing WebSocket connections...')
            // Close all namespaces gracefully
            io._nsps.forEach((namespace: any) => {
              if (namespace && typeof namespace.disconnectSockets === 'function') {
                namespace.disconnectSockets(true)
              }
            })
            apiLogger.debug('WebSocket connections closed')
          }
        } catch (error: any) {
          // Suppress errors during shutdown - they're expected
          if (!error?.message?.includes('closed')) {
            apiLogger.debug(`Error closing WebSocket connections during shutdown: ${error?.message}`)
          }
        }
      },
      gracefulShutdownTimeout: Number(process.env.GRACEFUL_SHUTDOWN_TIMEOUT ?? 30000),
      keepNodeProcessAlive: true,
    }),
    HealthModule,
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
      }),
      isGlobal: true,
      clientName: 'bibikos-api',
    }),
    DistributedLockModule,
    IdempotencyModule,
    UserPresenceModule,
    AuthSessionModule.forRootAsync({
      imports: [UserPresenceModule, SchedulingModule],
      inject: [UserPresenceWebsocketService, AppUserService, ConfigService],
      useFactory: async (
        userPresenceWebsocketService: UserPresenceWebsocketService,
        appUserService: AppUserService,
        configService: ConfigService
      ) => ({
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
          middlewareExclusions: ['health', 'payments/webhook', 'contact'],
        },
        redirectUiUrl: configService.get('AUTH_LOGIN_REDIRECT'),
        skipOnboarding: true,
        onRegister: async (user: AuthUserDto) => {
          // Create AppUser when user registers
          try {
            await appUserService.getOrCreateAppUserByAuthId(user.id)
            apiLogger.log(`Created AppUser for new user: ${user.username} (authUserId: ${user.id})`)
          } catch (error: any) {
            apiLogger.error(`Failed to create AppUser for user ${user.id}: ${error.message}`, error.stack)
          }
          userPresenceWebsocketService.broadcast(Events.announcements, [`'${user.username}' has joined 🚀`])
        },
        onLogin: async (user) => {
          // Ensure AppUser exists when user logs in (handles edge cases where creation failed during registration)
          try {
            await appUserService.getOrCreateAppUserByAuthId(user.id)
          } catch (error: any) {
            apiLogger.error(`Failed to ensure AppUser exists for user ${user.id}: ${error.message}`, error.stack)
          }
          userPresenceWebsocketService.broadcast(Events.announcements, [`'${user.username}' is online 😎`])
        },
      }),
    }),
    FilterProviderModule,
    AdminProviderModule,
    UserModule,
    FeatureFlagsModule,
    SchedulingModule,
    NotificationServerModule.forRootAsync({
      imports: [UserPresenceModule],
      inject: [UserPresenceWebsocketService],
      useFactory: async (userPresenceWebsocketService: UserPresenceWebsocketService, configService: ConfigService) => ({
        adminEmail: configService.get('ADMIN_EMAIL'),
        vapidPrivateKey: configService.get('VAPID_PRIVATE_KEY'),
        vapidPublicKey: configService.get('VAPID_PUBLIC_KEY'),
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
      imports: [UserPresenceModule, NotificationServerModule, SchedulingModule],
      inject: [UserPresenceWebsocketService, NotificationService, BibikosCacheService],
      useFactory: async (
        userPresenceWebsocketService: UserPresenceWebsocketService,
        notificationService: NotificationService,
        cacheService: BibikosCacheService
      ) => ({
        onSubscriptionCreateSuccess: (userId, subscription) => {
          notificationService.createNotification({
            receiverIds: [userId],
            message: getSubscriptionActivatedMessage({ planName: subscription.name }),
          })
        },
        onSubscriptionEvent: async (userId, event) => {
          apiLogger.log(`Subscription event callback received with event: '${event}' and userId: ${userId}`)
          await cacheService.invalidate(SUBSCRIPTION_STATUS_KEY, userId)
          userPresenceWebsocketService.sendToUsers([userId], Events.refreshSession, true)
        },
        onSubscriptionUpdateSuccess: () => {
          // Updates without specific context are handled via webhooks for UI refresh
          // Specific actions like renewals have their own callbacks
        },
        onSubscriptionRenewSuccess: (userId, subscription) => {
          notificationService.createNotification({
            receiverIds: [userId],
            message: getSubscriptionRenewedMessage({ planName: subscription.name }),
          })
        },
        onSubscriptionDeleteSuccess: (userId, subscription) => {
          notificationService.createNotification({
            receiverIds: [userId],
            message: getSubscriptionCanceledMessage({
              planName: subscription.name,
              cancelAt: subscription.cancelAt,
            }),
          })
        },
        onSubscriptionExpiredSuccess: (userId, subscription) => {
          notificationService.createNotification({
            receiverIds: [userId],
            message: getSubscriptionExpiredMessage({ planName: subscription.name }),
          })
        },
        onTrialStarted: async (userId, subscription) => {
          notificationService.createNotification({
            receiverIds: [userId],
            message: getTrialStartedMessage({ planName: subscription.name }),
          })
          userPresenceWebsocketService.sendToUsers([userId], Events.refreshSession, true)
          await cacheService.invalidate(SUBSCRIPTION_STATUS_KEY, userId)
        },
        onTrialExpired: async (userId, subscription) => {
          notificationService.createNotification({
            receiverIds: [userId],
            message: getTrialExpiredMessage({ planName: subscription.name }),
          })
          userPresenceWebsocketService.sendToUsers([userId], Events.refreshSession, true)
          await cacheService.invalidate(SUBSCRIPTION_STATUS_KEY, userId)
        },
      }),
    }),
    ContactServerModule.forRootAsync({
      imports: [NotificationServerModule, PrismaModule],
      inject: [NotificationService, PrismaService],
      useFactory: async (notificationService: NotificationService, prisma: PrismaService) => ({
        onContactMessageCreated: async (message) => {
          const adminUsers = await prisma.authUser.findMany({
            where: {
              userRole: {
                some: {
                  role: {
                    name: 'ADMIN',
                  },
                },
              },
            },
            select: { id: true },
          })

          if (adminUsers.length > 0) {
            const adminIds = adminUsers.map((u) => u.id)
            await notificationService.createNotification({
              receiverIds: adminIds,
              message: getContactMessage(message),
              type: 'contact_message',
              link: '/admin/contact-messages',
            })
            apiLogger.log(`Contact message notification sent to ${adminIds.length} admin(s)`)
          }
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [REDIS, ConfigService],
      useFactory: async (redisClient: RedisClientType, configService: ConfigService) => {
        const redisStore = new Keyv({
          store: new KeyvRedis(redisClient, {
            keyPrefixSeparator: ':',
          }),
          ttl: 2 * 60 * 1000, // Cache for 2 minutes
          useKeyPrefix: false, // Disable Keyv's automatic prefixing to avoid double prefixing
          namespace: configService.get('REDIS_NAMESPACE'),
        })
        return {
          stores: redisStore,
        }
      },
    }),
  ],
  controllers: [AnnouncementsController, AppController],
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
          proxy: true, // IMPORTANT: Tells Express to trust the X-Forwarded-Proto header
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
      .exclude(
        'health',
        'payments/(.*)',
        'contact',
        'scheduling/organizers/public/(.*)',
        'scheduling/schedules/discover(.*)'
      )
      .forRoutes('*')
  }
}
