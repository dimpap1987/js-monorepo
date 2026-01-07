import { getDeviceType } from '@js-monorepo/utils/common'
import { useEffect, useState } from 'react'

function useDeviceType() {
  const [deviceType, setDeviceType] = useState(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return getDeviceType()
    }
    return 'desktop' // Default
  })

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType())
    }

    // Only set if different from initial value
    const currentType = getDeviceType()
    if (currentType !== deviceType) {
      setDeviceType(currentType)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { deviceType } as { deviceType: 'mobile' | 'tablet' | 'desktop' }
}

export { useDeviceType }
