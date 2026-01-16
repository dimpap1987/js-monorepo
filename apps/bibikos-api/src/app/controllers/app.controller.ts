import { tryCatch } from '@js-monorepo/utils/common'
import { PaymentsService } from '@js-monorepo/payments-server'
import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { Controller, Get, Logger, Req } from '@nestjs/common'
import { Request } from 'express'

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly featureFlagsService: FeatureFlagsService
  ) {}

  @Get('session')
  async getSession(@Req() req: Request) {
    const user = req.user?.user
    if (!user) return null
    const { email, ...restUser } = user

    const [{ result, error }, featureFlags] = await Promise.all([
      tryCatch(() => this.paymentsService.findUserSubscriptionStatus(user.id)),
      this.featureFlagsService.getEnabledFlagsForUser(user.id),
    ])

    if (!error && result?.isSubscribed) {
      return {
        user: { ...restUser },
        subscription: { ...result },
        featureFlags,
      }
    }
    return {
      user: { ...restUser },
      featureFlags,
    }
  }
}
