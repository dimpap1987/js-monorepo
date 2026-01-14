import { ProductMetadata } from '@js-monorepo/types/pricing'
import Stripe from 'stripe'

// Configuration: which plan to highlight as "Most Popular"
export const POPULAR_PLAN_NAME = 'basic'

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
  isSubscribed: boolean
  isTrial: boolean
  plan: string | null
  subscriptionId: number | null
  priceId: number | null
  trialEnd: Date | null
  hasPaidSubscription: boolean
  paidSubscriptionPlan: string | null
  trialSubscriptionPlan: string | null
  trialSubscriptionId: number | null
}

export interface TrialEligibilityResponse {
  eligible: boolean
  reason?: string
  trialDurationDays: number
  productName?: string
}

export interface StartTrialResponse {
  subscriptionId: number
  trialEnd: Date
  productName: string
  message: string
}

// FAQ types for pricing page
export interface FAQItem {
  question: string
  answer: string
}

// Pricing card data for the refactored pricing page
export interface PricingCardData {
  id: number
  name: string
  description: string
  price: number
  interval: string
  metadata?: ProductMetadata
  isPopular?: boolean
  subscribed?: boolean
}

// Trust signal for pricing page
export interface TrustSignal {
  icon: React.ReactNode
  text: string
}

// Invoice types
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible' | 'draft'

export interface Invoice {
  id: string
  number: string | null
  amount: number
  currency: string
  status: InvoiceStatus
  createdAt: string
  pdfUrl: string | null
  hostedInvoiceUrl: string | null
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  hasMore: boolean
}

// ============= Admin Types =============

export type PriceStatus = 'active' | 'legacy' | 'deprecated' | 'archived'

export interface AdminPrice {
  id: number
  stripeId: string
  unitAmount: number
  currency: string
  interval: 'month' | 'year'
  active: boolean
  status: PriceStatus
  replacedByPriceId: number | null
  productId: number
  createdAt: string
  updatedAt: string
}

export interface AdminProduct {
  id: number
  stripeId: string
  name: string
  description: string
  metadata?: ProductMetadata
  hierarchy: number
  active: boolean
  prices: AdminPrice[]
  createdAt: string
  updatedAt: string
}

export interface AdminProductStats {
  totalProducts: number
  activeProducts: number
  syncedProducts: number
  localOnlyProducts: number
}

export interface CreateProductRequest {
  name: string
  description: string
  metadata?: ProductMetadata
  hierarchy?: number
  active?: boolean
  syncToStripe?: boolean
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  metadata?: ProductMetadata
  hierarchy?: number
  active?: boolean
}

export interface CreatePriceRequest {
  productId: number
  unitAmount: number
  currency: string
  interval: 'month' | 'year'
  active?: boolean
  syncToStripe?: boolean
}

export interface UpdatePriceRequest {
  unitAmount?: number
  currency?: string
  interval?: 'month' | 'year'
  active?: boolean
  syncToStripe?: boolean
}

export interface AdminProductFilters {
  active?: boolean
  search?: string
}

// ============= Reconciliation Types =============

export enum SyncStatus {
  SYNCED = 'synced',
  LOCAL_ONLY = 'local_only',
  STRIPE_ONLY = 'stripe_only',
  DRIFT = 'drift',
  ORPHANED = 'orphaned',
  UNVERIFIED = 'unverified',
}

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

export interface ReconciliationSummary {
  total: number
  synced: number
  localOnly: number
  stripeOnly: number
  drift: number
  orphaned: number
}

export interface ReconciliationError {
  type: 'product' | 'price'
  localId?: number
  stripeId?: string
  message: string
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

export interface ReconciliationResult {
  success: boolean
  action: string
  affectedProducts: number
  affectedPrices: number
  errors: ReconciliationError[]
  details: string[]
}

export type BulkReconcileAction = 'push_all_local' | 'pull_all_stripe' | 'sync_missing'

export interface BulkReconcileRequest {
  action: BulkReconcileAction
  dryRun?: boolean
}
