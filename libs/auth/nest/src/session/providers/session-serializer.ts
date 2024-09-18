import { SessionUserType } from '@js-monorepo/types'
import { Injectable, Logger } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { AuthSessionUserCache } from './auth-session-cache.service'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  logger = new Logger(SessionSerializer.name)

  constructor(private readonly authSessionUserCache: AuthSessionUserCache) {
    super()
  }

  serializeUser(user: { user: SessionUserType }, done: CallableFunction) {
    done(null, user?.user?.id)
  }

  async deserializeUser(userId: string, done: CallableFunction) {
    const user = await this.authSessionUserCache.findOrSaveCacheUserById(
      Number(userId)
    )

    if (user) {
      done(null, { user })
    } else {
      done(null, null)
    }
  }
}
