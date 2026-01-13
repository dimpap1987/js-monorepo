'use client'

import { DpButton } from '@js-monorepo/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { AlertTriangle, CheckCircle, Cloud, CloudOff, Download, Link2Off, RefreshCw, Upload } from 'lucide-react'
import { useState } from 'react'
import { BulkReconcileRequest, ReconciliationReport, ReconciliationResult, SyncStatus } from '../../types'
import {
  apiBulkReconcile,
  apiGetReconciliationReport,
  apiImportProductFromStripe,
  apiPullProductFromStripe,
  apiPushProductToStripe,
  apiUnlinkProduct,
} from '../../utils/admin-api'
import { VerifiedSyncStatusBadge } from './product-status-badge'

interface SummaryCardProps {
  label: string
  productCount: number
  priceCount: number
  icon: React.ElementType
  iconClassName?: string
}

function SummaryCard({ label, productCount, priceCount, icon: Icon, iconClassName }: SummaryCardProps) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${iconClassName}`} />
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{productCount + priceCount}</div>
      <div className="text-xs text-muted-foreground">
        {productCount} products, {priceCount} prices
      </div>
    </div>
  )
}

interface ReconciliationPanelProps {
  onReconciliationComplete?: () => void
}

export function ReconciliationPanel({ onReconciliationComplete }: ReconciliationPanelProps) {
  const [report, setReport] = useState<ReconciliationReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<ReconciliationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiGetReconciliationReport()
      if (response.ok && response.data) {
        setReport(response.data)
      } else {
        setError('Failed to fetch reconciliation report')
      }
    } catch (e) {
      setError('Error fetching report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAction = async (action: BulkReconcileRequest['action']) => {
    setIsBulkLoading(true)
    setBulkResult(null)
    try {
      const response = await apiBulkReconcile({ action, dryRun: false })
      if (response.ok && response.data) {
        setBulkResult(response.data)
        // Refresh the report after bulk action
        await fetchReport()
        onReconciliationComplete?.()
      } else {
        setError('Bulk reconciliation failed')
      }
    } catch (e) {
      setError('Error during bulk reconciliation')
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleProductAction = async (
    action: 'push' | 'pull' | 'unlink' | 'import',
    productId?: number,
    stripeId?: string
  ) => {
    try {
      let response
      switch (action) {
        case 'push':
          if (productId) response = await apiPushProductToStripe(productId)
          break
        case 'pull':
          if (productId) response = await apiPullProductFromStripe(productId)
          break
        case 'unlink':
          if (productId) response = await apiUnlinkProduct(productId)
          break
        case 'import':
          if (stripeId) response = await apiImportProductFromStripe(stripeId)
          break
      }
      if (response?.ok) {
        await fetchReport()
        onReconciliationComplete?.()
      }
    } catch (e) {
      setError(`Failed to ${action} product`)
    }
  }

  const hasIssues =
    report &&
    (report.products.orphaned > 0 ||
      report.products.drift > 0 ||
      report.products.localOnly > 0 ||
      report.products.stripeOnly > 0 ||
      report.prices.orphaned > 0 ||
      report.prices.drift > 0 ||
      report.prices.localOnly > 0 ||
      report.prices.stripeOnly > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Stripe Reconciliation
            </CardTitle>
            <CardDescription>Verify and sync products/prices between your database and Stripe</CardDescription>
          </div>
          <DpButton onClick={fetchReport} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Checking...' : 'Check Sync Status'}
          </DpButton>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard
                label="Synced"
                productCount={report.products.synced}
                priceCount={report.prices.synced}
                icon={CheckCircle}
                iconClassName="text-green-500"
              />
              <SummaryCard
                label="Local Only"
                productCount={report.products.localOnly}
                priceCount={report.prices.localOnly}
                icon={CloudOff}
                iconClassName="text-amber-500"
              />
              <SummaryCard
                label="Stripe Only"
                productCount={report.products.stripeOnly}
                priceCount={report.prices.stripeOnly}
                icon={Cloud}
                iconClassName="text-blue-500"
              />
              <SummaryCard
                label="Orphaned"
                productCount={report.products.orphaned}
                priceCount={report.prices.orphaned}
                icon={Link2Off}
                iconClassName="text-red-500"
              />
            </div>

            {/* Issues List */}
            {hasIssues && (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Items Requiring Attention</h3>

                {/* Products with issues */}
                {report.products.items
                  .filter((p) => p.status !== SyncStatus.SYNCED)
                  .map((product) => (
                    <div
                      key={product.localId || product.stripeId}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <VerifiedSyncStatusBadge status={product.status} />
                        <div>
                          <p className="font-medium">
                            {product.localData?.name || product.stripeData?.name || 'Unknown Product'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.localId ? `ID: ${product.localId}` : `Stripe: ${product.stripeId}`}
                          </p>
                          {product.differences && product.differences.length > 0 && (
                            <p className="text-xs text-orange-500">Differences: {product.differences.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(product.status === SyncStatus.LOCAL_ONLY || product.status === SyncStatus.ORPHANED) &&
                          product.localId && (
                            <DpButton
                              size="small"
                              variant="outline"
                              onClick={() => handleProductAction('push', product.localId!)}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Push
                            </DpButton>
                          )}
                        {product.status === SyncStatus.DRIFT && product.localId && (
                          <DpButton
                            size="small"
                            variant="outline"
                            onClick={() => handleProductAction('pull', product.localId!)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Pull
                          </DpButton>
                        )}
                        {product.status === SyncStatus.STRIPE_ONLY && product.stripeId && (
                          <DpButton
                            size="small"
                            variant="outline"
                            onClick={() => handleProductAction('import', undefined, product.stripeId!)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Import
                          </DpButton>
                        )}
                        {product.status === SyncStatus.ORPHANED && product.localId && (
                          <DpButton
                            size="small"
                            variant="ghost"
                            onClick={() => handleProductAction('unlink', product.localId!)}
                          >
                            <Link2Off className="h-4 w-4 mr-1" />
                            Unlink
                          </DpButton>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <DpButton
                variant="outline"
                onClick={() => handleBulkAction('push_all_local')}
                disabled={isBulkLoading || report.products.localOnly + report.products.orphaned === 0}
              >
                <Upload className="h-4 w-4 mr-2" />
                Push All Local to Stripe
              </DpButton>
              <DpButton
                variant="outline"
                onClick={() => handleBulkAction('pull_all_stripe')}
                disabled={isBulkLoading || report.products.stripeOnly === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Import All from Stripe
              </DpButton>
              <DpButton
                variant="outline"
                onClick={() => handleBulkAction('sync_missing')}
                disabled={isBulkLoading || report.products.localOnly + report.products.stripeOnly === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All Missing
              </DpButton>
            </div>

            {/* Bulk Result */}
            {bulkResult && (
              <div
                className={`p-4 rounded-lg ${bulkResult.success ? 'bg-green-500/10 text-green-700' : 'bg-destructive/10 text-destructive'}`}
              >
                <p className="font-medium">
                  {bulkResult.success
                    ? 'Reconciliation completed successfully'
                    : 'Reconciliation completed with errors'}
                </p>
                <p className="text-sm">
                  Affected: {bulkResult.affectedProducts} products, {bulkResult.affectedPrices} prices
                </p>
                {bulkResult.errors.length > 0 && (
                  <ul className="text-sm mt-2 list-disc list-inside">
                    {bulkResult.errors.map((err, i) => (
                      <li key={i}>
                        {err.type} {err.localId || err.stripeId}: {err.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {!report && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Check Sync Status" to verify synchronization between your database and Stripe</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
