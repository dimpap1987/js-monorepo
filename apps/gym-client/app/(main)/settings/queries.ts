import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'

interface UpdateUserAccountPayload {
  username: string
  profileImage: string
  firstName?: string | null
  lastName?: string | null
}

interface UserProfileData {
  firstName?: string | null
  lastName?: string | null
}

/**
 * Hook to fetch user profile (firstName/lastName)
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get<UserProfileData>('/users/profile')
      return handleQueryResponse(response)
    },
  })
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
      // Invalidate user profile query to refetch firstName/lastName
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}
