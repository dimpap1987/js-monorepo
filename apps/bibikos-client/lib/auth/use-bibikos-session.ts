'use client'

import { useSession as useBaseSession } from '@js-monorepo/auth/next/client'
import { BibikosSession, BibikosSessionContext } from '@js-monorepo/types/session'

/**
 * Typed session hook for Bibikos app
 * Provides type-safe access to BibikosSession with appUser, featureFlags, etc.
 */
export function useBibikosSession(): BibikosSessionContext {
  const baseSession = useBaseSession()

  // Type assertion - the session from bibikos-api will always match BibikosSession
  return {
    ...baseSession,
    session: baseSession.session as BibikosSession | null,
  }
}

/**
 * Re-export session types for convenience
 */
export type {
  BibikosSession,
  BibikosSessionContext,
  SessionAppUser,
  SessionSubscription,
  SessionUser,
} from '@js-monorepo/types/session'
