import { AuthSessionUserCacheService, LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { EditUserSchema } from '@js-monorepo/schemas'
import { EditUserDto, SessionUserType } from '@js-monorepo/types'
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { UserService } from './user.service'

@Controller('users')
@UseGuards(LoggedInGuard)
export class UserController {
  private logger = new Logger(UserController.name)

  constructor(
    private userService: UserService,
    private readonly authSessionCacheService: AuthSessionUserCacheService
  ) {}

  @Patch()
  async editUser(@Body(new ZodPipe(EditUserSchema)) payload: EditUserDto, @SessionUser() sessionUser: SessionUserType) {
    this.logger.log(`User profile update with user id: ${sessionUser.id}`)
    return this.userService.handleUserUpdate(payload, sessionUser.id, sessionUser.profile.id)
  }

  @Get('impersonation-status')
  async getImpersonationStatus(@Req() req: Request) {
    const session = req.session as unknown as Record<string, unknown>
    const impersonatingFrom = session.impersonatingFrom as number | undefined

    return {
      isImpersonating: !!impersonatingFrom,
      originalAdminId: impersonatingFrom,
    }
  }

  @Post('stop-impersonation')
  @HttpCode(HttpStatus.OK)
  async stopImpersonation(@Req() req: Request, @SessionUser() currentUser: SessionUserType) {
    const session = req.session as unknown as Record<string, unknown>
    const originalAdminId = session.impersonatingFrom as number | undefined

    if (!originalAdminId) {
      return { success: false, message: 'Not currently impersonating' }
    }

    const adminUser = await this.authSessionCacheService.findOrSaveAuthUserById(originalAdminId)

    if (!adminUser) {
      return { success: false, message: 'Original admin not found' }
    }

    // Verify the original user is still an admin
    const isStillAdmin = adminUser.roles?.includes('ADMIN')
    if (!isStillAdmin) {
      delete session.impersonatingFrom
      this.logger.warn(
        `[IMPERSONATION_STOP_FAILED] Admin userId=${originalAdminId} lost admin privileges while impersonating userId=${currentUser.id}`
      )
      return { success: false, message: 'Original user no longer has admin privileges' }
    }

    this.logger.warn(
      `[IMPERSONATION_STOP] Admin userId=${originalAdminId} stopped impersonating userId=${currentUser.id} (${currentUser.username})`
    )

    delete session.impersonatingFrom

    return new Promise((resolve, reject) => {
      req.logIn({ user: adminUser }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve({ success: true, user: adminUser })
        }
      })
    })
  }
}
