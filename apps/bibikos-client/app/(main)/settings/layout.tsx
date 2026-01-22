import { PropsWithChildren } from 'react'
import { DesktopSettingsLayout } from './desktop-settings-layout'
import { SettingsMobileTabs } from './settings-mobile-tabs'
import { ContainerTemplate } from '@js-monorepo/templates'
import { isMobileDevice } from '@js-monorepo/next/server'

export default async function SettingsLayout({ children }: PropsWithChildren) {
  const isMobile = await isMobileDevice()

  if (isMobile) {
    return (
      <div className="overflow-y-auto">
        <SettingsMobileTabs />
        <ContainerTemplate>{children}</ContainerTemplate>
      </div>
    )
  }

  return <DesktopSettingsLayout>{children}</DesktopSettingsLayout>
}
