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
import { AuthService } from './services/auth.service'
import { UserService } from './services/user.service'
import { GithubOauthStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { AuthConfiguration } from './types/auth.configuration'
import csurf = require('csurf')
import { RefreshTokenService } from './services/refreshToken.service'
import { TokenRotationMiddleware } from './middlewares/token-rotation.middleware'
import { TokensService } from './services/tokens.service'

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
    AuthService,
    UserService,
    JwtAuthGuard,
    RolesGuard,
    RefreshTokenService,
    TokenRotationMiddleware,
    TokensService,
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
    AuthService,
    TokenRotationMiddleware,
    TokensService,
  ],
})
export class AuthModule implements NestModule {
  constructor(
    @Inject('SESSION_SECRET') private readonly sessionSecret: string,
    @Inject('CSRF_ENABLED') private readonly csrfEnabled: boolean
  ) {}

  static forRootAsync(options: {
    useFactory: (...fn: any) => Promise<AuthConfiguration> | AuthConfiguration
    inject?: any[]
    imports?: any[]
  }): DynamicModule {
    return {
      module: AuthModule,
      imports: options.imports,
      providers: [
        {
          provide: 'AUTH_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: 'SESSION_SECRET',
          useFactory: async (config: AuthConfiguration) => config.sessionSecret,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'ACCESS_TOKEN_SECRET',
          useFactory: async (config: AuthConfiguration) =>
            config.accessTokenSecret,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'REFRESH_TOKEN_SECRET',
          useFactory: async (config: AuthConfiguration) =>
            config.refreshTokenSecret,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'DB_CLIENT',
          useFactory: async (config: AuthConfiguration) => config.dbClient,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'GOOGLE-AUTH',
          useFactory: async (config: AuthConfiguration) => config.google,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'GITHUB-AUTH',
          useFactory: async (config: AuthConfiguration) => config.github,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'REDIRECT_UI_URL',
          useFactory: async (config: AuthConfiguration) => config.redirectUiUrl,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'ON_REGISTER_CALLBACK',
          useFactory: async (config: AuthConfiguration) => config.onRegister,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'ON_LOGIN_CALLBACK',
          useFactory: async (config: AuthConfiguration) => config.onLogin,
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: 'CSRF_ENABLED',
          useFactory: async (config: AuthConfiguration) =>
            config.csrfEnabled ?? false,
          inject: ['AUTH_CONFIG'],
        },
      ],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: this.sessionSecret,
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

    if (this.csrfEnabled) {
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
