import { SessionUserType, UserStatus } from '../auth'

/**
 * AppUser data as returned in the session
 * Represents the bibikos-specific user profile
 */
export interface SessionAppUser {
  id: number
  authUserId: number
  locale: string
  timezone: string
  countryCode?: string | null
  createdAt: Date
  hasOrganizerProfile: boolean
  hasParticipantProfile: boolean
}

/**
 * Subscription data as returned in the session
 */
export interface SessionSubscription {
  isSubscribed: boolean
  isTrial: boolean
  plan: string | null
  subscriptionId: number | null
  priceId: number | null
  trialEnd: Date | string | null
  hasPaidSubscription: boolean
  paidSubscriptionPlan: string | null
  paidSubscriptionId: number | null
  paidSubscriptionPriceId: number | null
  trialSubscriptionPlan: string | null
  trialSubscriptionId: number | null
}

/**
 * Session user data (subset of SessionUserType without sensitive fields like email)
 * This matches what the /session endpoint returns for the user
 */
export interface SessionUser {
  id: number
  username: string
  email: string
  createdAt: Date | string
  status: UserStatus
  profile: {
    id: number
    image: string | null
    provider: string
  }
  roles: string[]
}

/**
 * Feature flags as returned in the session
 * Maps feature flag keys to their enabled status (boolean)
 */
export type SessionFeatureFlags = Record<string, boolean>

/**
 * Full Bibikos session response type
 * This represents the complete session object returned by the /session endpoint
 * Use this type in both frontend (useSession) and backend (controller response)
 */
export interface BibikosSession {
  user: SessionUser
  appUser?: SessionAppUser
  featureFlags: SessionFeatureFlags
  subscription?: SessionSubscription
}

/**
 * Session context type for the frontend
 * Extends the session with helper properties and methods
 */
export interface BibikosSessionContext {
  session: BibikosSession | null
  isLoggedIn: boolean
  isAdmin: boolean
  refreshSession: () => void
}

// Re-export for convenience
export { UserStatus } from '../auth'
