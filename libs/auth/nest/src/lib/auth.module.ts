import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { APP_FILTER, REQUEST } from '@nestjs/core'
import { PrismaClient } from '@prisma/client'
import session from 'express-session'
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
export class AuthModule implements NestModule {
  constructor(
    @Inject('SESSION_SECRET') private readonly sessionSecret: string
  ) {}

  static forRoot(
    prisma: PrismaClient,
    config: AuthConfiguration
  ): DynamicModule {
    return {
      module: AuthModule,
      imports: [],
      providers: [
        {
          provide: 'DB_CLIENT',
          useValue: prisma,
        },
        {
          provide: 'SESSION_SECRET',
          useValue: config.sessionSecret,
        },
        {
          provide: 'JWT_SECRET',
          useValue: config.jwtSercret,
        },
        {
          provide: 'GOOGLE-AUTH',
          useValue: config.google,
        },
        {
          provide: 'GITHUB-AUTH',
          useValue: config.github,
        },
        {
          provide: 'REDIRECT_UI_URL',
          useValue: config.redirectUiUrl,
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
