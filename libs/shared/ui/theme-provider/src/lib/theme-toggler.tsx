'use client'

import { cn } from '@js-monorepo/ui/util'
import { useTheme } from 'next-themes'
import { KeyboardEvent, useEffect, useState } from 'react'
import './theme-toggler.css'

export function ModeToggle({ className }: { readonly className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [isChecked, setIsChecked] = useState<boolean>(resolvedTheme === 'dark')

  useEffect(() => {
    setIsChecked(resolvedTheme === 'light')
  }, [resolvedTheme, isChecked])

  const handleKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (event.key === 'Enter') {
      setIsChecked((prev) => !prev)
      setTheme(isChecked ? 'dark' : 'light')
    }
  }

  return (
    <label
      htmlFor="theme-slider"
      className={cn(`switch inline-block`, className)}
      aria-label="theme slider"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <input
        id="theme-slider"
        type="checkbox"
        checked={isChecked}
        tabIndex={-1}
        onChange={() => setTheme(isChecked ? 'dark' : 'light')}
      />
      <span className="slider"></span>
    </label>
  )
}
