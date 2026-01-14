import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator'

export class ExtendTrialDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  additionalDays: number
}

export class DeactivateTrialDto {
  @IsOptional()
  @IsString()
  reason?: string
}

export class AssignTrialDto {
  @IsNotEmpty()
  @IsInt()
  userId: number

  @IsNotEmpty()
  @IsInt()
  priceId: number

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(365)
  trialDurationDays: number
}
