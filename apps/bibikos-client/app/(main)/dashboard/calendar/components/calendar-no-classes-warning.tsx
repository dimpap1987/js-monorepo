import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { AlertTriangle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CalendarNoClassesWarning() {
  const router = useRouter()

  return (
    <Card className="border-yellow-500/50 bg-yellow-500/5">
      <CardContent className="py-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Create a class first</h3>
            <p className="text-foreground-muted text-sm mb-4">
              You need at least one class before you can create schedules.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/classes')} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Class
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
