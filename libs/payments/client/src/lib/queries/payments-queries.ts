import { useQuery } from '@tanstack/react-query'
import { PricingPlanResponse } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'
import { Subscription } from '../types'

/**
 * Fetch pricing plans
 */
const fetchPlans = async (): Promise<PricingPlanResponse[]> => {
  const response = await apiClient.get<PricingPlanResponse[]>('/payments/plans')
  return handleQueryResponse(response)
}

/**
 * Hook to fetch pricing plans
 */
export function usePlans() {
  return useQuery({
    queryKey: queryKeys.payments.plans(),
    queryFn: fetchPlans,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch subscription
 */
const fetchSubscription = async (id: number): Promise<Subscription> => {
  const response = await apiClient.get<Subscription>(`/payments/subscription/${id}`)
  return handleQueryResponse(response)
}

/**
 * Hook to fetch subscription
 */
export function useSubscription(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.subscription(id || 0),
    queryFn: () => fetchSubscription(id as number),
    enabled: !!id, // Only fetch if id exists
  })
}
