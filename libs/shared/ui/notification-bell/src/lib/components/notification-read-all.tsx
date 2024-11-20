'use client'

import { DpButton } from '@js-monorepo/button'

export function NotificationReadAllButton({
  onReadAll,
}: {
  onReadAll?: () => Promise<any>
}) {
  return (
    <DpButton
      size="small"
      variant="outline"
      onClick={async () => {
        return onReadAll?.()
      }}
    >
      Read all
    </DpButton>
  )
}
