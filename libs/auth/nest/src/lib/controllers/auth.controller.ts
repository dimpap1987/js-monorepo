import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthRole, Provider } from '@prisma/client'
import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return HttpStatus.OK
  }

  @Get('github/login')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    return HttpStatus.OK
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    return this.handleSocialRedirect(req, res, Provider.GOOGLE)
  }

  @Get('github/redirect')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleSocialRedirect(req, res, Provider.GITHUB)
  }

  @Get('session')
  getUserMetadata(@Req() req: Request) {
    const accessToken = req.cookies.accessToken
    return this.authService.handleSessionRequest(accessToken)
  }

  @Post('/register')
  async registerUser(
    @Body() registerUserDto: { username: string; token: string },
    @Res() res: Response
  ) {
    const unregisteredUser = await this.userService.findUnRegisteredUserByToken(
      registerUserDto.token
    )
    const user = await this.userService.createAuthUser({
      username: registerUserDto.username,
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
        message: 'User created Successfully',
      })
    } else {
      res
        .send({
          message: 'Something went wrong',
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
      const redirectURI =
        req.session['redirect-after-login'] ??
        'http://localhost:3000/auth/onboarding'
      Logger.log(
        `UnRegistered User: '${email}' is being redirecting to: '${redirectURI}' in order to be registered`
      )
      res.redirect(redirectURI)
    }
  }
}
