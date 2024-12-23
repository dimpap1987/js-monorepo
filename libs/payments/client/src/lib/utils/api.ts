import { apiClient } from '@js-monorepo/utils/http'

export async function apiCheckoutPlan(priceId: string) {
  return apiClient.post('/payments/checkout', {
    priceId: priceId,
  })
}

export async function apiGetPlans() {
  return apiClient.get('/payments/plans')
}

export const freePlanMonth = [
  {
    id: 0, // Unique identifier for this plan
    title: 'Free',
    priceId: '',
    description: 'Starter Monthly Plan',
    actionLabel: 'Get Started',
    price: 0,
    features: {
      feat1: 'Starter feature',
    },
    isFree: true,
    currency: 'EUR',
    interval: 'month',
  },
]

export const freePlanYear = [
  {
    id: 0, // Unique identifier for this plan
    title: 'Free',
    priceId: '',
    description: 'Starter Yearly Plan',
    actionLabel: 'Get Started',
    price: 0,
    features: {
      feat1: 'Starter feature',
    },
    isFree: true,
    currency: 'EUR',
    interval: 'year',
  },
]

export function getFreePlansByInterval(interval: string) {
  return interval === 'month'
    ? freePlanMonth
    : interval === 'year'
      ? freePlanYear
      : []
}
