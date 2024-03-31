'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import './theme-toggler.css'

export function ModeToggle({ className }: { readonly className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [isChecked, setIsChecked] = useState<boolean>()

  useEffect(() => {
    setIsChecked(resolvedTheme === 'light')
  }, [resolvedTheme])

  return (
    isChecked !== null &&
    isChecked !== undefined && (
      <label htmlFor="theme-slider" className={`switch ${className}`}>
        <input
          id="theme-slider"
          type="checkbox"
          checked={isChecked}
          onChange={() => setTheme(isChecked ? 'dark' : 'light')}
        />
        <span className="slider"></span>
      </label>
    )
  )
}
