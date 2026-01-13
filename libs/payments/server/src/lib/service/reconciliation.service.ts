import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { AdminProductResponse } from '../dto/admin-product.dto'
import {
  BulkReconcileDto,
  PriceLocalData,
  PriceSyncStatus,
  ProductLocalData,
  ProductSyncStatus,
  ReconciliationError,
  ReconciliationReport,
  ReconciliationResult,
  SyncStatus,
} from '../dto/reconciliation.dto'
import { PaymentsRepository } from '../repository/payments.repository'
import { StripeService } from './stripe.service'

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name)
  private readonly STRIPE_BATCH_SIZE = 100
  private readonly RATE_LIMIT_DELAY_MS = 100

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly stripeService: StripeService
  ) {}

  // ============= Product Verification =============

  async verifyProductSyncStatus(localId: number): Promise<ProductSyncStatus> {
    const localProduct = await this.paymentsRepository.findProductByIdAdmin(localId)

    if (!localProduct) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRODUCT_NOT_FOUND', `Product with id ${localId} not found`)
    }

    // Check if it's a local-only product (never synced)
    if (localProduct.stripeId.startsWith('local_')) {
      return {
        localId: localProduct.id,
        stripeId: null,
        status: SyncStatus.LOCAL_ONLY,
        localData: this.extractLocalProductData(localProduct),
        lastVerified: new Date(),
      }
    }

    // Verify with Stripe
    try {
      const stripe = this.stripeService.getStripeClient()
      const stripeProduct = await stripe.products.retrieve(localProduct.stripeId)

      const differences = this.compareProductData(localProduct, stripeProduct)

      return {
        localId: localProduct.id,
        stripeId: stripeProduct.id,
        status: differences.length > 0 ? SyncStatus.DRIFT : SyncStatus.SYNCED,
        localData: this.extractLocalProductData(localProduct),
        stripeData: this.extractStripeProductData(stripeProduct),
        differences,
        lastVerified: new Date(),
      }
    } catch (error) {
      // Stripe returns 404 for deleted/non-existent products
      if (this.isStripeNotFoundError(error)) {
        return {
          localId: localProduct.id,
          stripeId: localProduct.stripeId,
          status: SyncStatus.ORPHANED,
          localData: this.extractLocalProductData(localProduct),
          lastVerified: new Date(),
        }
      }
      throw error
    }
  }

  // ============= Price Verification =============

  async verifyPriceSyncStatus(localId: number): Promise<PriceSyncStatus> {
    const localPrice = await this.paymentsRepository.findPriceByIdAdmin(localId)

    if (!localPrice) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRICE_NOT_FOUND', `Price with id ${localId} not found`)
    }

    const product = localPrice.product as { id: number; name: string; stripeId?: string }

    // Check if it's a local-only price (never synced)
    if (localPrice.stripeId.startsWith('local_price_')) {
      return {
        localId: localPrice.id,
        stripeId: null,
        productLocalId: product.id,
        productStripeId: product.stripeId?.startsWith('local_') ? null : product.stripeId ?? null,
        status: SyncStatus.LOCAL_ONLY,
        localData: this.extractLocalPriceData(localPrice),
        lastVerified: new Date(),
      }
    }

    // Verify with Stripe
    try {
      const stripe = this.stripeService.getStripeClient()
      const stripePrice = await stripe.prices.retrieve(localPrice.stripeId)

      const differences = this.comparePriceData(localPrice, stripePrice)

      return {
        localId: localPrice.id,
        stripeId: stripePrice.id,
        productLocalId: product.id,
        productStripeId:
          typeof stripePrice.product === 'string' ? stripePrice.product : stripePrice.product?.id ?? null,
        status: differences.length > 0 ? SyncStatus.DRIFT : SyncStatus.SYNCED,
        localData: this.extractLocalPriceData(localPrice),
        stripeData: this.extractStripePriceData(stripePrice),
        differences,
        lastVerified: new Date(),
      }
    } catch (error) {
      if (this.isStripeNotFoundError(error)) {
        return {
          localId: localPrice.id,
          stripeId: localPrice.stripeId,
          productLocalId: product.id,
          productStripeId: product.stripeId?.startsWith('local_') ? null : product.stripeId ?? null,
          status: SyncStatus.ORPHANED,
          localData: this.extractLocalPriceData(localPrice),
          lastVerified: new Date(),
        }
      }
      throw error
    }
  }

  // ============= Full Reconciliation Report =============

  async generateReconciliationReport(): Promise<ReconciliationReport> {
    const errors: ReconciliationError[] = []
    const timestamp = new Date()

    // Fetch all local products and prices
    const localProducts = await this.paymentsRepository.findAllProductsForReconciliation()
    const localPrices = await this.paymentsRepository.findAllPricesForReconciliation()

    // Fetch all Stripe products and prices
    const stripeProducts = await this.fetchAllStripeProducts()
    const stripePrices = await this.fetchAllStripePrices()

    // Build product status list
    const productStatuses: ProductSyncStatus[] = []
    const processedStripeProductIds = new Set<string>()

    for (const local of localProducts) {
      try {
        if (local.stripeId.startsWith('local_')) {
          productStatuses.push({
            localId: local.id,
            stripeId: null,
            status: SyncStatus.LOCAL_ONLY,
            localData: this.extractLocalProductData(local),
            lastVerified: timestamp,
          })
        } else {
          const stripeProduct = stripeProducts.get(local.stripeId)
          if (!stripeProduct) {
            productStatuses.push({
              localId: local.id,
              stripeId: local.stripeId,
              status: SyncStatus.ORPHANED,
              localData: this.extractLocalProductData(local),
              lastVerified: timestamp,
            })
          } else {
            processedStripeProductIds.add(local.stripeId)
            const differences = this.compareProductData(local, stripeProduct)
            productStatuses.push({
              localId: local.id,
              stripeId: stripeProduct.id,
              status: differences.length > 0 ? SyncStatus.DRIFT : SyncStatus.SYNCED,
              localData: this.extractLocalProductData(local),
              stripeData: this.extractStripeProductData(stripeProduct),
              differences,
              lastVerified: timestamp,
            })
          }
        }
      } catch (error) {
        errors.push({
          type: 'product',
          localId: local.id,
          message: error.message,
        })
      }
    }

    // Find Stripe-only products
    for (const [stripeId, stripeProduct] of stripeProducts) {
      if (!processedStripeProductIds.has(stripeId)) {
        productStatuses.push({
          localId: null,
          stripeId,
          status: SyncStatus.STRIPE_ONLY,
          stripeData: this.extractStripeProductData(stripeProduct),
          lastVerified: timestamp,
        })
      }
    }

    // Build price status list
    const priceStatuses: PriceSyncStatus[] = []
    const processedStripePriceIds = new Set<string>()

    for (const local of localPrices) {
      try {
        const product = local.product as { id: number; name: string; stripeId: string }

        if (local.stripeId.startsWith('local_price_')) {
          priceStatuses.push({
            localId: local.id,
            stripeId: null,
            productLocalId: product.id,
            productStripeId: product.stripeId.startsWith('local_') ? null : product.stripeId,
            status: SyncStatus.LOCAL_ONLY,
            localData: this.extractLocalPriceData(local),
            lastVerified: timestamp,
          })
        } else {
          const stripePrice = stripePrices.get(local.stripeId)
          if (!stripePrice) {
            priceStatuses.push({
              localId: local.id,
              stripeId: local.stripeId,
              productLocalId: product.id,
              productStripeId: product.stripeId.startsWith('local_') ? null : product.stripeId,
              status: SyncStatus.ORPHANED,
              localData: this.extractLocalPriceData(local),
              lastVerified: timestamp,
            })
          } else {
            processedStripePriceIds.add(local.stripeId)
            const differences = this.comparePriceData(local, stripePrice)
            const stripeProductId =
              typeof stripePrice.product === 'string' ? stripePrice.product : stripePrice.product?.id
            priceStatuses.push({
              localId: local.id,
              stripeId: stripePrice.id,
              productLocalId: product.id,
              productStripeId: stripeProductId ?? null,
              status: differences.length > 0 ? SyncStatus.DRIFT : SyncStatus.SYNCED,
              localData: this.extractLocalPriceData(local),
              stripeData: this.extractStripePriceData(stripePrice),
              differences,
              lastVerified: timestamp,
            })
          }
        }
      } catch (error) {
        errors.push({
          type: 'price',
          localId: local.id,
          message: error.message,
        })
      }
    }

    // Find Stripe-only prices
    for (const [stripeId, stripePrice] of stripePrices) {
      if (!processedStripePriceIds.has(stripeId)) {
        const stripeProductId = typeof stripePrice.product === 'string' ? stripePrice.product : stripePrice.product?.id
        priceStatuses.push({
          localId: null,
          stripeId,
          productLocalId: null,
          productStripeId: stripeProductId ?? null,
          status: SyncStatus.STRIPE_ONLY,
          stripeData: this.extractStripePriceData(stripePrice),
          lastVerified: timestamp,
        })
      }
    }

    return {
      timestamp,
      products: {
        total: productStatuses.length,
        synced: productStatuses.filter((p) => p.status === SyncStatus.SYNCED).length,
        localOnly: productStatuses.filter((p) => p.status === SyncStatus.LOCAL_ONLY).length,
        stripeOnly: productStatuses.filter((p) => p.status === SyncStatus.STRIPE_ONLY).length,
        drift: productStatuses.filter((p) => p.status === SyncStatus.DRIFT).length,
        orphaned: productStatuses.filter((p) => p.status === SyncStatus.ORPHANED).length,
        items: productStatuses,
      },
      prices: {
        total: priceStatuses.length,
        synced: priceStatuses.filter((p) => p.status === SyncStatus.SYNCED).length,
        localOnly: priceStatuses.filter((p) => p.status === SyncStatus.LOCAL_ONLY).length,
        stripeOnly: priceStatuses.filter((p) => p.status === SyncStatus.STRIPE_ONLY).length,
        drift: priceStatuses.filter((p) => p.status === SyncStatus.DRIFT).length,
        orphaned: priceStatuses.filter((p) => p.status === SyncStatus.ORPHANED).length,
        items: priceStatuses,
      },
      errors,
    }
  }

  // ============= Push Operations =============

  @Transactional()
  async pushProductToStripe(localId: number): Promise<ProductSyncStatus> {
    this.logger.log(`Pushing product ${localId} to Stripe`)

    const localProduct = await this.paymentsRepository.findProductByIdAdmin(localId)
    if (!localProduct) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRODUCT_NOT_FOUND', `Product with id ${localId} not found`)
    }

    const stripe = this.stripeService.getStripeClient()

    // Check if product was previously synced (orphaned case - needs re-creation)
    const isOrphaned = !localProduct.stripeId.startsWith('local_')
    let stripeProduct: Stripe.Product

    if (isOrphaned) {
      // Create new product in Stripe since the old one was deleted
      stripeProduct = await stripe.products.create({
        name: localProduct.name,
        description: localProduct.description,
        active: localProduct.active,
        metadata: (localProduct.metadata?.features as Record<string, string>) || {},
      })
    } else {
      // First time sync - create in Stripe
      stripeProduct = await stripe.products.create({
        name: localProduct.name,
        description: localProduct.description,
        active: localProduct.active,
        metadata: (localProduct.metadata?.features as Record<string, string>) || {},
      })
    }

    // Update local record with new Stripe ID
    await this.paymentsRepository.updateProductStripeId(localId, stripeProduct.id)

    this.logger.log(`Product ${localId} pushed to Stripe with ID ${stripeProduct.id}`)

    return {
      localId,
      stripeId: stripeProduct.id,
      status: SyncStatus.SYNCED,
      localData: this.extractLocalProductData(localProduct),
      stripeData: this.extractStripeProductData(stripeProduct),
      lastVerified: new Date(),
    }
  }

  @Transactional()
  async pushPriceToStripe(localId: number): Promise<PriceSyncStatus> {
    this.logger.log(`Pushing price ${localId} to Stripe`)

    const localPrice = await this.paymentsRepository.findPriceByIdAdmin(localId)
    if (!localPrice) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRICE_NOT_FOUND', `Price with id ${localId} not found`)
    }

    const product = localPrice.product as { id: number; name: string; stripeId?: string }

    // Ensure product is synced first
    if (!product.stripeId || product.stripeId.startsWith('local_')) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PRODUCT_NOT_SYNCED',
        'Cannot sync price - product must be synced to Stripe first'
      )
    }

    const stripe = this.stripeService.getStripeClient()

    // Create new price in Stripe (prices are immutable in Stripe)
    const stripePrice = await stripe.prices.create({
      product: product.stripeId,
      unit_amount: localPrice.unitAmount,
      currency: localPrice.currency,
      recurring: {
        interval: localPrice.interval as 'month' | 'year',
      },
      active: localPrice.active,
    })

    // Update local record with new Stripe ID
    await this.paymentsRepository.updatePriceStripeId(localId, stripePrice.id)

    this.logger.log(`Price ${localId} pushed to Stripe with ID ${stripePrice.id}`)

    return {
      localId,
      stripeId: stripePrice.id,
      productLocalId: product.id,
      productStripeId: product.stripeId,
      status: SyncStatus.SYNCED,
      localData: this.extractLocalPriceData(localPrice),
      stripeData: this.extractStripePriceData(stripePrice),
      lastVerified: new Date(),
    }
  }

  // ============= Pull Operations =============

  @Transactional()
  async pullProductFromStripe(localId: number): Promise<ProductSyncStatus> {
    this.logger.log(`Pulling product ${localId} from Stripe`)

    const localProduct = await this.paymentsRepository.findProductByIdAdmin(localId)
    if (!localProduct) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRODUCT_NOT_FOUND', `Product with id ${localId} not found`)
    }

    if (localProduct.stripeId.startsWith('local_')) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PRODUCT_NOT_SYNCED',
        'Cannot pull - product was never synced to Stripe'
      )
    }

    const stripe = this.stripeService.getStripeClient()

    try {
      const stripeProduct = await stripe.products.retrieve(localProduct.stripeId)

      // Update local record with Stripe data
      const updatedProduct = await this.paymentsRepository.updateProductFromStripe(localId, {
        name: stripeProduct.name,
        description: stripeProduct.description || '',
        active: stripeProduct.active,
        metadata: { features: stripeProduct.metadata || {} },
      })

      this.logger.log(`Product ${localId} updated from Stripe`)

      return {
        localId,
        stripeId: stripeProduct.id,
        status: SyncStatus.SYNCED,
        localData: this.extractLocalProductData(updatedProduct),
        stripeData: this.extractStripeProductData(stripeProduct),
        lastVerified: new Date(),
      }
    } catch (error) {
      if (this.isStripeNotFoundError(error)) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          'STRIPE_PRODUCT_NOT_FOUND',
          'Product no longer exists in Stripe. Consider unlinking it.'
        )
      }
      throw error
    }
  }

  @Transactional()
  async pullPriceFromStripe(localId: number): Promise<PriceSyncStatus> {
    this.logger.log(`Pulling price ${localId} from Stripe`)

    const localPrice = await this.paymentsRepository.findPriceByIdAdmin(localId)
    if (!localPrice) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRICE_NOT_FOUND', `Price with id ${localId} not found`)
    }

    if (localPrice.stripeId.startsWith('local_price_')) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PRICE_NOT_SYNCED',
        'Cannot pull - price was never synced to Stripe'
      )
    }

    const stripe = this.stripeService.getStripeClient()
    const product = localPrice.product as { id: number; name: string; stripeId?: string }

    try {
      const stripePrice = await stripe.prices.retrieve(localPrice.stripeId)

      // Update local record with Stripe data (prices are mostly immutable, but active can change)
      const updatedPrice = await this.paymentsRepository.updatePriceFromStripe(localId, {
        active: stripePrice.active,
        // Note: unitAmount, currency, interval are immutable in Stripe
      })

      this.logger.log(`Price ${localId} updated from Stripe`)

      const stripeProductId = typeof stripePrice.product === 'string' ? stripePrice.product : stripePrice.product?.id

      return {
        localId,
        stripeId: stripePrice.id,
        productLocalId: product.id,
        productStripeId: stripeProductId ?? null,
        status: SyncStatus.SYNCED,
        localData: this.extractLocalPriceData(updatedPrice),
        stripeData: this.extractStripePriceData(stripePrice),
        lastVerified: new Date(),
      }
    } catch (error) {
      if (this.isStripeNotFoundError(error)) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          'STRIPE_PRICE_NOT_FOUND',
          'Price no longer exists in Stripe. Consider unlinking it.'
        )
      }
      throw error
    }
  }

  // ============= Import from Stripe (Stripe-only items) =============

  @Transactional()
  async importProductFromStripe(stripeId: string): Promise<ProductSyncStatus> {
    this.logger.log(`Importing product from Stripe: ${stripeId}`)

    // Check if already exists locally
    const existingProduct = await this.paymentsRepository.findProductByStripeId(stripeId)
    if (existingProduct) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'PRODUCT_ALREADY_EXISTS',
        'Product with this Stripe ID already exists locally'
      )
    }

    const stripe = this.stripeService.getStripeClient()

    try {
      const stripeProduct = await stripe.products.retrieve(stripeId)

      // Create local product from Stripe data
      const newProduct = await this.paymentsRepository.createProductFromStripe({
        stripeId: stripeProduct.id,
        name: stripeProduct.name,
        description: stripeProduct.description || '',
        active: stripeProduct.active,
        metadata: { features: stripeProduct.metadata || {} },
      })

      this.logger.log(`Product imported from Stripe: ${stripeId} -> local ID ${newProduct.id}`)

      return {
        localId: newProduct.id,
        stripeId: stripeProduct.id,
        status: SyncStatus.SYNCED,
        localData: this.extractLocalProductData(newProduct),
        stripeData: this.extractStripeProductData(stripeProduct),
        lastVerified: new Date(),
      }
    } catch (error) {
      if (this.isStripeNotFoundError(error)) {
        throw new ApiException(HttpStatus.NOT_FOUND, 'STRIPE_PRODUCT_NOT_FOUND', 'Product not found in Stripe')
      }
      throw error
    }
  }

  @Transactional()
  async importPriceFromStripe(stripeId: string): Promise<PriceSyncStatus> {
    this.logger.log(`Importing price from Stripe: ${stripeId}`)

    // Check if already exists locally
    const existingPrice = await this.paymentsRepository.findPriceByStripeIdAdmin(stripeId)
    if (existingPrice) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'PRICE_ALREADY_EXISTS',
        'Price with this Stripe ID already exists locally'
      )
    }

    const stripe = this.stripeService.getStripeClient()

    try {
      const stripePrice = await stripe.prices.retrieve(stripeId, { expand: ['product'] })

      const stripeProductId = typeof stripePrice.product === 'string' ? stripePrice.product : stripePrice.product?.id

      if (!stripeProductId) {
        throw new ApiException(HttpStatus.BAD_REQUEST, 'INVALID_STRIPE_PRICE', 'Price has no associated product')
      }

      // Find or create the local product
      let localProduct = await this.paymentsRepository.findProductByStripeId(stripeProductId)
      if (!localProduct) {
        // Import the product first
        const productStatus = await this.importProductFromStripe(stripeProductId)
        if (!productStatus.localId) {
          throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, 'IMPORT_FAILED', 'Failed to import product')
        }
        localProduct = await this.paymentsRepository.findProductByIdAdmin(productStatus.localId)
      }

      if (!localProduct) {
        throw new ApiException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'PRODUCT_NOT_FOUND',
          'Failed to find or create product'
        )
      }

      // Extract interval from recurring
      const interval = stripePrice.recurring?.interval || 'month'

      // Create local price from Stripe data
      const newPrice = await this.paymentsRepository.createPriceFromStripe({
        stripeId: stripePrice.id,
        productId: localProduct.id,
        unitAmount: stripePrice.unit_amount || 0,
        currency: stripePrice.currency,
        interval,
        active: stripePrice.active,
      })

      this.logger.log(`Price imported from Stripe: ${stripeId} -> local ID ${newPrice.id}`)

      return {
        localId: newPrice.id,
        stripeId: stripePrice.id,
        productLocalId: localProduct.id,
        productStripeId: stripeProductId,
        status: SyncStatus.SYNCED,
        localData: this.extractLocalPriceData(newPrice),
        stripeData: this.extractStripePriceData(stripePrice),
        lastVerified: new Date(),
      }
    } catch (error) {
      if (this.isStripeNotFoundError(error)) {
        throw new ApiException(HttpStatus.NOT_FOUND, 'STRIPE_PRICE_NOT_FOUND', 'Price not found in Stripe')
      }
      throw error
    }
  }

  // ============= Unlink Operations =============

  @Transactional()
  async unlinkProduct(localId: number): Promise<ProductSyncStatus> {
    this.logger.log(`Unlinking product ${localId} from Stripe`)

    const localProduct = await this.paymentsRepository.findProductByIdAdmin(localId)
    if (!localProduct) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRODUCT_NOT_FOUND', `Product with id ${localId} not found`)
    }

    if (localProduct.stripeId.startsWith('local_')) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ALREADY_UNLINKED', 'Product is already unlinked from Stripe')
    }

    const updatedProduct = await this.paymentsRepository.unlinkProductFromStripe(localId)

    this.logger.log(`Product ${localId} unlinked from Stripe`)

    return {
      localId,
      stripeId: null,
      status: SyncStatus.LOCAL_ONLY,
      localData: this.extractLocalProductData(updatedProduct),
      lastVerified: new Date(),
    }
  }

  @Transactional()
  async unlinkPrice(localId: number): Promise<PriceSyncStatus> {
    this.logger.log(`Unlinking price ${localId} from Stripe`)

    const localPrice = await this.paymentsRepository.findPriceByIdAdmin(localId)
    if (!localPrice) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRICE_NOT_FOUND', `Price with id ${localId} not found`)
    }

    if (localPrice.stripeId.startsWith('local_price_')) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ALREADY_UNLINKED', 'Price is already unlinked from Stripe')
    }

    const product = localPrice.product as { id: number; name: string; stripeId?: string }
    const updatedPrice = await this.paymentsRepository.unlinkPriceFromStripe(localId)

    this.logger.log(`Price ${localId} unlinked from Stripe`)

    return {
      localId,
      stripeId: null,
      productLocalId: product.id,
      productStripeId: product.stripeId?.startsWith('local_') ? null : product.stripeId ?? null,
      status: SyncStatus.LOCAL_ONLY,
      localData: this.extractLocalPriceData(updatedPrice),
      lastVerified: new Date(),
    }
  }

  // ============= Bulk Operations =============

  async bulkReconcile(dto: BulkReconcileDto): Promise<ReconciliationResult> {
    this.logger.log(`Starting bulk reconciliation: ${dto.action}`)

    const result: ReconciliationResult = {
      success: true,
      action: dto.action,
      affectedProducts: 0,
      affectedPrices: 0,
      errors: [],
      details: [],
    }

    const report = await this.generateReconciliationReport()

    switch (dto.action) {
      case 'push_all_local':
        // Push all local-only and orphaned products to Stripe
        for (const product of report.products.items) {
          if (product.status === SyncStatus.LOCAL_ONLY || product.status === SyncStatus.ORPHANED) {
            if (dto.dryRun) {
              result.details.push(`Would push product ${product.localId}`)
              result.affectedProducts++
            } else {
              try {
                await this.pushProductToStripe(product.localId!)
                result.affectedProducts++
                result.details.push(`Pushed product ${product.localId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'product',
                  localId: product.localId!,
                  message: error.message,
                })
              }
            }
          }
        }

        // Push all local-only and orphaned prices to Stripe
        for (const price of report.prices.items) {
          if (price.status === SyncStatus.LOCAL_ONLY || price.status === SyncStatus.ORPHANED) {
            if (dto.dryRun) {
              result.details.push(`Would push price ${price.localId}`)
              result.affectedPrices++
            } else {
              try {
                await this.pushPriceToStripe(price.localId!)
                result.affectedPrices++
                result.details.push(`Pushed price ${price.localId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'price',
                  localId: price.localId!,
                  message: error.message,
                })
              }
            }
          }
        }
        break

      case 'pull_all_stripe':
        // Import all Stripe-only products
        for (const product of report.products.items) {
          if (product.status === SyncStatus.STRIPE_ONLY && product.stripeId) {
            if (dto.dryRun) {
              result.details.push(`Would import product ${product.stripeId}`)
              result.affectedProducts++
            } else {
              try {
                await this.importProductFromStripe(product.stripeId)
                result.affectedProducts++
                result.details.push(`Imported product ${product.stripeId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'product',
                  stripeId: product.stripeId,
                  message: error.message,
                })
              }
            }
          }
        }

        // Import all Stripe-only prices
        for (const price of report.prices.items) {
          if (price.status === SyncStatus.STRIPE_ONLY && price.stripeId) {
            if (dto.dryRun) {
              result.details.push(`Would import price ${price.stripeId}`)
              result.affectedPrices++
            } else {
              try {
                await this.importPriceFromStripe(price.stripeId)
                result.affectedPrices++
                result.details.push(`Imported price ${price.stripeId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'price',
                  stripeId: price.stripeId,
                  message: error.message,
                })
              }
            }
          }
        }
        break

      case 'sync_missing':
        // Push local-only to Stripe AND import Stripe-only to local
        // First push local products
        for (const product of report.products.items) {
          if (product.status === SyncStatus.LOCAL_ONLY && product.localId) {
            if (dto.dryRun) {
              result.details.push(`Would push product ${product.localId}`)
              result.affectedProducts++
            } else {
              try {
                await this.pushProductToStripe(product.localId)
                result.affectedProducts++
                result.details.push(`Pushed product ${product.localId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'product',
                  localId: product.localId,
                  message: error.message,
                })
              }
            }
          }
        }

        // Then import Stripe products
        for (const product of report.products.items) {
          if (product.status === SyncStatus.STRIPE_ONLY && product.stripeId) {
            if (dto.dryRun) {
              result.details.push(`Would import product ${product.stripeId}`)
              result.affectedProducts++
            } else {
              try {
                await this.importProductFromStripe(product.stripeId)
                result.affectedProducts++
                result.details.push(`Imported product ${product.stripeId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'product',
                  stripeId: product.stripeId,
                  message: error.message,
                })
              }
            }
          }
        }

        // Push local prices
        for (const price of report.prices.items) {
          if (price.status === SyncStatus.LOCAL_ONLY && price.localId) {
            if (dto.dryRun) {
              result.details.push(`Would push price ${price.localId}`)
              result.affectedPrices++
            } else {
              try {
                await this.pushPriceToStripe(price.localId)
                result.affectedPrices++
                result.details.push(`Pushed price ${price.localId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'price',
                  localId: price.localId,
                  message: error.message,
                })
              }
            }
          }
        }

        // Import Stripe prices
        for (const price of report.prices.items) {
          if (price.status === SyncStatus.STRIPE_ONLY && price.stripeId) {
            if (dto.dryRun) {
              result.details.push(`Would import price ${price.stripeId}`)
              result.affectedPrices++
            } else {
              try {
                await this.importPriceFromStripe(price.stripeId)
                result.affectedPrices++
                result.details.push(`Imported price ${price.stripeId}`)
                await this.delay(this.RATE_LIMIT_DELAY_MS)
              } catch (error) {
                result.errors.push({
                  type: 'price',
                  stripeId: price.stripeId,
                  message: error.message,
                })
              }
            }
          }
        }
        break
    }

    result.success = result.errors.length === 0

    this.logger.log(
      `Bulk reconciliation completed: ${result.affectedProducts} products, ${result.affectedPrices} prices, ${result.errors.length} errors`
    )

    return result
  }

  // ============= Private Helpers =============

  private async fetchAllStripeProducts(): Promise<Map<string, Stripe.Product>> {
    const stripe = this.stripeService.getStripeClient()
    const products = new Map<string, Stripe.Product>()

    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore) {
      const response = await stripe.products.list({
        limit: this.STRIPE_BATCH_SIZE,
        starting_after: startingAfter,
      })

      for (const product of response.data) {
        products.set(product.id, product)
      }

      hasMore = response.has_more
      if (response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id
      }

      if (hasMore) {
        await this.delay(this.RATE_LIMIT_DELAY_MS)
      }
    }

    return products
  }

  private async fetchAllStripePrices(): Promise<Map<string, Stripe.Price>> {
    const stripe = this.stripeService.getStripeClient()
    const prices = new Map<string, Stripe.Price>()

    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore) {
      const response = await stripe.prices.list({
        limit: this.STRIPE_BATCH_SIZE,
        starting_after: startingAfter,
        expand: ['data.product'],
      })

      for (const price of response.data) {
        prices.set(price.id, price)
      }

      hasMore = response.has_more
      if (response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id
      }

      if (hasMore) {
        await this.delay(this.RATE_LIMIT_DELAY_MS)
      }
    }

    return prices
  }

  private extractLocalProductData(product: AdminProductResponse): ProductLocalData {
    return {
      name: product.name,
      description: product.description,
      active: product.active,
      hierarchy: product.hierarchy,
      metadata: product.metadata || {},
    }
  }

  private extractStripeProductData(product: Stripe.Product): {
    name: string
    description: string
    active: boolean
    metadata: Record<string, string>
  } {
    return {
      name: product.name,
      description: product.description || '',
      active: product.active,
      metadata: product.metadata || {},
    }
  }

  private extractLocalPriceData(price: {
    unitAmount: number
    currency: string
    interval: string
    active: boolean
  }): PriceLocalData {
    return {
      unitAmount: price.unitAmount,
      currency: price.currency,
      interval: price.interval,
      active: price.active,
    }
  }

  private extractStripePriceData(price: Stripe.Price): {
    unitAmount: number
    currency: string
    interval: string
    active: boolean
  } {
    return {
      unitAmount: price.unit_amount || 0,
      currency: price.currency,
      interval: price.recurring?.interval || 'month',
      active: price.active,
    }
  }

  private compareProductData(local: AdminProductResponse, stripe: Stripe.Product): string[] {
    const differences: string[] = []

    if (local.name !== stripe.name) {
      differences.push(`name: "${local.name}" vs "${stripe.name}"`)
    }
    if (local.description !== (stripe.description || '')) {
      differences.push(`description differs`)
    }
    if (local.active !== stripe.active) {
      differences.push(`active: ${local.active} vs ${stripe.active}`)
    }

    return differences
  }

  private comparePriceData(
    local: { unitAmount: number; currency: string; interval: string; active: boolean },
    stripe: Stripe.Price
  ): string[] {
    const differences: string[] = []

    if (local.unitAmount !== (stripe.unit_amount || 0)) {
      differences.push(`unitAmount: ${local.unitAmount} vs ${stripe.unit_amount}`)
    }
    if (local.currency !== stripe.currency) {
      differences.push(`currency: "${local.currency}" vs "${stripe.currency}"`)
    }
    if (local.interval !== (stripe.recurring?.interval || 'month')) {
      differences.push(`interval: "${local.interval}" vs "${stripe.recurring?.interval}"`)
    }
    if (local.active !== stripe.active) {
      differences.push(`active: ${local.active} vs ${stripe.active}`)
    }

    return differences
  }

  private isStripeNotFoundError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      const e = error as { statusCode?: number; code?: string; type?: string }
      return e.statusCode === 404 || e.code === 'resource_missing' || e.type === 'StripeInvalidRequestError'
    }
    return false
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
