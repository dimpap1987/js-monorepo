import { ZodPipe } from '@js-monorepo/nest/pipes'
import {
  RegisterUserSchema,
  RegisterUserSchemaType,
} from '@js-monorepo/schemas'
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
import { AuthException } from '../../common/exceptions/api-exception'
import { AuthOpts, SessionConfiguration } from '../../common/types'
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
    return {
      user: req.user?.user,
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
        throw new AuthException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Login failed',
          'LOGIN_FAILED_EXCEPTION'
        )
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
    if (req.user?.user) {
      // If the user is logged in
      try {
        this.options.onLogin?.(req.user.user)
      } catch (e: any) {
        this.logger.error('Login callback error', e.stack)
      }
      res.redirect(this.options.redirectUiUrl as string)
    } else if (req.user?.unRegisteredUser) {
      // If the user is not logged in but has the UNREGISTERED-USER cookie
      res.redirect(`${this.options.redirectUiUrl}/auth/onboarding`)
    } else {
      // If the user is neither logged in nor has the cookie
      res.redirect(
        `${this.options.redirectUiUrl}/auth/login?error=access-denied`
      )
    }
  }
}
