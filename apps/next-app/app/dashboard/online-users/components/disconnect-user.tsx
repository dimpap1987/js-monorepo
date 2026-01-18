'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@js-monorepo/components/ui/tooltip'
import { useNotifications } from '@js-monorepo/notification'
import { apiClient } from '@js-monorepo/utils/http'
import { VscDebugDisconnect } from 'react-icons/vsc'
import { OnlineUsersType } from '../online-users-table'

export function DisconnectUserComponent({ user }: { user: OnlineUsersType }) {
  const { addNotification } = useNotifications()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            className="rounded-full"
            disabled={user.id === 1 && user?.roles?.some((r) => r === 'ADMIN')}
            variant="accent"
            onClick={async () => {
              const response = await apiClient.delete(`/admin/users-session/${user.id}`)

              if (response.ok) {
                addNotification({
                  message: 'User successfully logged out',
                  type: 'success',
                  duration: 4000,
                })
              } else {
                addNotification({
                  message: 'This was an error disconnecting user',
                  type: 'error',
                  duration: 4000,
                })
                console.error(response.errors)
              }
            }}
          >
            <VscDebugDisconnect />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Disconnect User</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
