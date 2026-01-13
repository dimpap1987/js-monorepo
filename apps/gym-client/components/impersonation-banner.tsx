'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@js-monorepo/utils/http'
import { FaUserSecret } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

interface ImpersonationStatus {
  isImpersonating: boolean
  originalAdminId?: number
}

function useImpersonationStatus(enabled: boolean) {
  return useQuery<ImpersonationStatus>({
    queryKey: ['impersonation-status'],
    queryFn: async () => {
      const { data } = await apiClient.get<ImpersonationStatus>('/users/impersonation-status')
      return data
    },
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

function useStopImpersonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ success: boolean }>('/users/stop-impersonation')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation-status'] })
    },
  })
}

export function ImpersonationBanner() {
  const { session } = useSession()
  const isLoggedIn = !!session?.user
  const { data: status } = useImpersonationStatus(isLoggedIn)
  const stopMutation = useStopImpersonation()

  if (!status?.isImpersonating) {
    return null
  }

  const handleStopImpersonation = async () => {
    try {
      await stopMutation.mutateAsync()
      window.location.replace('/admin/users')
    } catch {
      // Error handling is silent - the mutation will show error state
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg border border-border">
      <FaUserSecret className="text-base" />
      <span className="text-sm font-medium">Spy</span>
      <button
        onClick={handleStopImpersonation}
        disabled={stopMutation.isPending}
        className="ml-1 p-1 rounded-full hover:bg-accent transition-colors disabled:opacity-50"
        title="Stop Impersonating"
      >
        <IoClose className="text-lg" />
      </button>
    </div>
  )
}
