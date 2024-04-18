import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'

import { Inject, Injectable } from '@nestjs/common'
import { GoogleAuth } from '../types/auth.configuration'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject('GOOGLE-AUTH') private readonly config: GoogleAuth) {
    super({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callBackUrl,
      scope: ['email', 'profile'],
      prompt: 'select_account',
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
      picture: photos[0].value,
      profileId: id,
    }
    done(null, user)
  }
}
