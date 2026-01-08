export interface Subscription {
  id: number
  stripeSubscriptionId: string | null
  status: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  trialStart: Date | null
  trialEnd: Date | null
  cancelAt: Date | null
  canceledAt: Date | null
  cancelReason: string | null
  createdAt: Date
  price: {
    id: number
    unitAmount: number
    currency: string

    interval: string
    product: {
      id: number
      name: string
    }
  }
  paymentCustomer: {
    stripeCustomerId: string
    authUser: {
      id: number
      username: string
      email: string
      userProfiles: {
        profileImage: string | null
      }[]
    }
  }
}
