import { DpButton } from '@js-monorepo/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { MapPin, Plus } from 'lucide-react'

export function ClassesNoLocationsWarning() {
  return (
    <Card className="border-yellow-500/50 bg-yellow-500/5">
      <CardContent className="py-6">
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Create a location first</h3>
            <p className="text-foreground-muted text-sm mb-4">
              You need at least one location before you can create classes.
            </p>
            <DpNextNavLink href="/locations">
              <DpButton variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Location
              </DpButton>
            </DpNextNavLink>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
