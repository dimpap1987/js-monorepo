import { PricingPlanType } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'

export async function apiCheckoutPlan(priceId: string) {
  return apiClient.post('/payments/checkout', {
    priceId: priceId,
  })
}

export async function apiGetPlans() {
  return apiClient.get('/payments/plans')
}

export const freePlanMonth = {
  title: 'Free',
  description: 'Starter Montlhy Plan',
  price: 0,
  features: {
    feat1: 'Starter feature',
  },
  interval: 'month',
  priceId: 'price_123',
  active: true,
} as PricingPlanType

export const freePlanYear = {
  title: 'Free',
  description: 'Starter Yearly Plan',
  price: 0,
  features: {
    feat1: 'Starter feature',
  },
  interval: 'year',
  priceId: 'price_4324',
  active: true,
} as PricingPlanType
