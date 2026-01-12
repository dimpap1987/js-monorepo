import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Octokit } from 'octokit'
import { Strategy } from 'passport-github'
import * as oauth2 from 'passport-oauth2'
import { AuthOpts, SessionConfiguration } from '../types'
import { extractDisplayNameFromEmail, OAuthHandler, OAuthProfileData } from './base-oauth.strategy'

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject(AuthOpts) private readonly options: SessionConfiguration,
    private readonly oauthHandler: OAuthHandler
  ) {
    super({
      clientID: options.github?.clientId,
      clientSecret: options.github?.clientSecret,
      callbackURL: options.github?.callBackUrl,
      scope: ['read:project', 'user:email', 'read:user'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: oauth2.VerifyCallback): Promise<void> {
    const profileData = await this.extractProfileData(accessToken, refreshToken, profile)
    return this.oauthHandler.handleOAuthCallback(profileData, 'GITHUB', this.options, done)
  }

  private async extractProfileData(accessToken: string, refreshToken: string, profile: any): Promise<OAuthProfileData> {
    const email = await this.getPrimaryEmail(accessToken)
    const { firstName, lastName } = this.extractNames(profile)

    return {
      email,
      displayName: this.extractDisplayName(profile, email),
      profileImage: profile.photos?.[0]?.value,
      firstName,
      lastName,
      accessToken,
      refreshToken,
      scopes: ['read:project', 'user:email', 'read:user'],
    }
  }

  private extractNames(profile: any): { firstName?: string; lastName?: string } {
    // GitHub displayName is often "First Last" format
    if (profile.displayName) {
      const parts = profile.displayName.trim().split(/\s+/)
      if (parts.length >= 2) {
        return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
      }
      return { firstName: parts[0] }
    }
    return {}
  }

  private extractDisplayName(profile: any, email: string): string {
    if (profile.displayName) {
      return profile.displayName
    }
    if (profile.username) {
      return profile.username
    }
    return extractDisplayNameFromEmail(email)
  }

  private async getPrimaryEmail(accessToken: string): Promise<string> {
    const octokit = new Octokit({ auth: accessToken })
    const response = await octokit.request('GET /user/emails', {
      headers: { 'X-GitHub-Api-Version': '2022-11-28' },
    })

    const primaryEmail = response.data?.find(
      (email: { primary: boolean; verified: boolean }) => email.primary && email.verified
    )

    if (!primaryEmail?.email) {
      throw new Error('No verified primary email found for GitHub account')
    }

    return primaryEmail.email
  }
}
