import { SessionUserType } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { AuthSessionUserCacheService } from './auth-session-cache.service'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    private readonly authSessionUserCacheService: AuthSessionUserCacheService
  ) {
    super()
  }

  serializeUser(user: { user: SessionUserType }, done: CallableFunction) {
    done(null, user?.user?.id)
  }

  async deserializeUser(userId: string, done: CallableFunction) {
    const user = await this.authSessionUserCacheService.findOrSaveCacheUserById(
      Number(userId)
    )

    if (user) {
      done(null, { user })
    } else {
      done(null, null)
    }
  }
}
