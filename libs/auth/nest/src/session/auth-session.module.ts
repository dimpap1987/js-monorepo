import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { CsrfGeneratorMiddleware } from '../common/middlewares/csrf-generator.middleware'
import { AuthProviderModule } from '../common/modules/auth.provider.modules'
import { UnRegisteredUserProviderModule } from '../common/modules/unregisteredUser.provider.module'
import { AuthService } from '../common/services/interfaces/auth.service'
import { UnregisteredService } from '../common/services/interfaces/unregistered-user.service'
import { GithubOauthStrategy } from '../common/strategies/github.strategy'
import { GoogleStrategy } from '../common/strategies/google.strategy'
import {
  AuthConfig,
  AuthOpts,
  ServiceAuth,
  ServiceUnRegisteredUser,
  SessionConfiguration,
} from '../common/types'
import { AuthSessionController } from './controllers/auth-session.controller'
import { LoggedInGuard } from './guards/login.guard'
import { RolesGuard } from './guards/roles-guard'
import { AuthSessionMiddleware } from './middlewares/auth-session.middleware'
import { SessionSerializer } from './providers/session-serializer'

@Module({
  imports: [
    PassportModule.register({
      session: true,
    }),
    AuthProviderModule,
    UnRegisteredUserProviderModule,
  ],
  controllers: [AuthSessionController],
  providers: [
    RolesGuard,
    LoggedInGuard,
    SessionSerializer,
    AuthSessionMiddleware,
  ],
  exports: [
    RolesGuard,
    LoggedInGuard,
    SessionSerializer,
    AuthSessionMiddleware,
  ],
})
export class AuthSessionModule implements NestModule {
  constructor(
    @Inject(AuthConfig) private readonly config: SessionConfiguration,
    @Inject(ServiceAuth) private authService: AuthService,
    @Inject(ServiceUnRegisteredUser)
    private unRegisteredUserService: UnregisteredService
  ) {}

  static forRootAsync(options: {
    useFactory: (
      ...fn: any
    ) => Promise<SessionConfiguration> | SessionConfiguration
    inject?: any[]
    imports?: any[]
  }): DynamicModule {
    return {
      global: true,
      module: AuthSessionModule,
      imports: options.imports,
      providers: [
        {
          provide: AuthConfig,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: AuthOpts,
          useFactory: async (config: SessionConfiguration) => ({
            google: config.google,
            github: config.github,
            crf: config.csrf,
            redirectUiUrl: config.redirectUiUrl,
            onRegister: config.onRegister,
            onLogin: config.onLogin,
          }),
          inject: [AuthConfig],
        },
        {
          provide: GoogleStrategy,
          useFactory: (
            config: SessionConfiguration,
            authService: AuthService,
            unRegisteredUserService: UnregisteredService
          ) => {
            if (config.google)
              return new GoogleStrategy(
                config,
                authService,
                unRegisteredUserService
              )
            return null
          },
          inject: [AuthOpts, ServiceAuth, ServiceUnRegisteredUser],
        },
        {
          provide: GithubOauthStrategy,
          useFactory: (
            config: SessionConfiguration,
            authService: AuthService,
            unRegisteredUserService: UnregisteredService
          ) => {
            if (config.github)
              new GithubOauthStrategy(
                config,
                authService,
                unRegisteredUserService
              )
            return null
          },
          inject: [AuthOpts, ServiceAuth, ServiceUnRegisteredUser],
        },
      ],
    }
  }

  configure(consumer: MiddlewareConsumer) {
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
