import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Octokit } from 'octokit'
import { Strategy } from 'passport-github'
import * as oauth2 from 'passport-oauth2'
import { AuthService } from '../services/interfaces/auth.service'
import { UnregisteredService } from '../services/interfaces/unregistered-user.service'
import {
  AuthOpts,
  ServiceAuth,
  ServiceUnRegisteredUser,
  SessionConfiguration,
} from '../types'

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject(AuthOpts) private readonly options: SessionConfiguration,
    @Inject(ServiceAuth) private authService: AuthService,
    @Inject(ServiceUnRegisteredUser)
    private unRegisteredUserService: UnregisteredService
  ) {
    super({
      clientID: options.github?.clientId,
      clientSecret: options.github?.clientSecret,
      callbackURL: options.github?.callBackUrl,
      scope: ['read:project', 'user:email', 'read:user'],
    })
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: oauth2.VerifyCallback
  ) {
    const userEmails = await this.getUsersEmailsResponse(accessToken)
    const emailObj = userEmails?.data?.find(
      (d: { primary: any; verified: any }) => d.primary && d.verified
    )
    const email = emailObj?.email
    const user = await this.authService.findAuthUserByEmail(email)

    if (user) {
      // If the user exists in the database
      done(null, {
        user: {
          id: user.id,
          username: user.username,
          roles: user.userRole?.map((userRole) => userRole.role.name),
          createdAt: user.createdAt,
          profileImage: user.userProfiles?.[0]?.profileImage,
          profile: {
            image: user.userProfiles?.[0]?.profileImage,
            provider: user.userProfiles?.[0]?.provider.name,
          },
        },
      })
    } else {
      // If the user doesn't exist in the database
      try {
        const unRegisteredUser =
          await this.unRegisteredUserService.createUnRegisteredUser({
            email: email,
            provider: 'GITHUB',
            profileImage: profile.photos[0].value,
          })

        done(null, {
          unRegisteredUser: unRegisteredUser,
        })
      } catch (e: any) {
        done(e, undefined)
      }
    }
  }

  private async getUsersEmailsResponse(token: string): Promise<any> {
    const octokit = new Octokit({
      auth: token,
    })
    return octokit.request('GET /user/emails', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
  }
}
