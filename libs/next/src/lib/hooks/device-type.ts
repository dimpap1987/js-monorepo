import { getDeviceType } from '@js-monorepo/utils/common'
import { useEffect, useState } from 'react'

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState('')

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType())
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return [
    deviceType === 'mobile',
    deviceType === 'tablet',
    deviceType === 'desktop',
  ]
}

export default useDeviceType
