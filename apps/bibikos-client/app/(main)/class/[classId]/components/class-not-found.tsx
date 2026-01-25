import { Button } from '@js-monorepo/components/ui/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { ContainerTemplate } from '@js-monorepo/templates'
import { AlertCircle, Search } from 'lucide-react'

export function ClassNotFound() {
  return (
    <ContainerTemplate className="flex flex-col justify-center items-center gap-6">
      <AlertCircle className="w-16 h-16 mx-auto text-foreground-muted opacity-50 mt-6" />
      <h1>Class Not Found</h1>
      <p className="text-foreground-muted">The class you&apos;re looking for doesn&apos;t exist or has been removed.</p>
      <DpNextNavLink href="/discover" className="mt-6">
        <Button className="gap-2">
          <Search className="w-4 h-4" />
          Discover Classes
        </Button>
      </DpNextNavLink>
    </ContainerTemplate>
  )
}
