import { Inject, Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { AuthService } from '../services/interfaces/auth.service'
import { UnregisteredService } from '../services/interfaces/unregistered-user.service'
import { SessionConfiguration } from '../types/auth.configuration'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name)
  constructor(
    @Inject('AUTH_OPTIONS') private readonly options: SessionConfiguration,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('UNREGISTERED_USER_SERVICE')
    private unRegisteredUserService: UnregisteredService
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
    const email = emails[0].value
    const user = await this.authService.findAuthUserByEmail(email)

    if (user) {
      // If the user exists in the database
      done(null, {
        user: {
          id: user.id,
          username: user.username,
          roles: user.roles,
          createdAt: user.createdAt,
          profileImage: user.providers[0]?.profileImage,
        },
      })
    } else {
      // If the user doesn't exist in the database
      try {
        const unRegisteredUser =
          await this.unRegisteredUserService.createUnRegisteredUser({
            email: email,
            provider: 'google',
            profileImage: photos[0].value,
          })

        done(null, {
          unRegisteredUser: unRegisteredUser,
        })
      } catch (e: any) {
        done(e, null)
      }
    }
  }
}
