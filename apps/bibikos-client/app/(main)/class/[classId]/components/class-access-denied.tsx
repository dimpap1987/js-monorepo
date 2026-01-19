import { Button } from '@js-monorepo/components/ui/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { Lock, Mail, Search } from 'lucide-react'

interface ClassAccessDeniedProps {
  isLoggedIn: boolean
}

export function ClassAccessDenied({ isLoggedIn }: ClassAccessDeniedProps) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Private Class</h1>
      <p className="text-foreground-muted mb-6 max-w-md mx-auto">
        {isLoggedIn
          ? 'This is a private class. You need an invitation from the instructor to access it.'
          : 'This is a private class. Please log in to check if you have an invitation.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!isLoggedIn && (
          <DpNextNavLink href="/auth/login">
            <Button>Log In</Button>
          </DpNextNavLink>
        )}
        <DpNextNavLink href="/my-invitations">
          <Button variant={isLoggedIn ? 'default' : 'outline'} className="gap-2">
            <Mail className="w-4 h-4" />
            Check Invitations
          </Button>
        </DpNextNavLink>
        <DpNextNavLink href="/discover">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Discover Classes
          </Button>
        </DpNextNavLink>
      </div>
    </div>
  )
}
