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
import { RefererMiddleware } from './middlewares/referer.middleware'
import { AuthService } from './services/auth.service'
import { UserService } from './services/user.service'
import { GithubOauthStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AuthConfiguration } from './types/auth.configuration'

@Module({
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    GithubOauthStrategy,
    JwtStrategy,
    AuthService,
    UserService,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: 'jwt',
      useFactory: async (authService: AuthService, req: any): Promise<any> => {
        return authService.decode(req?.cookies.accessToken)
      },
      inject: [AuthService, REQUEST],
    },
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
  exports: ['jwt', JwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule implements NestModule {
  constructor(
    @Inject('SESSION_SECRET') private readonly sessionSecret: string
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
          provide: 'JWT_SECRET',
          useFactory: async (config: AuthConfiguration) => config.jwtSercret,
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
      .apply(RefererMiddleware)
      .forRoutes(
        { path: '*google/login*', method: RequestMethod.GET },
        { path: '*github/login*', method: RequestMethod.GET },
        { path: '*facebook/login*', method: RequestMethod.GET }
      )
  }
}
