import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { useTranslations } from 'next-intl'
import { MapPinOff, Plus } from 'lucide-react'

interface LocationsEmptyStateProps {
  onAddClick: () => void
}

export function LocationsEmptyState({ onAddClick }: LocationsEmptyStateProps) {
  const t = useTranslations('scheduling.locations')

  return (
    <Card className="border-border/50">
      <CardContent className="py-16 text-center">
        <MapPinOff className="w-12 h-12 mx-auto mb-4 text-foreground-muted opacity-50" />
        <h3 className="text-lg font-semibold mb-2">{t('empty')}</h3>
        <p className="text-foreground-muted mb-6">{t('emptyDescription')}</p>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('add')}
        </Button>
      </CardContent>
    </Card>
  )
}
