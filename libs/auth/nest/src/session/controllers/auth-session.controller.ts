import { ZodPipe } from '@js-monorepo/nest/pipes'
import { RegisterUserSchema, RegisterUserSchemaType } from '@js-monorepo/schemas'
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Logger, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthException } from '../../common/exceptions/api-exception'
import { AuthOpts, SessionConfiguration } from '../../common/types'
import { decodeOAuthState } from '../../common/utils'
import { AuthGithub } from '../guards/github.guard'
import { AuthGoogle } from '../guards/google.guard'
import { SessionService } from '../services/session.service'

@Controller('auth')
export class AuthSessionController {
  private readonly logger = new Logger(AuthSessionController.name)

  constructor(
    @Inject(AuthOpts) private readonly options: SessionConfiguration,
    private readonly sessionService: SessionService
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
    this.handleSocialRedirect(req, res)
  }

  @Get('github/redirect')
  @UseGuards(AuthGithub)
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.handleSocialRedirect(req, res)
  }

  @Get('logout')
  @HttpCode(204)
  async logOut(@Req() req: Request, @Res() res: Response) {
    req.logOut((error) => {
      if (error) {
        this.logger.error('There was an error in logout', error.stack)
      }
    })
    res.send()
  }

  @Get('session')
  getSession(@Req() req: Request) {
    const user = req.user?.user
    if (!user) return null

    const { email, ...restUser } = user
    return {
      user: { ...restUser },
    }
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
        'Invalid unregistered user token!',
        'INVALID_UNREGISTERED-USER_EXCEPTION'
      )
    }

    // create new user
    const user = await this.sessionService.handleRegister(token, username)

    try {
      this.options.onRegister?.(user)
    } catch (e: any) {
      this.logger.error('Register callback error', e.stack)
    }

    res.clearCookie('UNREGISTERED-USER')
    req.logIn({ user }, (err) => {
      if (err) {
        this.logger.error('ERROR after register', err.stack)
        throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, 'Login failed', 'LOGIN_FAILED_EXCEPTION')
      } else {
        res.status(HttpStatus.CREATED).send()
      }
    })
  }

  @Get('unregistered-user')
  getUnRegisteredUser(@Req() req: Request) {
    const token = req.cookies['UNREGISTERED-USER']
    if (!token) {
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Invalid unregistered user token!',
        'INVALID_UNREGISTERED-USER_EXCEPTION'
      )
    }
    return this.sessionService.findUnRegisteredUserByToken(token)
  }

  private async handleSocialRedirect(req: Request, res: Response) {
    const state = req.query['state'] as string
    const callbackUrl = state ? decodeOAuthState(state)?.callbackUrl : undefined

    const baseUrl = this.options.redirectUiUrl as string

    if (req.user?.user) {
      try {
        this.options.onLogin?.(req.user.user)
      } catch (e: any) {
        this.logger.error('Login callback error', e.stack)
      }
      const redirectUrl = callbackUrl ? `${baseUrl}${callbackUrl}` : baseUrl
      res.redirect(redirectUrl)
    } else if (req.user?.unRegisteredUser) {
      const onboardingUrl = callbackUrl
        ? `${baseUrl}/auth/onboarding?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : `${baseUrl}/auth/onboarding`
      res.redirect(onboardingUrl)
    } else {
      res.redirect(`${baseUrl}/auth/login?error=access-denied`)
    }
  }
}
