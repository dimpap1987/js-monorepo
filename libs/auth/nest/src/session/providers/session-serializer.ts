import { SessionUserType } from '@js-monorepo/types'
import { Inject, Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { AuthService } from '../../common/services/interfaces/auth.service'
import { ServiceAuth } from '../../common/types'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(@Inject(ServiceAuth) private authService: AuthService) {
    super()
  }

  serializeUser(user: { user: SessionUserType }, done: CallableFunction) {
    done(null, user?.user?.id)
  }

  async deserializeUser(userId: string, done: CallableFunction) {
    const user = await this.authService.findAuthUserById(Number(userId))
    if (user) {
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
      done(null, null)
    }
  }
}
