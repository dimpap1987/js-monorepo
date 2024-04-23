import { RegisterUserDto, RegisterUserSchema } from '@js-monorepo/schemas'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthRole, Provider } from '@prisma/client'
import { Request, Response } from 'express'
import { AuthGithub } from '../guards/github.guard'
import { AuthGoogle } from '../guards/google.guard'
import { ZodPipe } from '../pipes/zod.pipe'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
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
    return this.handleSocialRedirect(req, res, Provider.GOOGLE)
  }

  @Get('github/redirect')
  @UseGuards(AuthGithub)
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleSocialRedirect(req, res, Provider.GITHUB)
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
    { username }: RegisterUserDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const token = req.cookies['UNREGISTERED-USER']

    // Find unregistered user by token
    const unregisteredUser =
      await this.userService.findUnRegisteredUserByToken(token)

    // create new user
    const user = await this.userService.createAuthUser({
      username: username,
      email: unregisteredUser?.email as string,
      roles: [AuthRole.USER],
    })

    if (user) {
      this.handleLoggedInUser(
        {
          user: {
            username: user.username,
            roles: user.roles,
            createdAt: user.createdAt,
          },
        },
        res
      )
      res.send({
        success: true,
        message: 'User created Successfully',
      })
    } else {
      res
        .send({
          success: false,
          errors: ['Something went wrong'],
        })
        .status(400)
    }
  }

  handleLoggedInUser(
    payload: { user: { username: string; roles: AuthRole[]; createdAt: Date } },
    res: Response
  ) {
    const tokens = this.authService.createJwtTokens(payload)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true })
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true })
  }

  async handleSocialRedirect(req: any, res: any, provider: Provider) {
    const email = req.user?.email

    const user = await this.userService.findAuthUserByEmail(email)

    if (user) {
      this.handleLoggedInUser(
        {
          user: {
            username: user?.username,
            roles: user?.roles,
            createdAt: user?.createdAt,
          },
        },
        res
      )
      Logger.log(`User: ${user.username} successfully logged in !!!`)
      const redirectURI =
        req.session['redirect-after-login'] ?? 'http://localhost:3000'
      res.redirect(redirectURI)
    } else {
      const unRegisteredUser = await this.userService.createUnRegisteredUser({
        email: email,
        provider: provider,
      })
      res.cookie('UNREGISTERED-USER', unRegisteredUser?.token)
      const redirectURI = 'http://localhost:3000/auth/onboarding'
      Logger.log(
        `UnRegistered User: '${email}' is being redirecting to: '${redirectURI}'`
      )
      res.redirect(redirectURI)
    }
  }
}
