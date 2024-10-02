import {
  RegisterUserSchema,
  RegisterUserSchemaType,
} from '@js-monorepo/schemas'
import { JwtPayload, ProviderName } from '@js-monorepo/types'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthGithub } from '../guards/github.guard'
import { AuthGoogle } from '../guards/google.guard'

import { ZodPipe } from '@js-monorepo/nest/pipes'
import { AuthException } from '../../common/exceptions/api-exception'
import { AuthService } from '../../common/services/interfaces/auth.service'
import { UnregisteredService } from '../../common/services/interfaces/unregistered-user.service'
import { authCookiesOptions } from '../../common/utils'
import { TokensService } from '../services/tokens.service'
import { AuthConfiguration } from '../types/auth.configuration'

@Controller('auth')
export class AuthJWTController {
  private readonly logger = new Logger(AuthJWTController.name)

  constructor(
    @Inject('AUTH_OPTIONS') private readonly options: AuthConfiguration,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('UNREGISTERED_USER_SERVICE')
    private unRegisteredUserService: UnregisteredService,
    private readonly tokensService: TokensService
  ) {}

  @Get('google/login')
  @UseGuards(AuthGoogle)
  async googleAuth() {
    return HttpStatus.OK
  }

  @Get('github/login')
  @UseGuards(AuthGithub)
  async githubAuth() {
    return HttpStatus.OK
  }

  @Get('google/redirect')
  @UseGuards(AuthGoogle)
  async googleAuthRedirect(
    @Req() req: Request & { user: { email: string; profileImage: string } },
    @Res() res: Response
  ) {
    return this.handleSocialRedirect(req, res, 'GOOGLE')
  }

  @Get('github/redirect')
  @UseGuards(AuthGithub)
  async githubAuthCallback(
    @Req() req: Request & { user: { email: string; profileImage: string } },
    @Res() res: Response
  ) {
    return this.handleSocialRedirect(req, res, 'GITHUB')
  }

  @Get('session')
  getUserMetadata(@Req() req: Request) {
    const { accessToken } = req.cookies
    const { user } = this.tokensService.verifyAcessToken(accessToken)
    return {
      user: user,
    }
  }

  @Get('logout')
  @HttpCode(200)
  async logOut(@Req() req: Request, @Res() res: Response) {
    const cookies = Object.keys(req.cookies)
    for (const cookie of cookies) {
      res.clearCookie(cookie)
    }
    res.send({})
  }

  @Post('register')
  async registerUser(
    @Body(new ZodPipe(RegisterUserSchema))
    { username }: RegisterUserSchemaType,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const token = req.cookies['UNREGISTERED-USER']

    if (!token) {
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Invalid token!',
        'INVALID_TOKEN_EXCEPTION'
      )
    }

    // Find unregistered user by token
    const unregisteredUser =
      await this.unRegisteredUserService.findUnRegisteredUserByToken(token)

    // create new user
    const user = await this.authService.createAuthUser(
      {
        email: unregisteredUser.email,
        username: username,
      },
      {
        id: unregisteredUser.providerId,
        profileImage: unregisteredUser.profileImage,
      }
    )

    this.handleLoggedInUser(
      {
        user: {
          id: user.id,
          username: user.username,
          roles: user.userRole?.map((userRole) => userRole.role.name),
          createdAt: user.createdAt,
          profileImage: unregisteredUser.profileImage,
        },
      },
      res,
      req
    )

    try {
      this.options.onRegister?.(user)
    } catch (e: any) {
      this.logger.error('Register callback error', e.stack)
    }

    res.status(HttpStatus.CREATED).send()
  }

  @Get('unregistered-user')
  getUnRegisteredUser(@Req() req: Request) {
    const token = req.cookies['UNREGISTERED-USER']
    if (!token) {
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Invalid token!',
        'INVALID_TOKEN_EXCEPTION'
      )
    }
    return this.unRegisteredUserService.findUnRegisteredUserByToken(token)
  }

  private handleLoggedInUser(payload: JwtPayload, res: Response, req: Request) {
    const tokens = this.tokensService.createJwtTokens(payload)
    // REFRESH TOKEN
    this.setRefreshTokenCookie(res, tokens.refreshToken)
    // ACCESS TOKEN
    this.setAccessTokenCookie(res, tokens.accessToken)
    // REMOVE UNREGISTERED USER
    res.clearCookie('UNREGISTERED-USER')
  }

  private async handleSocialRedirect(
    req: Request & { user: { email: string; profileImage: string } },
    res: Response,
    provider: ProviderName
  ) {
    const email = req.user?.email
    let redirectURI = this.options.redirectUiUrl

    if (!email) {
      this.logger.warn(`Empty email for provider: ${provider}`)
      return res.redirect(`${redirectURI}/auth/login?error=empty-email`)
    }

    const user = await this.authService.findAuthUserByEmail(email)

    if (user) {
      this.handleLoggedInUser(
        {
          user: {
            id: user.id,
            username: user.username,
            roles: user.userRole?.map((userRole) => userRole.role.name),
            createdAt: user.createdAt,
            profileImage: user.userProfiles[0]?.profileImage,
          },
        },
        res,
        req
      )
      try {
        this.options.onLogin?.(user)
      } catch (e: any) {
        this.logger.error('Signin call back error', e.stack)
      }
    } else {
      try {
        const unRegisteredUser =
          await this.unRegisteredUserService.createUnRegisteredUser({
            email: email,
            provider: provider,
            profileImage: req.user?.profileImage,
          })
        res.cookie('UNREGISTERED-USER', unRegisteredUser?.token, {
          httpOnly: false,
        })
        redirectURI = `${this.options.redirectUiUrl}/auth/onboarding`
      } catch (e2: any) {
        this.logger.error(`Error when creating unregistered user`, e2.stack)
        redirectURI = `${this.options.redirectUiUrl}/auth/login?error=user-creation`
      }
      this.logger.log(
        `UnRegistered User: '${email}' is being redirecting to: '${redirectURI}'`
      )
    }

    res.redirect(redirectURI as string)
  }

  setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, authCookiesOptions)
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, authCookiesOptions)
  }
}
