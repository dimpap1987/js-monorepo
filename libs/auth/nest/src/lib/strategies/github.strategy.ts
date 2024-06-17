import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { VerifyCallback } from 'jsonwebtoken'
import { Octokit } from 'octokit'
import { Strategy } from 'passport-github'
import { GithubAuth } from '../types/auth.configuration'

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(@Inject('GITHUB-AUTH') private readonly config: GithubAuth) {
    super({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callBackUrl,
      scope: ['read:project', 'user:email', 'read:user'],
    })
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    const userEmails = await this.getUsersEmailsResponse(accessToken)
    const emailObj = userEmails?.data?.find(
      (d: { primary: any; verified: any }) => d.primary && d.verified
    )

    const { username, profileUrl, photos, id } = profile
    done(null, {
      profileUrl: profileUrl,
      githubUsername: username,
      picture: photos[0].value,
      profileId: id,
      accessTokenGithub: accessToken,
      email: emailObj?.email,
    })
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
