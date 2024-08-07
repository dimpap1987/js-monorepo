import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { APP_FILTER, REQUEST } from '@nestjs/core'
import { AuthController } from './controllers/auth.controller'
import { AuthExceptionFilter } from './exceptions/filter'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { RolesGuard } from './guards/roles-guard'
import { CsrfGeneratorMiddleware } from './middlewares/csrf-generator.middleware'
import { TokenRotationMiddleware } from './middlewares/token-rotation.middleware'
import { AuthProviderModule } from './modules/auth.provider.modules'
import { RefreshTokenProviderModule } from './modules/refreshToken.provider.module'
import { UnRegisteredUserProviderModule } from './modules/unregisteredUser.provider.module'
import { RefreshTokenService } from './services/interfaces/refreshToken.service'
import { TokensService } from './services/tokens.service'
import { GithubOauthStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { AuthConfiguration } from './types/auth.configuration'
import { authCookiesOptions } from './utils'
import csurf = require('csurf')

export const csrfProtection = csurf({
  cookie: authCookiesOptions,
})

export const AuthJWT = Symbol()

@Module({
  imports: [
    AuthProviderModule,
    RefreshTokenProviderModule,
    UnRegisteredUserProviderModule,
  ],
  controllers: [AuthController],
  providers: [
    TokensService,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: AuthJWT,
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
  exports: [AuthJWT, JwtAuthGuard, RolesGuard, TokensService],
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
        {
          provide: 'AUTH_OPTIONS',
          useFactory: async (config: AuthConfiguration) => ({
            accessTokenSecret: config.accessTokenSecret,
            refreshTokenSecret: config.refreshTokenSecret,
            tokenRotation: config.tokenRoation,
            crf: config.csrf,
            google: config.google,
            github: config.github,
            redirectUiUrl: config.redirectUiUrl,
            onRegister: config.onRegister,
            onLogin: config.onLogin,
          }),
          inject: ['AUTH_CONFIG'],
        },
        {
          provide: GoogleStrategy,
          useFactory: (config: AuthConfiguration) => {
            if (config.google) return new GoogleStrategy(config)
            return null
          },
          inject: ['AUTH_OPTIONS'],
        },
        {
          provide: GithubOauthStrategy,
          useFactory: (config: AuthConfiguration) => {
            if (config.github) new GithubOauthStrategy(config)
            return null
          },
          inject: ['AUTH_OPTIONS'],
        },
        {
          provide: TokenRotationMiddleware,
          useFactory: (
            config: AuthConfiguration,
            refreshTokenService: RefreshTokenService
          ) => {
            if (config.tokenRoation?.enabled) {
              return new TokenRotationMiddleware(refreshTokenService)
            }
            return null
          },
          inject: ['AUTH_OPTIONS'],
        },
      ],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    if (this.config.tokenRoation?.enabled) {
      consumer
        .apply(TokenRotationMiddleware)
        .exclude(
          'auth/google/login',
          'auth/github/login',
          'auth/facebook/login',
          'auth/google/redirect',
          'auth/github/redirect',
          'auth/logout',
          'auth/register',
          'auth/unregistered-user',
          ...(this.config.tokenRoation?.middlewareExclusions || [])
        )
        .forRoutes('*')
    }

    if (this.config.csrf?.enabled) {
      consumer
        .apply(CsrfGeneratorMiddleware)
        .exclude(...(this.config.csrf?.middlewareExclusions || []))
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
