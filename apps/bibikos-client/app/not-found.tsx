import { DpNextNavLink } from '@js-monorepo/nav-link'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Code */}
        <div className="text-7xl font-bold text-primary">404</div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>

        {/* Description */}
        <p className="text-sm text-foreground-muted">
          Sorry, the page you’re looking for doesn’t exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <DpNextNavLink
            href="/"
            className="inline-flex items-center justify-center rounded-md
                       bg-primary text-primary-foreground
                       px-5 py-2.5 text-sm font-medium
                       transition-colors hover:bg-primary/90
                       focus:outline-none focus:ring-2 focus:ring-primary
                       focus:ring-offset-2 focus:ring-offset-background"
          >
            Go back home
          </DpNextNavLink>
        </div>

        {/* Subtle visual hint */}
        <div className="pt-8 text-xs text-foreground-neutral">
          The page may have been removed, renamed, or is temporarily unavailable.
        </div>
      </div>
    </main>
  )
}
