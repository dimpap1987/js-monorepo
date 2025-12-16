import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'

interface UpdateUserAccountPayload {
  username: string
  profileImage: string
}

/**
 * Hook to update user account
 */
export function useUpdateUserAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateUserAccountPayload) => {
      const response = await apiClient.patch('/users', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      // Invalidate any user-related queries if needed
      // queryClient.invalidateQueries({ queryKey: ['user', 'account'] })
    },
  })
}
