'use client'

import { NotificationDropdown } from '@js-monorepo/notifications-ui'

interface NotificationBellContainerVirtualProps {
  userId: number | undefined
}

export function NotificationBellContainerVirtual({ userId }: NotificationBellContainerVirtualProps) {
  return <NotificationDropdown userId={userId} className="mt-[0.7rem]" resetOnClose={true} />
}
