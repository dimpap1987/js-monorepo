'use client'

import { cn } from '@js-monorepo/ui/util'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface BackButtonProps {
  href?: string
  label?: string
  showLabel?: boolean
  className?: string
}

export function BackButton({ href, label, showLabel = true, className }: BackButtonProps) {
  const router = useRouter()
  const tCommon = useTranslations('common')
  const displayLabel = label || tCommon('back')

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-foreground-muted',
        'hover:text-foreground transition-colors duration-200',
        'group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
        className
      )}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      {showLabel && <span>{displayLabel}</span>}
    </button>
  )
}
