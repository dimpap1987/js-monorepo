'use client'

import { FeatureGate } from '@js-monorepo/feature-flags-client'

export function HomeBanner() {
  return (
    <FeatureGate flag="home.banner">
      <div className="mt-8 w-full max-w-3xl mx-auto rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground text-center shadow-sm">
        <span className="font-semibold mr-1">Feature Flag Demo:</span>
        This banner is controlled by the <code>home.banner</code> feature flag.
      </div>
    </FeatureGate>
  )
}
