import { apiClient } from '@js-monorepo/utils/http'

export async function apiCheckoutPlan(priceId: number) {
  return apiClient.post('/payments/checkout', {
    priceId: priceId,
  })
}

export async function apiGetPlans() {
  return apiClient.get('/payments/plans')
}
