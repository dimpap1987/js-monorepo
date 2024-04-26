import {
  RegisterUserSchema,
  RegisterUserSchemaType,
} from '@js-monorepo/schemas'
import { JwtPayload } from '@js-monorepo/types'
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
import { ProviderEnum } from '@prisma/client'
import { Request, Response } from 'express'
import { AuthException } from '../exceptions/api-exception'
import { AuthGithub } from '../guards/github.guard'
import { AuthGoogle } from '../guards/google.guard'
import { ZodPipe } from '../pipes/zod.pipe'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    @Inject('REDIRECT_UI_URL') private readonly redirectUrl: string
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
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    return this.handleSocialRedirect(req, res, ProviderEnum.GOOGLE)
  }

  @Get('github/redirect')
  @UseGuards(AuthGithub)
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleSocialRedirect(req, res, ProviderEnum.GITHUB)
  }

  @Get('session')
  getUserMetadata(@Req() req: Request) {
    const accessToken = req.cookies.accessToken
    return this.authService.handleSessionRequest(accessToken)
  }

  @Get('logout')
  @HttpCode(200)
  async logOut(@Res() res: Response) {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.clearCookie('_csrf')
    res.clearCookie('XSRF-TOKEN')
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

    // Find unregistered user by token
    const unregisteredUser =
      await this.userService.findUnRegisteredUserByToken(token)

    // create new user
    const user = await this.userService.createAuthUser(
      {
        email: unregisteredUser.email,
        username: username,
      },
      {
        type: unregisteredUser.providerEnum,
        profileImage: unregisteredUser.profileImage,
      }
    )

    this.handleLoggedInUser(
      {
        user: {
          username: user.username,
          roles: user.roles,
          createdAt: user.createdAt,
          picture: unregisteredUser.profileImage,
        },
      },
      res
    )
    res.clearCookie('UNREGISTERED-USER')
    res.status(HttpStatus.CREATED).send()
  }

  @Get('unregistered-user')
  getUnRegisteredUser(@Req() req: Request) {
    const token = req.cookies['UNREGISTERED-USER']
    return this.userService.findUnRegisteredUserByToken(token)
  }

  private handleLoggedInUser(payload: JwtPayload, res: Response) {
    const tokens = this.authService.createJwtTokens(payload)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true })
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true })
  }

  private async handleSocialRedirect(
    req: any,
    res: Response,
    provider: ProviderEnum
  ) {
    const email = req.user?.email
    let redirectURI = this.redirectUrl

    try {
      const user = await this.userService.findAuthUserByEmail(email)
      // Handle Logged in user
      this.handleLoggedInUser(
        {
          user: {
            username: user.username,
            roles: user.roles,
            createdAt: user.createdAt,
            picture: user.providers[0]?.profileImage,
          },
        },
        res
      )
      Logger.log(`User: ${user.username} successfully logged in !!!`)
      redirectURI = req.session['redirect-after-login'] ?? `${this.redirectUrl}`
    } catch (e) {
      if (
        e instanceof AuthException &&
        e.errorCode === 'NOT_FOUND_USER_EXCEPTION'
      ) {
        //Handle Unregistered User
        const unRegisteredUser = await this.userService.createUnRegisteredUser({
          email: email,
          providerEnum: provider,
          profileImage: req.user?.picture,
        })
        res.cookie('UNREGISTERED-USER', unRegisteredUser?.token, {
          httpOnly: true,
        })
        redirectURI = `${this.redirectUrl}/auth/onboarding`
        Logger.log(
          `UnRegistered User: '${email}' is being redirecting to: '${redirectURI}'`
        )
      }
    } finally {
      res.redirect(redirectURI)
    }
  }
}
