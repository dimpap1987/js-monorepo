import { Button } from '@js-monorepo/components/ui/button'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'

interface ClassesHeaderProps {
  onAddClick: () => void
  hasLocations: boolean
}

export function ClassesHeader({ onAddClick, hasLocations }: ClassesHeaderProps) {
  const t = useTranslations('scheduling.classes')

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1>{t('title')}</h1>
        <p className="text-foreground-muted mt-1">{t('subtitle')}</p>
      </div>
      <Button onClick={onAddClick} className="gap-2" disabled={!hasLocations}>
        <Plus className="w-4 h-4" />
        {t('add')}
      </Button>
    </div>
  )
}
