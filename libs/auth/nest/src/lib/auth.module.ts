import { DynamicModule, Inject, Module } from '@nestjs/common'
import { APP_FILTER, REQUEST } from '@nestjs/core'
import { AuthController } from './controllers/auth.controller'
import {
  AuthExceptionFilter,
  BadRequestExceptionFilter,
  HttpExceptionFilter,
  PrismaClientExceptionFilter,
  ZodExceptionFilter,
} from './exceptions/filter'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { RolesGuard } from './guards/roles-guard'
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
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
    {
      provide: 'jwt',
      useFactory: async (authService: AuthService, req: any): Promise<any> => {
        return authService.decode(req?.cookies.accessToken)
      },
      inject: [AuthService, REQUEST],
    },
  ],
  exports: ['jwt', JwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule {
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
      ],
      exports: [
        'SESSION_SECRET',
        'JWT_SECRET',
        'DB_CLIENT',
        'ON_REGISTER_CALLBACK',
        'REDIRECT_UI_URL',
        'GITHUB-AUTH',
        'GOOGLE-AUTH',
      ],
    }
  }
}
