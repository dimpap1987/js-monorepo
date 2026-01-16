import { tryCatch } from '@js-monorepo/utils/common'
import { PaymentsService } from '@js-monorepo/payments-server'
import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { Controller, Get, Logger, Req } from '@nestjs/common'
import { Request } from 'express'
import { AppUserService } from '../modules/scheduling/app-users/app-user.service'

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly appUserService: AppUserService
  ) {}

  @Get('session')
  async getSession(@Req() req: Request) {
    const user = req.user?.user
    if (!user) return null
    const { email, ...restUser } = user

    const [{ result, error }, featureFlags, appUser] = await Promise.all([
      tryCatch(() => this.paymentsService.findUserSubscriptionStatus(user.id)),
      this.featureFlagsService.getEnabledFlagsForUser(user.id),
      tryCatch(() => this.appUserService.getOrCreateAppUser(user.id)),
    ])

    return {
      user: { ...restUser },
      ...(result?.isSubscribed && { subscription: { ...result } }),
      featureFlags,
      ...(appUser.result && { appUser: appUser.result }),
    }
  }
}
