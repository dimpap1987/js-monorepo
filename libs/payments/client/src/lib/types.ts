import Stripe from 'stripe'

export interface Subscription {
  id: number
  paymentCustomerId: number
  stripeSubscriptionId?: string
  priceId: number
  status: Stripe.Subscription.Status
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  trialStart?: Date
  trialEnd?: Date
  cancelAt?: Date
  canceledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SessionSubscription {
  plans?: SubscriptionPlan[]
}

export interface SubscriptionPlan {
  subscriptionId: number
  price: PriceDetails
}

export interface PriceDetails {
  id: number
  product: ProductDetails
}

export interface ProductDetails {
  id: number
}

export type PlanCardProps = {
  handleCheckout?: () => Promise<any>
  handleCancelSubscription?: () => Promise<any>
  price: number
  name: string
  description: string
  features: Record<string, string>
  interval: string
  actionLabel?: string
  popular?: boolean
  subscribed: boolean
  anySubscribed?: boolean
  isLoggedIn?: boolean
  subscription?: Subscription
}

export type PlanCardActionsType = {
  isSubscribed?: boolean
  isLoading: boolean
  isLoggedIn?: boolean
  isFree?: boolean
  onCheckout?: () => Promise<any>
  onCancel?: () => Promise<any>
  actionLabel?: string
  subscription?: Subscription
}

export type PlanCardContainerType = {
  anySubscribed?: boolean
  subscribed?: boolean
  isFree?: boolean
}

export type PlanCardContentType = {
  title: string
  description: string
  price: number
  interval: string
  features: Record<string, string>
}
