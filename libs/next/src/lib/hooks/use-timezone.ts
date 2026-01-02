import { useMemo } from 'react'

export const useTimezone = () => {
  return useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }, [])
}
