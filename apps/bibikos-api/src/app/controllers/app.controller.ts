import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { PaymentsService } from '@js-monorepo/payments-server'
import { BibikosSession, SessionAppUser, SessionSubscription } from '@js-monorepo/types/session'
import { tryCatch } from '@js-monorepo/utils/common'
import { Controller, Get, Logger } from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../decorators/app-user.decorator'
import { AppUserResponseDto, AppUserService } from '../modules/scheduling/app-users'
import { BibikosCacheService, FEATURE_FLAGS_KEY, SUBSCRIPTION_STATUS_KEY } from '../modules/scheduling/cache'

function normalizeSubscription(result: unknown): SessionSubscription | undefined {
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
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(
    private readonly cacheService: BibikosCacheService,
    private readonly paymentsService: PaymentsService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly appUserService: AppUserService
  ) {}

  @Get('session')
  async getSession(@AppUserContext() appUserContext: AppUserContextType | null): Promise<BibikosSession | null> {
    // Fetch all data in parallel

    if (!appUserContext) return null

    const [{ result: subscriptionResult }, featureFlags, { result: appUser }] = await Promise.all([
      // Cache subscription status per user for 5 minutes (300 seconds)
      this.cacheService.getOrSet(
        SUBSCRIPTION_STATUS_KEY,
        appUserContext.user.id,
        () => this.paymentsService.findUserSubscriptionStatus(appUserContext.user.id),
        300
      ),
      this.cacheService.getOrSet(
        FEATURE_FLAGS_KEY,
        `user:${appUserContext.user.id}`,
        () => this.featureFlagsService.getEnabledFlagsForUser(appUserContext.user.id),
        3600
      ),
      tryCatch(() => this.appUserService.findByAuthId(appUserContext.user.id)),
    ])

    const subscription = normalizeSubscription(subscriptionResult)
    const sessionAppUser: SessionAppUser = this.mapAppUserToSessionAppUser(appUser)

    return {
      user: { ...appUserContext.user },
      ...(subscription && { subscription }),
      featureFlags,
      appUser: sessionAppUser,
    }
  }

  mapAppUserToSessionAppUser(appUser: AppUserResponseDto): SessionAppUser {
    return {
      id: appUser.id,
      authUserId: appUser.authUserId,
      locale: appUser.locale,
      timezone: appUser.timezone,
      countryCode: appUser.countryCode ?? null,
      createdAt: appUser.createdAt,
      hasOrganizerProfile: Boolean(appUser.organizerProfileId),
      hasParticipantProfile: Boolean(appUser.participantProfileId),
    }
  }
}
