import { ClientResponseType } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { generateIdempotencyKey, IDEMPOTENCY_HEADER } from '@js-monorepo/utils/idempotency'
import { InvoiceListResponse, Subscription } from '../types'

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

export async function apiRenewSubscription(priceId: number, idempotencyKey?: string) {
  const key = idempotencyKey ?? generateIdempotencyKey()
  return apiClient.post('/payments/renew', { priceId }, { headers: { [IDEMPOTENCY_HEADER]: key } })
}

export async function apiGetInvoices(
  limit?: number,
  startingAfter?: string
): Promise<ClientResponseType<InvoiceListResponse>> {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  if (startingAfter) params.set('startingAfter', startingAfter)

  const queryString = params.toString()
  const url = queryString ? `/payments/invoices?${queryString}` : '/payments/invoices'

  return apiClient.get(url)
}
