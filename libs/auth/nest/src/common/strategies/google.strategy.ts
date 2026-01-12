import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { AuthOpts, SessionConfiguration } from '../types'
import { extractDisplayNameFromEmail, OAuthHandler, OAuthProfileData } from './base-oauth.strategy'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(AuthOpts) private readonly options: SessionConfiguration,
    private readonly oauthHandler: OAuthHandler
  ) {
    super({
      clientID: options.google?.clientId,
      clientSecret: options.google?.clientSecret,
      callbackURL: options.google?.callBackUrl,
      scope: ['email', 'profile'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<void> {
    const profileData = this.extractProfileData(profile, accessToken, refreshToken)
    return this.oauthHandler.handleOAuthCallback(profileData, 'GOOGLE', this.options, done)
  }

  private extractProfileData(profile: any, accessToken: string, refreshToken: string): OAuthProfileData {
    const { name, emails, photos } = profile

    return {
      email: emails?.[0]?.value,
      displayName: this.extractDisplayName(name, profile),
      profileImage: photos?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      accessToken,
      refreshToken,
      scopes: ['email', 'profile'],
    }
  }

  private extractDisplayName(name: any, profile: any): string {
    if (name?.givenName || name?.familyName) {
      return [name.givenName, name.familyName].filter(Boolean).join(' ')
    }
    if (profile.displayName) {
      return profile.displayName
    }
    return extractDisplayNameFromEmail(profile.emails?.[0]?.value)
  }
}
