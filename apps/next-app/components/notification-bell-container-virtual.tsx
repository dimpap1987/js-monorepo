'use client'

import { NotificationBellContainerScroll } from '@js-monorepo/notifications-ui'

interface NotificationBellContainerVirtualProps {
  userId: number | undefined
}

export function NotificationBellContainerVirtual({ userId }: NotificationBellContainerVirtualProps) {
  return <NotificationBellContainerScroll userId={userId} className="mt-[0.58rem]" resetOnClose={true} />
}
