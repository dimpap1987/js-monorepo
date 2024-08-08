import {
  RegisterUserSchema,
  RegisterUserSchemaType,
} from '@js-monorepo/schemas'
import { JwtPayload, ProviderName } from '@js-monorepo/types'
import { getBrowserInfo, getIPAddress } from '@js-monorepo/utils/http'
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
import { AuthException } from '../exceptions/api-exception'
import { AuthGithub } from '../guards/github.guard'
import { AuthGoogle } from '../guards/google.guard'
import { ZodPipe } from '../pipes/zod.pipe'

import { AuthService } from '../services/interfaces/auth.service'
import { RefreshTokenService } from '../services/interfaces/refreshToken.service'
import { UnregisteredService } from '../services/interfaces/unregistered-user.service'
import { TokensService } from '../services/tokens.service'
import { AuthConfiguration } from '../types/auth.configuration'
import { authCookiesOptions } from '../utils'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    @Inject('AUTH_OPTIONS') private readonly options: AuthConfiguration,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('REFRESH_TOKEN_SERVICE')
    private refreshTokenService: RefreshTokenService,
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
    @Req() req: Request & { user: { email: string; picture: string } },
    @Res() res: Response
  ) {
    return this.handleSocialRedirect(req, res, 'google')
  }

  @Get('github/redirect')
  @UseGuards(AuthGithub)
  async githubAuthCallback(
    @Req() req: Request & { user: { email: string; picture: string } },
    @Res() res: Response
  ) {
    return this.handleSocialRedirect(req, res, 'github')
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
    this.refreshTokenService.revokeRefreshTokenByToken(req.cookies.refreshToken)
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
        type: unregisteredUser.provider,
        profileImage: unregisteredUser.profileImage,
      }
    )

    this.handleLoggedInUser(
      {
        user: {
          id: user.id,
          username: user.username,
          roles: user.roles,
          createdAt: user.createdAt,
          picture: unregisteredUser.profileImage,
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
    return this.unRegisteredUserService.findUnRegisteredUserByToken(token)
  }

  private handleLoggedInUser(payload: JwtPayload, res: Response, req: Request) {
    const tokens = this.tokensService.createJwtTokens(payload)
    this.refreshTokenService.storeRefreshToken({
      token: tokens.refreshToken,
      userAgent: getBrowserInfo(req),
      ipAddress: getIPAddress(req),
      userId: payload.user.id,
    })
    // REFRESH TOKEN
    this.setRefreshTokenCookie(res, tokens.refreshToken)
    // ACCESS TOKEN
    this.setAccessTokenCookie(res, tokens.accessToken)
    // REMOVE UNREGISTERED USER
    res.clearCookie('UNREGISTERED-USER')
  }

  private async handleSocialRedirect(
    req: Request & { user: { email: string; picture: string } },
    res: Response,
    provider: ProviderName
  ) {
    const email = req.user?.email
    let redirectURI = this.options.redirectUiUrl

    if (!email) {
      this.logger.warn(`Empty email for provider: ${provider}`)
      return res.redirect(`${redirectURI}/auth/login?error=empty-email`)
    }
    try {
      const user = await this.authService.findAuthUserByEmail(email)

      this.handleLoggedInUser(
        {
          user: {
            id: user.id,
            username: user.username,
            roles: user.roles,
            createdAt: user.createdAt,
            picture: user.providers[0]?.profileImage,
          },
        },
        res,
        req
      )
      redirectURI =
        req.session['redirect-after-login'] ?? `${this.options.redirectUiUrl}`
      try {
        this.options.onLogin?.(user)
      } catch (e: any) {
        this.logger.error('Signin call back error', e.stack)
      }
    } catch (e) {
      if (
        e instanceof AuthException &&
        e.errorCode === 'NOT_FOUND_USER_EXCEPTION'
      ) {
        //Handle Unregistered User
        try {
          const unRegisteredUser =
            await this.unRegisteredUserService.createUnRegisteredUser({
              email: email,
              provider: provider,
              profileImage: req.user?.picture,
            })
          res.cookie('UNREGISTERED-USER', unRegisteredUser?.token, {
            httpOnly: true,
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
    } finally {
      res.redirect(redirectURI as string)
    }
  }

  setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, authCookiesOptions)
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, authCookiesOptions)
  }
}
