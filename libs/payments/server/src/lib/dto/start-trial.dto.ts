import { IsNotEmpty, IsNumber } from 'class-validator'

export class StartTrialDto {
  @IsNotEmpty()
  @IsNumber()
  priceId: number
}

export interface TrialEligibilityResponse {
  eligible: boolean
  reason?: string
  trialDurationDays: number
  productName: string
}

export interface StartTrialResponse {
  subscriptionId: number
  trialEnd: Date
  productName: string
  message: string
}
