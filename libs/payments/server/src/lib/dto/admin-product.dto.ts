import { ProductMetadata } from '@js-monorepo/types/pricing'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string

  @IsOptional()
  @IsObject()
  metadata?: ProductMetadata

  @IsOptional()
  @IsInt()
  @Min(0)
  hierarchy?: number

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsBoolean()
  syncToStripe?: boolean
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsObject()
  metadata?: ProductMetadata

  @IsOptional()
  @IsInt()
  @Min(0)
  hierarchy?: number

  @IsOptional()
  @IsBoolean()
  active?: boolean
}

export class ToggleActiveDto {
  @IsNotEmpty()
  @IsBoolean()
  active: boolean
}

// ============= Price DTOs =============

export class CreatePriceDto {
  @IsNotEmpty()
  @IsInt()
  productId: number

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  unitAmount: number

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string

  @IsNotEmpty()
  @IsIn(['month', 'year'])
  interval: 'month' | 'year'

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsBoolean()
  syncToStripe?: boolean
}

export class UpdatePriceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  unitAmount?: number

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string

  @IsOptional()
  @IsIn(['month', 'year'])
  interval?: 'month' | 'year'

  @IsOptional()
  @IsBoolean()
  active?: boolean
}

// ============= Query/Filter DTOs =============

export class ProductFiltersDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean

  @IsOptional()
  @IsString()
  search?: string
}

export class PaginationQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10
}

// ============= Response Types =============

export interface AdminPriceResponse {
  id: number
  stripeId: string
  unitAmount: number
  currency: string
  interval: string
  active: boolean
  productId: number
  createdAt: Date
  updatedAt: Date
}

export interface AdminProductResponse {
  id: number
  stripeId: string
  name: string
  description: string
  metadata: ProductMetadata | null
  hierarchy: number
  active: boolean
  prices: AdminPriceResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface AdminProductStatsResponse {
  totalProducts: number
  activeProducts: number
  syncedProducts: number
  localOnlyProducts: number
}
