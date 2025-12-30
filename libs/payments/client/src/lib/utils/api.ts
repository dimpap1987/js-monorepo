import { ClientResponseType } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { generateIdempotencyKey, IDEMPOTENCY_HEADER } from '@js-monorepo/utils/idempotency'
import { Subscription } from '../types'

export { generateIdempotencyKey } from '@js-monorepo/utils/idempotency'

export async function apiCheckoutPlan(priceId: number, idempotencyKey?: string) {
  const key = idempotencyKey ?? generateIdempotencyKey()
  return apiClient.post('/payments/checkout', { priceId }, { headers: { [IDEMPOTENCY_HEADER]: key } })
}

export async function apiGetPlans() {
  return apiClient.get('/payments/plans')
}

export async function apiGetSubscription(id: number): Promise<ClientResponseType<Subscription>> {
  return apiClient.get(`/payments/subscriptions/${id}`)
}

export async function apiCancelSubscription(priceId: number, idempotencyKey?: string) {
  const key = idempotencyKey ?? generateIdempotencyKey()
  return apiClient.post('/payments/cancel', { priceId }, { headers: { [IDEMPOTENCY_HEADER]: key } })
}
