'use client'

import { useEffect } from 'react'
import { useDeviceType } from './device-type'

export default function useTapEffect(callback?: () => void) {
  const { deviceType } = useDeviceType()

  useEffect(() => {
    if (deviceType === 'desktop') return

    const handleTap = (e: TouchEvent) => {
      callback?.()

      const touch = e.touches[0]
      if (!touch) return

      // Create ripple element
      const ripple = document.createElement('div')
      ripple.style.position = 'fixed'
      ripple.style.left = `${touch.clientX - 10}px`
      ripple.style.top = `${touch.clientY - 10}px`
      ripple.style.width = '20px'
      ripple.style.height = '20px'
      ripple.style.borderRadius = '9999px'
      ripple.style.background = 'rgba(255, 255, 255, 0.4)'
      ripple.style.pointerEvents = 'none'
      ripple.style.transform = 'scale(0)'
      ripple.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out'
      ripple.style.zIndex = '9999'
      ripple.style.opacity = '1'

      document.body.appendChild(ripple)

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(3)'
        ripple.style.opacity = '0'
      })

      setTimeout(() => {
        ripple.remove()
      }, 400)
    }

    window.addEventListener('touchstart', handleTap)

    return () => {
      window.removeEventListener('touchstart', handleTap)
    }
  }, [callback, deviceType])
}
