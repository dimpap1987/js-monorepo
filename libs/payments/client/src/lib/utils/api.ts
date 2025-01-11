import { ClientResponseType } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { Subscription } from '../types'

export async function apiCheckoutPlan(priceId: number) {
  return apiClient.post('/payments/checkout', {
    priceId: priceId,
  })
}

export async function apiGetPlans() {
  return apiClient.get('/payments/plans')
}

export async function apiGetSubscription(
  id: number
): Promise<ClientResponseType<Subscription>> {
  return apiClient.get(`/payments/subscriptions/${id}`)
}

export async function apiCancelSubscription(priceId: number) {
  return apiClient.post('/payments/cancel', {
    priceId: priceId,
  })
}
