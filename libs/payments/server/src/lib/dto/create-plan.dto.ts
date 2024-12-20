import {
  IsJSON,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class CreatePlanDto {
  @IsOptional()
  @IsString()
  stripePriceId: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  interval?: string

  @IsNumber()
  @IsPositive({ message: 'Price in cents must be a positive number' })
  priceCents: number

  @IsOptional()
  @IsJSON({ message: 'Features must be a valid JSON object' })
  features?: string
}
