import { CancelReasonType } from '../constants'

export interface SubscriptionUpdateData {
  id: string
  status: string
  current_period_start: number
  current_period_end: number
  trial_start: number | null
  trial_end: number | null
  cancel_at: number | null
  canceled_at: number | null
  cancelReason?: CancelReasonType | null
  items: {
    data: Array<{
      price: {
        id: string
      }
    }>
  }
}

export interface SubscriptionDeleteData {
  id: string
  status: string
  cancel_at: number | null
  cancelReason?: CancelReasonType
}
