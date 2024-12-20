import { IsNotEmpty, IsString } from 'class-validator'

export class CreateStripeWebhookEventDto {
  @IsNotEmpty()
  @IsString()
  eventId: string

  @IsNotEmpty()
  @IsString()
  eventType: string
}
