'use client'

import { useEffect } from 'react'
import { useDeviceStore } from '../stores/deviceStore'

type Props = {
  isMobile: boolean
}

export function DeviceStoreInitializer({ isMobile }: Props) {
  const setIsMobile = useDeviceStore((state) => state.setIsMobile)

  useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])

  return null
}
