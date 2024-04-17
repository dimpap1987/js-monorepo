import { APP_FILTER, REQUEST } from '@nestjs/core'
import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import session from 'express-session'
import { CorsMiddleware } from './middlewares/cors.middleware'
import { CsrfValidatorMiddleware } from './middlewares/csrf-validator.middleware'
import { CsrfGeneratorMiddleware } from './middlewares/csrf-generator.middleware'
import { RefererMiddleware } from './middlewares/referer.middleware'
import { ApiExceptionFilter } from './exceptions/filter'
import { AuthController } from './controllers/auth.controller'
import { AuthConfiguration } from './types/auth.configuration'
import { GoogleStrategy } from './strategies/google.strategy'
import { GithubOauthStrategy } from './strategies/github.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AuthService } from './services/auth.service'
import { RolesGuard } from './guards/roles-guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { dbClient } from '@js-monorepo/db'
import { UserService } from './services/user.service'

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
      useClass: ApiExceptionFilter,
    },
    {
      provide: 'jwt',
      useFactory: async (authService: AuthService, req: any): Promise<any> => {
        return authService.decode(req?.cookies.accessToken)
      },
      inject: [AuthService, REQUEST],
    },
    {
      provide: 'PRISMA_CLIENT', // Provide token for your Prisma client
      useValue: dbClient, // Use the imported Prisma client singleton
    },
  ],
  exports: ['jwt', JwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule implements NestModule {
  static forRoot(config: AuthConfiguration): DynamicModule {
    return {
      module: AuthModule,
      imports: [],
      providers: [
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
      ],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: 'SESSION_SECRET',
          resave: false,
          saveUninitialized: false,
        })
      )
      .forRoutes('*')
      .apply(CorsMiddleware)
      .forRoutes('/')
      .apply(CsrfValidatorMiddleware)
      .forRoutes('/')
      .apply(CsrfGeneratorMiddleware)
      .forRoutes('/')
      .apply(RefererMiddleware)
      .forRoutes(
        { path: '*google/login*', method: RequestMethod.GET },
        { path: '*github/login*', method: RequestMethod.GET },
        { path: '*facebook/login*', method: RequestMethod.GET }
      )
  }
}
