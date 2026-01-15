import { FeatureFlagsMapDto } from '@js-monorepo/types/feature-flags'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const FEATURE_FLAGS_QUERY_KEY = ['admin', 'feature-flags']

export const fetchFeatureFlags = async (): Promise<FeatureFlagsMapDto> => {
  const response = await apiClient.get<FeatureFlagsMapDto>('/admin/feature-flags')
  return handleQueryResponse(response)
}

export function useFeatureFlagsAdmin() {
  return useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEY,
    queryFn: fetchFeatureFlags,
  })
}

export interface UpsertFeatureFlagPayload {
  key: string
  enabled?: boolean
  rollout?: number
  description?: string
}

export function useUpsertFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpsertFeatureFlagPayload) => {
      const response = await apiClient.post<FeatureFlagsMapDto>('/admin/feature-flags', payload)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURE_FLAGS_QUERY_KEY })
    },
  })
}
