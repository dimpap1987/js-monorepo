import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'

interface CreateAnnouncementPayload {
  announcement: string
  userIds: number[]
  isGlobal: boolean
}

/**
 * Hook to create an announcement
 */
export function useCreateAnnouncement() {
  return useMutation({
    mutationFn: async (payload: CreateAnnouncementPayload) => {
      const response = await apiClient.post('/announcements', payload)
      return handleQueryResponse(response)
    },
  })
}
