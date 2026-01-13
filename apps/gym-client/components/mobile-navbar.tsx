'use client'

import { BottomNavbar, BottomNavbarAlert, BottomNavbarOptions } from '@js-monorepo/bottom-navbar'
import { useDeviceType } from '@js-monorepo/next/hooks'
import { NotificationBellButton } from '@js-monorepo/notifications-ui'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { AiFillHome } from 'react-icons/ai'

export const MobileNavbar = () => {
  const { deviceType } = useDeviceType()
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, or not mobile, render null (matches server)
  if (!mounted || deviceType !== 'mobile') return null

  return (
    <BottomNavbar>
      <BottomNavbarOptions Icon={AiFillHome} href="/" label={t('navigation.home')} />
      <BottomNavbarAlert href="/notifications" label={t('navigation.alert')}>
        <NotificationBellButton className="shrink-0 text-xl" />
      </BottomNavbarAlert>
    </BottomNavbar>
  )
}
