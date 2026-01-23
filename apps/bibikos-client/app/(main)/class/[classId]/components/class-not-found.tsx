import { Button } from '@js-monorepo/components/ui/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { ContainerTemplate } from '@js-monorepo/templates'
import { AlertCircle, Search } from 'lucide-react'

export function ClassNotFound() {
  return (
    <ContainerTemplate>
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-foreground-muted opacity-50" />
      <h1 className="text-2xl font-bold mb-2">Class Not Found</h1>
      <p className="text-foreground-muted mb-6 max-w-md mx-auto">
        The class you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <DpNextNavLink href="/discover">
        <Button className="gap-2">
          <Search className="w-4 h-4" />
          Discover Classes
        </Button>
      </DpNextNavLink>
    </ContainerTemplate>
  )
}
