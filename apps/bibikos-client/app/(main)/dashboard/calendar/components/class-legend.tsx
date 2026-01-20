'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@js-monorepo/components/ui/tooltip'
import { Eye, EyeOff, Layers } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Class } from '../../../../../lib/scheduling'
import { getClassColor } from '../hooks/use-calendar-events'

interface ClassFilterDropdownProps {
  legendItems: Array<{
    id: number
    title: string
    colorName: string
    colorBg: string
    isVisible: boolean
  }>
  visibleCount: number
  isAllVisible: boolean
  onToggleClass: (classId: number) => void
  onShowAll: () => void
  onHideAll: () => void
}

function ClassFilterDropdown({
  legendItems,
  visibleCount,
  isAllVisible,
  onToggleClass,
  onShowAll,
  onHideAll,
}: ClassFilterDropdownProps) {
  const t = useTranslations('scheduling.calendar')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Classes</span>
          {!isAllVisible && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {visibleCount}/{legendItems.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Filter Classes</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onShowAll} disabled={isAllVisible}>
              <Eye className="w-3 h-3 mr-1" />
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onHideAll}
              disabled={visibleCount === 0}
            >
              <EyeOff className="w-3 h-3 mr-1" />
              None
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {legendItems.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={item.isVisible}
            onCheckedChange={() => onToggleClass(item.id)}
            className="gap-2"
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.colorBg }} />
            <span className="truncate">{item.title}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ClassLegendProps {
  classes: Class[]
  visibleClassIds: Set<number> | null // null means show all
  onToggleClass: (classId: number) => void
  onShowAll: () => void
  onHideAll: () => void
}

export function ClassLegend({ classes, visibleClassIds, onToggleClass, onShowAll, onHideAll }: ClassLegendProps) {
  const t = useTranslations('scheduling.calendar')

  // Build legend items with their colors
  const legendItems = useMemo(() => {
    return classes.map((cls) => {
      const color = getClassColor(cls.id)
      return {
        id: cls.id,
        title: cls.title,
        colorName: color.name,
        colorBg: color.bg,
        isVisible: visibleClassIds === null || visibleClassIds.has(cls.id),
      }
    })
  }, [classes, visibleClassIds])

  const visibleCount = visibleClassIds === null ? classes.length : visibleClassIds.size
  const isAllVisible = visibleClassIds === null || visibleClassIds.size === classes.length

  if (classes.length === 0) return null

  // For mobile/small screens, show dropdown
  // For desktop, show inline legend
  return (
    <>
      {/* Desktop: Inline legend */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <TooltipProvider delayDuration={200}>
          {legendItems.slice(0, 6).map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToggleClass(item.id)}
                  className={`
                    inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
                    transition-all duration-150 hover:scale-105
                    ${item.isVisible ? 'opacity-100' : 'opacity-40 hover:opacity-60'}
                  `}
                  style={{
                    backgroundColor: item.isVisible
                      ? `color-mix(in oklch, ${item.colorBg} 15%, transparent)`
                      : undefined,
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.colorBg }} />
                  <span className="max-w-[100px] truncate text-foreground-secondary">{item.title}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {item.isVisible ? 'Click to hide' : 'Click to show'} {item.title}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {legendItems.length > 6 && (
          <ClassFilterDropdown
            legendItems={legendItems}
            visibleCount={visibleCount}
            isAllVisible={isAllVisible}
            onToggleClass={onToggleClass}
            onShowAll={onShowAll}
            onHideAll={onHideAll}
          />
        )}
      </div>

      {/* Mobile: Dropdown only */}
      <div className="md:hidden">
        <ClassFilterDropdown
          legendItems={legendItems}
          visibleCount={visibleCount}
          isAllVisible={isAllVisible}
          onToggleClass={onToggleClass}
          onShowAll={onShowAll}
          onHideAll={onHideAll}
        />
      </div>
    </>
  )
}
