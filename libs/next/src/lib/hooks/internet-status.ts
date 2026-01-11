'use client'

import { useEffect, useState } from 'react'

function useInternetStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateStatus()

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return isOnline
}

export default useInternetStatus
