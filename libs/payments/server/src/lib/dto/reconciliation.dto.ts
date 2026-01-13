import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator'

// ============= Sync Status Enum =============

export enum SyncStatus {
  SYNCED = 'synced', // Exists in both local and Stripe, data matches
  LOCAL_ONLY = 'local_only', // Only exists locally (never synced or local_ prefix)
  STRIPE_ONLY = 'stripe_only', // Exists in Stripe but not in local DB
  DRIFT = 'drift', // Exists in both but data differs
  ORPHANED = 'orphaned', // Local has stripeId but doesn't exist in Stripe
}

// ============= Product Sync Status =============

export interface ProductLocalData {
  name: string
  description: string
  active: boolean
  hierarchy: number
  metadata: Record<string, unknown>
}

export interface ProductStripeData {
  name: string
  description: string
  active: boolean
  metadata: Record<string, string>
}

export interface ProductSyncStatus {
  localId: number | null
  stripeId: string | null
  status: SyncStatus
  localData?: ProductLocalData
  stripeData?: ProductStripeData
  differences?: string[]
  lastVerified: Date
}

// ============= Price Sync Status =============

export interface PriceLocalData {
  unitAmount: number
  currency: string
  interval: string
  active: boolean
}

export interface PriceStripeData {
  unitAmount: number
  currency: string
  interval: string
  active: boolean
}

export interface PriceSyncStatus {
  localId: number | null
  stripeId: string | null
  productLocalId: number | null
  productStripeId: string | null
  status: SyncStatus
  localData?: PriceLocalData
  stripeData?: PriceStripeData
  differences?: string[]
  lastVerified: Date
}

// ============= Reconciliation Report =============

export interface ReconciliationSummary {
  total: number
  synced: number
  localOnly: number
  stripeOnly: number
  drift: number
  orphaned: number
}

export interface ReconciliationReport {
  timestamp: Date
  products: ReconciliationSummary & {
    items: ProductSyncStatus[]
  }
  prices: ReconciliationSummary & {
    items: PriceSyncStatus[]
  }
  errors: ReconciliationError[]
}

export interface ReconciliationError {
  type: 'product' | 'price'
  localId?: number
  stripeId?: string
  message: string
}

// ============= Action DTOs =============

export class ImportFromStripeDto {
  @IsString()
  stripeId: string
}

export class BulkReconcileDto {
  @IsIn(['push_all_local', 'pull_all_stripe', 'sync_missing'])
  action: 'push_all_local' | 'pull_all_stripe' | 'sync_missing'

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean
}

export interface ReconciliationResult {
  success: boolean
  action: string
  affectedProducts: number
  affectedPrices: number
  errors: ReconciliationError[]
  details: string[]
}

// ============= Response Types =============

export interface ProductSyncStatusResponse extends ProductSyncStatus {
  productName?: string
}

export interface PriceSyncStatusResponse extends PriceSyncStatus {
  productName?: string
}
