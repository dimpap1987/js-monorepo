import { tryCatch } from '@js-monorepo/utils/common'
import { PaymentsService } from '@js-monorepo/payments-server'
import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { BibikosSession, SessionSubscription } from '@js-monorepo/types/session'
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
  async getSession(@Req() req: Request): Promise<BibikosSession | null> {
    const user = req.user?.user
    if (!user) return null
    const { email, ...restUser } = user

    const [{ result }, featureFlags, appUser] = await Promise.all([
      tryCatch(() => this.paymentsService.findUserSubscriptionStatus(user.id)),
      this.featureFlagsService.getEnabledFlagsForUser(user.id),
      tryCatch(() => this.appUserService.getAppUser(user.id)),
    ])

    const subscription = this.normalizeSubscription(result)

    return {
      user: { ...restUser },
      ...(subscription && { subscription }),
      featureFlags,
      ...(appUser.result && { appUser: appUser.result }),
    }
  }

  private normalizeSubscription(result: unknown): SessionSubscription | undefined {
    const subscriptionResult = result as Partial<SessionSubscription> | null
    if (!subscriptionResult?.isSubscribed) return undefined

    return {
      isSubscribed: subscriptionResult.isSubscribed ?? false,
      isTrial: subscriptionResult.isTrial ?? false,
      plan: subscriptionResult.plan ?? null,
      subscriptionId: subscriptionResult.subscriptionId ?? null,
      priceId: subscriptionResult.priceId ?? null,
      trialEnd: subscriptionResult.trialEnd ?? null,
      hasPaidSubscription: subscriptionResult.hasPaidSubscription ?? false,
      paidSubscriptionPlan: subscriptionResult.paidSubscriptionPlan ?? null,
      paidSubscriptionId: subscriptionResult.paidSubscriptionId ?? null,
      paidSubscriptionPriceId: subscriptionResult.paidSubscriptionPriceId ?? null,
      trialSubscriptionPlan: subscriptionResult.trialSubscriptionPlan ?? null,
      trialSubscriptionId: subscriptionResult.trialSubscriptionId ?? null,
    }
  }
}
