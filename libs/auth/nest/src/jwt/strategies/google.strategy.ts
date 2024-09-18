import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'

import { Inject, Injectable } from '@nestjs/common'
import { AuthConfiguration } from '../types/auth.configuration'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('AUTH_OPTIONS') private readonly options: AuthConfiguration
  ) {
    super({
      clientID: options.google?.clientId,
      clientSecret: options.google?.clientSecret,
      callbackURL: options.google?.callBackUrl,
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { name, emails, photos, id } = profile

    const user: any = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      profileImage: photos[0].value,
      profileId: id,
    }
    done(null, user)
  }
}
