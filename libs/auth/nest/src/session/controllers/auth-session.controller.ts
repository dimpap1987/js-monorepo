import { ZodPipe } from '@js-monorepo/nest-utils'
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
import { AuthService } from '../../common/services/interfaces/auth.service'
import { UnregisteredService } from '../../common/services/interfaces/unregistered-user.service'
import { SessionConfiguration } from '../../common/types/auth.configuration'
import { AuthGithub } from '../guards/github.guard'
import { AuthGoogle } from '../guards/google.guard'

@Controller('auth')
export class AuthSessionController {
  private readonly logger = new Logger(AuthSessionController.name)

  constructor(
    @Inject('AUTH_OPTIONS') private readonly options: SessionConfiguration,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('UNREGISTERED_USER_SERVICE')
    private unRegisteredUserService: UnregisteredService
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
  @HttpCode(200)
  async logOut(@Req() req: Request, @Res() res: Response) {
    req.logOut(() => {})
    req.session.cookie.maxAge = 0
    res.send({ message: 'Logged out successfully' })
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
    return this.unRegisteredUserService.findUnRegisteredUserByToken(token)
  }

  private async handleSocialRedirect(req: Request, res: Response) {
    if (req.user?.user) {
      // If the user is logged in
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
