import { ClientResponseType } from '@js-monorepo/types/responses'
import { PaginationType } from '@js-monorepo/types/pagination'
import { apiClient } from '@js-monorepo/utils/http'
import {
  AdminPrice,
  AdminProduct,
  AdminProductFilters,
  AdminProductStats,
  BulkReconcileRequest,
  CreatePriceRequest,
  CreateProductRequest,
  PriceSyncStatus,
  ProductSyncStatus,
  ReconciliationReport,
  ReconciliationResult,
  UpdatePriceRequest,
  UpdateProductRequest,
} from '../types'

// ============= Product API Functions =============

export async function apiGetAdminProducts(
  page = 1,
  pageSize = 10,
  filters?: AdminProductFilters
): Promise<ClientResponseType<PaginationType<AdminProduct>>> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))

  if (filters?.active !== undefined) {
    params.set('active', String(filters.active))
  }
  if (filters?.search) {
    params.set('search', filters.search)
  }

  return apiClient.get(`/payments/admin/products?${params.toString()}`)
}

export async function apiGetAdminProduct(id: number): Promise<ClientResponseType<AdminProduct>> {
  return apiClient.get(`/payments/admin/products/${id}`)
}

export async function apiGetAdminProductStats(): Promise<ClientResponseType<AdminProductStats>> {
  return apiClient.get('/payments/admin/products/stats')
}

export async function apiCreateProduct(data: CreateProductRequest): Promise<ClientResponseType<AdminProduct>> {
  return apiClient.post('/payments/admin/products', data)
}

export async function apiUpdateProduct(
  id: number,
  data: UpdateProductRequest
): Promise<ClientResponseType<AdminProduct>> {
  return apiClient.put(`/payments/admin/products/${id}`, data)
}

export async function apiDeleteProduct(id: number): Promise<ClientResponseType<void>> {
  return apiClient.delete(`/payments/admin/products/${id}`)
}

export async function apiToggleProductActive(id: number, active: boolean): Promise<ClientResponseType<AdminProduct>> {
  return apiClient.patch(`/payments/admin/products/${id}/toggle`, { active })
}

export async function apiSyncProductToStripe(id: number): Promise<ClientResponseType<AdminProduct>> {
  return apiClient.post(`/payments/admin/products/${id}/sync`, {})
}

// ============= Price API Functions =============

export async function apiGetAdminPrices(productId?: number): Promise<ClientResponseType<AdminPrice[]>> {
  const url = productId ? `/payments/admin/prices?productId=${productId}` : '/payments/admin/prices'
  return apiClient.get(url)
}

export async function apiGetAdminPrice(id: number): Promise<ClientResponseType<AdminPrice>> {
  return apiClient.get(`/payments/admin/prices/${id}`)
}

export async function apiCreatePrice(data: CreatePriceRequest): Promise<ClientResponseType<AdminPrice>> {
  return apiClient.post('/payments/admin/prices', data)
}

export async function apiUpdatePrice(id: number, data: UpdatePriceRequest): Promise<ClientResponseType<AdminPrice>> {
  return apiClient.put(`/payments/admin/prices/${id}`, data)
}

export async function apiDeletePrice(id: number): Promise<ClientResponseType<void>> {
  return apiClient.delete(`/payments/admin/prices/${id}`)
}

export async function apiTogglePriceActive(id: number, active: boolean): Promise<ClientResponseType<AdminPrice>> {
  return apiClient.patch(`/payments/admin/prices/${id}/toggle`, { active })
}

export async function apiSyncPriceToStripe(id: number): Promise<ClientResponseType<AdminPrice>> {
  return apiClient.post(`/payments/admin/prices/${id}/sync`, {})
}

// ============= Helper Functions =============

/**
 * Check if a product might be synced to Stripe based on prefix.
 * NOTE: This is a preliminary check. Use apiGetProductSyncStatus for accurate verification.
 * @deprecated Use reconciliation API for accurate sync status
 */
export function isProductSynced(product: AdminProduct): boolean {
  return !product.stripeId.startsWith('local_')
}

/**
 * Check if a price might be synced to Stripe based on prefix.
 * NOTE: This is a preliminary check. Use apiGetPriceSyncStatus for accurate verification.
 * @deprecated Use reconciliation API for accurate sync status
 */
export function isPriceSynced(price: AdminPrice): boolean {
  return !price.stripeId.startsWith('local_price_')
}

/**
 * Format price amount from cents to display string
 */
export function formatPriceAmount(unitAmount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100)
}

// ============= Reconciliation API Functions =============

export async function apiGetReconciliationReport(): Promise<ClientResponseType<ReconciliationReport>> {
  return apiClient.get('/payments/admin/reconciliation/report')
}

export async function apiGetProductSyncStatus(id: number): Promise<ClientResponseType<ProductSyncStatus>> {
  return apiClient.get(`/payments/admin/reconciliation/products/${id}/status`)
}

export async function apiGetPriceSyncStatus(id: number): Promise<ClientResponseType<PriceSyncStatus>> {
  return apiClient.get(`/payments/admin/reconciliation/prices/${id}/status`)
}

export async function apiPushProductToStripe(id: number): Promise<ClientResponseType<ProductSyncStatus>> {
  return apiClient.post(`/payments/admin/reconciliation/products/${id}/push`, {})
}

export async function apiPullProductFromStripe(id: number): Promise<ClientResponseType<ProductSyncStatus>> {
  return apiClient.post(`/payments/admin/reconciliation/products/${id}/pull`, {})
}

export async function apiUnlinkProduct(id: number): Promise<ClientResponseType<ProductSyncStatus>> {
  return apiClient.post(`/payments/admin/reconciliation/products/${id}/unlink`, {})
}

export async function apiImportProductFromStripe(stripeId: string): Promise<ClientResponseType<ProductSyncStatus>> {
  return apiClient.post('/payments/admin/reconciliation/products/import', { stripeId })
}

export async function apiPushPriceToStripe(id: number): Promise<ClientResponseType<PriceSyncStatus>> {
  return apiClient.post(`/payments/admin/reconciliation/prices/${id}/push`, {})
}

export async function apiPullPriceFromStripe(id: number): Promise<ClientResponseType<PriceSyncStatus>> {
  return apiClient.post(`/payments/admin/reconciliation/prices/${id}/pull`, {})
}

export async function apiUnlinkPrice(id: number): Promise<ClientResponseType<PriceSyncStatus>> {
  return apiClient.post(`/payments/admin/reconciliation/prices/${id}/unlink`, {})
}

export async function apiImportPriceFromStripe(stripeId: string): Promise<ClientResponseType<PriceSyncStatus>> {
  return apiClient.post('/payments/admin/reconciliation/prices/import', { stripeId })
}

export async function apiBulkReconcile(
  request: BulkReconcileRequest
): Promise<ClientResponseType<ReconciliationResult>> {
  return apiClient.post('/payments/admin/reconciliation/bulk', request)
}
