import { PrismaService } from '@js-monorepo/db'
import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { APP_FILTER, REQUEST } from '@nestjs/core'
import session from 'express-session'
import { AuthController } from './controllers/auth.controller'
import { AuthExceptionFilter } from './exceptions/filter'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { RolesGuard } from './guards/roles-guard'
import { CsrfGeneratorMiddleware } from './middlewares/csrf-generator.middleware'
import { TokenRotationMiddleware } from './middlewares/token-rotation.middleware'
import { AuthServiceImpl } from './services/implementations/auth.service'
import { RefreshTokenServiceImpl } from './services/implementations/refreshToken.service'
import { UnregisteredServiceImpl } from './services/implementations/unregistered-user.service'
import { TokensService } from './services/tokens.service'
import { GithubOauthStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { AuthConfiguration } from './types/auth.configuration'
import csurf = require('csurf')
import { AuthRepositoryPrismaImpl } from './repositories/implementations/prisma/auth.repository'
import { RefreshTokenRepositoryPrismaImpl } from './repositories/implementations/prisma/refreshToken.repository'
import { UnRegisteredUserRepositoryPrismaImpl } from './repositories/implementations/prisma/unregistered.repository'

export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    domain:
      process.env.NODE_ENV === 'production'
        ? process.env.AUTH_COOKIE_DOMAIN_PROD
        : 'localhost',
    sameSite: 'strict',
  },
})

@Module({
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    GithubOauthStrategy,
    TokensService,
    {
      provide: 'AUTH_REPOSITORY',
      useClass: AuthRepositoryPrismaImpl,
    },
    {
      provide: 'REFRESH_TOKEN_REPOSITORY',
      useClass: RefreshTokenRepositoryPrismaImpl,
    },
    {
      provide: 'UNREGISTERED_USER_REPOSITORY',
      useClass: UnRegisteredUserRepositoryPrismaImpl,
    },
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthServiceImpl,
    },
    {
      provide: 'REFRESH_TOKEN_SERVICE',
      useClass: RefreshTokenServiceImpl,
    },
    {
      provide: 'UNREGISTERED_USER_SERVICE',
      useClass: UnregisteredServiceImpl,
    },
    JwtAuthGuard,
    RolesGuard,
    TokenRotationMiddleware,
    {
      provide: 'jwt',
      useFactory: async (
        tokenService: TokensService,
        req: any
      ): Promise<any> => {
        return tokenService.decode(req?.cookies.accessToken)
      },
      inject: [TokensService, REQUEST],
    },
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
  exports: [
    'jwt',
    JwtAuthGuard,
    RolesGuard,
    TokenRotationMiddleware,
    TokensService,
  ],
})
export class AuthModule implements NestModule {
  constructor(
    @Inject('AUTH_CONFIG') private readonly config: AuthConfiguration
  ) {}

  static forRootAsync(options: {
    useFactory: (...fn: any) => Promise<AuthConfiguration> | AuthConfiguration
    inject?: any[]
    imports?: any[]
  }): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      imports: options.imports,
      providers: [
        {
          provide: 'AUTH_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        // TODO inject it from client
        {
          provide: 'DB_CLIENT',
          useExisting: PrismaService,
        },
        {
          provide: 'AUTH_OPTIONS',
          useFactory: async (config: AuthConfiguration) => ({
            sessionSecret: config.sessionSecret,
            accessTokenSecret: config.accessTokenSecret,
            refreshTokenSecret: config.refreshTokenSecret,
            google: config.google,
            github: config.github,
            redirectUiUrl: config.redirectUiUrl,
            onRegister: config.onRegister,
            onLogin: config.onLogin,
            csrfEnabled: config.csrfEnabled ?? false,
          }),
          inject: ['AUTH_CONFIG'],
        },
      ],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: this.config.sessionSecret,
          resave: false,
          saveUninitialized: false,
        })
      )
      .forRoutes('*')

      .apply(TokenRotationMiddleware)
      .exclude(
        '/',
        'auth/google/login',
        'auth/github/login',
        'auth/facebook/login',
        'auth/google/redirect',
        'auth/github/redirect',
        'auth/logout',
        'auth/register',
        'auth/unregistered-user'
      )
      .forRoutes('*')

    if (this.config.csrfEnabled) {
      consumer
        .apply(CsrfGeneratorMiddleware)
        .forRoutes(
          { path: '*google/login*', method: RequestMethod.GET },
          { path: '*github/login*', method: RequestMethod.GET },
          { path: '*facebook/login*', method: RequestMethod.GET },
          { path: '*', method: RequestMethod.POST },
          { path: '*', method: RequestMethod.PUT },
          { path: '*', method: RequestMethod.DELETE }
        )
    }
  }
}
