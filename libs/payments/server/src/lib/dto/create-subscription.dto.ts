import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  paymentCustomerId: number

  @IsNotEmpty()
  @IsString()
  stripeSubscriptionId: string

  @IsNotEmpty()
  @IsNumber()
  priceId: number

  @IsNotEmpty()
  @IsString()
  status: string

  @IsNotEmpty()
  @IsDate()
  currentPeriodStart: Date

  @IsNotEmpty()
  @IsDate()
  currentPeriodEnd: Date

  @IsOptional()
  @IsDate()
  trialStart?: Date

  @IsOptional()
  @IsDate()
  trialEnd?: Date

  @IsOptional()
  @IsDate()
  cancelAt?: Date

  @IsOptional()
  @IsDate()
  canceledAt?: Date
}
