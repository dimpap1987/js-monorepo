import { DpButton } from '@js-monorepo/button'
import { useTranslations } from 'next-intl'
import { Plus, CalendarDays } from 'lucide-react'
import { Class } from '../../../../lib/scheduling'
import { ClassLegend } from './class-legend'

interface CalendarHeaderProps {
  onAddClick: () => void
  hasClasses: boolean
  classes?: Class[]
  visibleClassIds: Set<number> | null
  onToggleClass: (classId: number) => void
  onShowAllClasses: () => void
  onHideAllClasses: () => void
}

export function CalendarHeader({
  onAddClick,
  hasClasses,
  classes = [],
  visibleClassIds,
  onToggleClass,
  onShowAllClasses,
  onHideAllClasses,
}: CalendarHeaderProps) {
  const t = useTranslations('scheduling.calendar')
  const tSchedules = useTranslations('scheduling.schedules')

  return (
    <div className="space-y-4">
      {/* Main header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarDays className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-foreground-muted hidden sm:block">Manage your class schedules and bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasClasses && classes.length > 0 && (
            <ClassLegend
              classes={classes}
              visibleClassIds={visibleClassIds}
              onToggleClass={onToggleClass}
              onShowAll={onShowAllClasses}
              onHideAll={onHideAllClasses}
            />
          )}
          <DpButton onClick={onAddClick} className="gap-2 shadow-sm" disabled={!hasClasses}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{tSchedules('add')}</span>
            <span className="sm:hidden">Add</span>
          </DpButton>
        </div>
      </div>
    </div>
  )
}
