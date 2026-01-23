import { SessionUser } from '@js-monorepo/types/session'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface AppUserContextType {
  user: SessionUser
  appUserId: number
  participantId?: number
  organizerId?: number
}

export const AppUserContext = createParamDecorator((_: unknown, ctx: ExecutionContext): AppUserContextType => {
  const request = ctx.switchToHttp().getRequest()
  return request.userContext ?? null
})
