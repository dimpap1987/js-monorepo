'use client'

import { useEffect, useRef, useState } from 'react'
import { DpLoader } from './loader'

interface InitialLoaderProps {
  isLoading: boolean
  minDuration?: number // default 1000ms
  message?: string
  description?: string
}

export function InitialLoader({
  isLoading,
  minDuration = 1000,
  message = 'Starting things up... 🤞',
  description = 'Just a moment...',
  children,
}: InitialLoaderProps & { children?: React.ReactNode }) {
  const startTime = useRef(Date.now())
  const [show, setShow] = useState(true)
  const hasCompletedInitialLoad = useRef(false)

  useEffect(() => {
    if (!isLoading && !hasCompletedInitialLoad.current) {
      hasCompletedInitialLoad.current = true

      const elapsed = Date.now() - startTime.current
      const remaining = Math.max(minDuration - elapsed, 0)

      const timeout = setTimeout(() => setShow(false), remaining)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, minDuration])

  if (show) return <DpLoader message={message} description={description} show={show} />

  return <>{children}</>
}
