import { SessionUserType } from '@js-monorepo/types'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const SessionUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionUserType | undefined => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user?.user

    if (!user) return undefined

    const { roles = [], ...rest } = user

    return {
      ...rest,
      isAdmin: roles.includes('ADMIN'),
    } as SessionUserType
  }
)
