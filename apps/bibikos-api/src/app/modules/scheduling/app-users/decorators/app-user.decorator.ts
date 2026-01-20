import { tryCatch } from '@js-monorepo/utils/common'
import { PaymentsService } from '@js-monorepo/payments-server'
import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { BibikosSession, SessionSubscription } from '@js-monorepo/types/session'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { BibikosCacheService } from '../../cache'
import { FEATURE_FLAGS_KEY, SUBSCRIPTION_STATUS_KEY } from '../../cache/constants'
import { AppUserService } from '../app-user.service'

// Store a reference to the NestJS application for service resolution
let appRef: any = null

/**
 * Call this during application bootstrap to register the application reference
 * This allows the decorator to resolve services
 *
 * @example
 * ```ts
 * const app = await NestFactory.create(AppModule)
 * AppUserDecorator.registerApp(app)
 * await app.listen(3000)
 * ```
 */
export function registerApp(app: any): void {
  appRef = app
}

/**
 * Normalizes subscription result to SessionSubscription format
 */
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

export const AppUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<BibikosSession | null> => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user?.user

    if (!user) return null

    const { email, ...restUser } = user

    // Get ModuleRef from the registered app reference
    if (!appRef) {
      throw new Error('AppUser decorator requires app registration. Call registerApp(app) during bootstrap.')
    }

    let moduleRef: ModuleRef
    try {
      moduleRef = appRef.get(ModuleRef, { strict: false })
    } catch (error) {
      throw new Error(`Unable to get ModuleRef: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    if (!moduleRef) {
      throw new Error('ModuleRef not found. Ensure the application is properly initialized.')
    }

    // Resolve services
    const paymentsService = moduleRef.get(PaymentsService, { strict: false })
    const featureFlagsService = moduleRef.get(FeatureFlagsService, { strict: false })
    const appUserService = moduleRef.get(AppUserService, { strict: false })
    const cacheService = moduleRef.get(BibikosCacheService, { strict: false })

    if (!paymentsService || !featureFlagsService || !appUserService || !cacheService) {
      throw new Error(
        'Required services not found. Ensure PaymentsService, FeatureFlagsService, AppUserService, and BibikosCacheService are available in the module.'
      )
    }

    // Fetch all data in parallel
    const [{ result }, featureFlags, appUser] = await Promise.all([
      // Cache subscription status per user for 5 minutes (300 seconds)
      cacheService.getOrSet(
        SUBSCRIPTION_STATUS_KEY,
        user.id,
        () => paymentsService.findUserSubscriptionStatus(user.id),
        300
      ),
      // Cache feature flags per user for 1 hour (3600 seconds)
      cacheService.getOrSet(
        FEATURE_FLAGS_KEY,
        `user:${user.id}`,
        () => featureFlagsService.getEnabledFlagsForUser(user.id),
        3600
      ),
      tryCatch(() => appUserService.getAppUserByAuthId(user.id)),
    ])

    const subscription = normalizeSubscription(result)

    return {
      user: { ...restUser },
      ...(subscription && { subscription }),
      featureFlags,
      ...(appUser.result && { appUser: appUser.result }),
    }
  }
)
