import { ApiException } from '@js-monorepo/nest/exceptions'
import { PaginationType } from '@js-monorepo/types/pagination'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import {
  AdminProductResponse,
  AdminProductStatsResponse,
  CreatePriceDto,
  CreateProductDto,
  ProductFiltersDto,
  UpdatePriceDto,
  UpdateProductDto,
} from '../dto/admin-product.dto'
import { PaymentsRepository } from '../repository/payments.repository'
import { StripeService } from './stripe.service'

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name)

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly stripeService: StripeService
  ) {}

  // ============= Product Operations =============

  async findAllProducts(
    page: number,
    pageSize: number,
    filters?: ProductFiltersDto
  ): Promise<PaginationType<AdminProductResponse>> {
    return this.paymentsRepository.findAllProductsAdmin(page, pageSize, filters)
  }

  async findProductById(id: number): Promise<AdminProductResponse> {
    const product = await this.paymentsRepository.findProductByIdAdmin(id)

    if (!product) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRODUCT_NOT_FOUND', `Product with id ${id} not found`)
    }

    return product
  }

  @Transactional()
  async createProduct(dto: CreateProductDto): Promise<AdminProductResponse> {
    this.logger.log(`Creating product: ${dto.name}`)

    // Check if product name already exists
    const existingProduct = await this.paymentsRepository.findProductyByName(dto.name)
    if (existingProduct) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'PRODUCT_NAME_EXISTS',
        `Product with name '${dto.name}' already exists`
      )
    }

    // Create product locally first
    const product = await this.paymentsRepository.createProductLocal(dto)
    this.logger.log(`Product created locally with id: ${product.id}`)

    // If syncToStripe is requested, sync to Stripe
    if (dto.syncToStripe) {
      try {
        return await this.syncProductToStripeInternal(product)
      } catch (error) {
        this.logger.warn(`Failed to sync product to Stripe, keeping local: ${error.message}`)
        // Product still created locally, just not synced
      }
    }

    return product
  }

  @Transactional()
  async updateProduct(id: number, dto: UpdateProductDto): Promise<AdminProductResponse> {
    this.logger.log(`Updating product: ${id}`)

    const existingProduct = await this.findProductById(id)

    // If updating name, check for duplicates
    if (dto.name && dto.name !== existingProduct.name) {
      const productWithName = await this.paymentsRepository.findProductyByName(dto.name)
      if (productWithName && productWithName.id !== id) {
        throw new ApiException(
          HttpStatus.CONFLICT,
          'PRODUCT_NAME_EXISTS',
          `Product with name '${dto.name}' already exists`
        )
      }
    }

    const updatedProduct = await this.paymentsRepository.updateProductAdmin(id, dto)

    // If product is synced to Stripe, update Stripe as well
    if (!existingProduct.stripeId.startsWith('local_')) {
      try {
        await this.updateStripeProduct(existingProduct.stripeId, dto)
      } catch (error) {
        this.logger.warn(`Failed to update product in Stripe: ${error.message}`)
        // Local update succeeded, Stripe update failed - acceptable for now
      }
    }

    return updatedProduct
  }

  @Transactional()
  async deleteProduct(id: number): Promise<void> {
    this.logger.log(`Deleting product: ${id}`)

    const product = await this.findProductById(id)

    // Check if product can be deleted
    const canDelete = await this.paymentsRepository.canDeleteProduct(id)
    if (!canDelete) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'PRODUCT_HAS_SUBSCRIPTIONS',
        'Cannot delete product with existing subscriptions. Deactivate it instead.'
      )
    }

    // If synced to Stripe, archive in Stripe (Stripe doesn't allow deletion)
    if (!product.stripeId.startsWith('local_')) {
      try {
        await this.archiveStripeProduct(product.stripeId)
      } catch (error) {
        this.logger.warn(`Failed to archive product in Stripe: ${error.message}`)
      }
    }

    await this.paymentsRepository.deleteProductAdmin(id)
    this.logger.log(`Product deleted: ${id}`)
  }

  @Transactional()
  async toggleProductActive(id: number, active: boolean): Promise<AdminProductResponse> {
    this.logger.log(`Toggling product ${id} active status to: ${active}`)

    const product = await this.findProductById(id)

    const updatedProduct = await this.paymentsRepository.updateProductAdmin(id, { active })

    // If synced to Stripe, update Stripe as well
    if (!product.stripeId.startsWith('local_')) {
      try {
        await this.updateStripeProduct(product.stripeId, { active })
      } catch (error) {
        this.logger.warn(`Failed to update product active status in Stripe: ${error.message}`)
      }
    }

    return updatedProduct
  }

  @Transactional()
  async syncProductToStripe(id: number): Promise<AdminProductResponse> {
    this.logger.log(`Syncing product to Stripe: ${id}`)

    const product = await this.findProductById(id)

    if (!product.stripeId.startsWith('local_')) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'PRODUCT_ALREADY_SYNCED', 'Product is already synced to Stripe')
    }

    return this.syncProductToStripeInternal(product)
  }

  async getProductStats(): Promise<AdminProductStatsResponse> {
    return this.paymentsRepository.getProductStats()
  }

  // ============= Price Operations =============

  async findPricesByProduct(productId?: number) {
    return this.paymentsRepository.findPricesByProductAdmin(productId)
  }

  async findPriceById(id: number) {
    const price = await this.paymentsRepository.findPriceByIdAdmin(id)

    if (!price) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PRICE_NOT_FOUND', `Price with id ${id} not found`)
    }

    return price
  }

  @Transactional()
  async createPrice(dto: CreatePriceDto) {
    this.logger.log(`Creating price for product: ${dto.productId}`)

    // Verify product exists
    await this.findProductById(dto.productId)

    // Create price locally first
    const price = await this.paymentsRepository.createPriceLocal(dto)
    this.logger.log(`Price created locally with id: ${price.id}`)

    // If syncToStripe is requested and product is synced, sync price to Stripe
    if (dto.syncToStripe) {
      const product = await this.findProductById(dto.productId)
      if (!product.stripeId.startsWith('local_')) {
        try {
          return await this.syncPriceToStripeInternal(price, product.stripeId)
        } catch (error) {
          this.logger.warn(`Failed to sync price to Stripe: ${error.message}`)
        }
      }
    }

    return price
  }

  @Transactional()
  async updatePrice(id: number, dto: UpdatePriceDto) {
    this.logger.log(`Updating price: ${id}`)

    const existingPrice = await this.findPriceById(id)
    const isPriceSynced = !existingPrice.stripeId.startsWith('local_price_')

    // Check if only active status is being updated (no immutable fields changed)
    const onlyActiveChanged =
      dto.active !== undefined &&
      dto.unitAmount === undefined &&
      dto.currency === undefined &&
      dto.interval === undefined

    // Check if immutable fields are being changed
    const immutableFieldsChanged =
      dto.unitAmount !== undefined || dto.currency !== undefined || dto.interval !== undefined

    // If price is synced and immutable fields are changing with sync requested, create replacement
    if (dto.syncToStripe && isPriceSynced && immutableFieldsChanged) {
      const product = await this.findProductById(existingPrice.productId)
      if (!product.stripeId.startsWith('local_')) {
        // Declare newPrice outside try-catch so it's accessible in catch block
        let newPrice: Awaited<ReturnType<typeof this.paymentsRepository.createReplacementPrice>> | null = null
        try {
          // Check for active subscriptions on the old price
          const subscriptionCount = await this.paymentsRepository.getPriceSubscriptionCount(id)
          const hasActiveSubscriptions = subscriptionCount > 0

          // Determine new price values (use dto values or existing values)
          // Ensure currency is uppercase for consistency
          const newPriceData = {
            unitAmount: dto.unitAmount ?? existingPrice.unitAmount,
            currency: (dto.currency ?? existingPrice.currency).toUpperCase(),
            interval: dto.interval ?? existingPrice.interval,
            active: dto.active ?? existingPrice.active,
          }

          // Create a new price record with updated values (keep old price in DB)
          newPrice = await this.paymentsRepository.createReplacementPrice(id, newPriceData)

          // Check if old price exists in Stripe before trying to deactivate it
          const stripe = this.stripeService.getStripeClient()
          try {
            await stripe.prices.retrieve(existingPrice.stripeId)
            // Price exists in Stripe
            if (hasActiveSubscriptions) {
              // Keep old price active in Stripe if it has subscriptions
              this.logger.log(
                `Old price ${existingPrice.stripeId} has ${subscriptionCount} active subscriptions. Keeping it active in Stripe.`
              )
            } else {
              // No subscriptions, safe to deactivate
              await this.archiveStripePrice(existingPrice.stripeId)
            }
          } catch (error) {
            // Price doesn't exist (orphaned), just log it
            this.logger.warn(`Old price ${existingPrice.stripeId} doesn't exist in Stripe, skipping deactivation`)
          }

          // Create new price in Stripe with updated values
          const newStripePrice = await this.syncPriceToStripeInternal(newPrice, product.stripeId)
          this.logger.log(
            `Price ${id} replaced with new price ${newPrice.id}. Old price marked as legacy with ${subscriptionCount} active subscriptions.`
          )
          return newStripePrice
        } catch (error) {
          this.logger.error(`Failed to sync updated price to Stripe: ${error.message}`, error.stack)
          // If sync fails, we still created the replacement price locally
          // Return the new price that was created (even though Stripe sync failed)
          if (newPrice) {
            return newPrice
          }
          // If we didn't even create the replacement price, throw the error
          throw error
        }
      } else {
        this.logger.warn(`Cannot sync price ${id} - product must be synced to Stripe first`)
      }
      // Return early - don't update the old price record
      return existingPrice
    }

    // For all other cases, update the existing price record
    const updatedPrice = await this.paymentsRepository.updatePriceAdmin(id, dto)

    // If only active status changed and price is synced, update Stripe directly
    if (onlyActiveChanged && isPriceSynced && dto.active !== undefined) {
      try {
        await this.updateStripePrice(existingPrice.stripeId, dto.active)
        return updatedPrice
      } catch (error) {
        this.logger.warn(`Failed to update price active status in Stripe: ${error.message}`)
        return updatedPrice
      }
    }

    // If price is local and sync requested, sync it to Stripe
    if (dto.syncToStripe && !isPriceSynced) {
      const product = await this.findProductById(existingPrice.productId)
      if (!product.stripeId.startsWith('local_')) {
        try {
          return await this.syncPriceToStripeInternal(updatedPrice, product.stripeId)
        } catch (error) {
          this.logger.warn(`Failed to sync price to Stripe after update: ${error.message}`)
          return updatedPrice
        }
      } else {
        this.logger.warn(`Cannot sync price ${id} - product must be synced to Stripe first`)
      }
    }

    return updatedPrice
  }

  @Transactional()
  async deletePrice(id: number): Promise<void> {
    this.logger.log(`Deleting price: ${id}`)

    const price = await this.findPriceById(id)

    // Check if price can be deleted
    const canDelete = await this.paymentsRepository.canDeletePrice(id)
    if (!canDelete) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'PRICE_HAS_SUBSCRIPTIONS',
        'Cannot delete price with existing subscriptions. Deactivate it instead.'
      )
    }

    // If synced to Stripe, archive in Stripe
    if (!price.stripeId.startsWith('local_price_')) {
      try {
        await this.archiveStripePrice(price.stripeId)
      } catch (error) {
        this.logger.warn(`Failed to archive price in Stripe: ${error.message}`)
      }
    }

    await this.paymentsRepository.deletePriceAdmin(id)
    this.logger.log(`Price deleted: ${id}`)
  }

  @Transactional()
  async togglePriceActive(id: number, active: boolean) {
    this.logger.log(`Toggling price ${id} active status to: ${active}`)

    const price = await this.findPriceById(id)

    const updatedPrice = await this.paymentsRepository.updatePriceAdmin(id, { active })

    // If synced to Stripe, update Stripe as well
    if (!price.stripeId.startsWith('local_price_')) {
      try {
        await this.updateStripePrice(price.stripeId, active)
      } catch (error) {
        this.logger.warn(`Failed to update price active status in Stripe: ${error.message}`)
      }
    }

    return updatedPrice
  }

  @Transactional()
  async syncPriceToStripe(id: number) {
    this.logger.log(`Syncing price to Stripe: ${id}`)

    const price = await this.findPriceById(id)

    // Check if price is already synced and exists in Stripe
    if (!price.stripeId.startsWith('local_price_')) {
      // Price has a stripeId - check if it actually exists in Stripe
      try {
        const stripe = this.stripeService.getStripeClient()
        await stripe.prices.retrieve(price.stripeId)
        // Price exists in Stripe, so it's already synced
        throw new ApiException(HttpStatus.BAD_REQUEST, 'PRICE_ALREADY_SYNCED', 'Price is already synced to Stripe')
      } catch (error) {
        // If error is our ApiException, re-throw it
        if (error instanceof ApiException) {
          throw error
        }
        // Check if it's a Stripe error indicating the price doesn't exist
        // Stripe errors have a 'type' property (e.g., 'StripeInvalidRequestError')
        // and statusCode 404 means not found
        const stripeError = error as any
        if (stripeError?.statusCode === 404 || stripeError?.code === 'resource_missing') {
          // Price is orphaned - we'll create a new one in Stripe
          this.logger.warn(
            `Price ${id} has stripeId ${price.stripeId} but doesn't exist in Stripe. Creating new price.`
          )
        } else {
          // Some other error occurred, log and re-throw
          this.logger.error(`Error checking if price exists in Stripe: ${error.message}`, error.stack)
          throw new ApiException(
            HttpStatus.SERVICE_UNAVAILABLE,
            'STRIPE_CHECK_FAILED',
            'Failed to verify price in Stripe. Please try again later.'
          )
        }
      }
    }

    // Get the product to ensure it's synced
    const product = await this.findProductById(price.productId)
    if (product.stripeId.startsWith('local_')) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PRODUCT_NOT_SYNCED',
        'Cannot sync price - product must be synced to Stripe first'
      )
    }

    return this.syncPriceToStripeInternal(price, product.stripeId)
  }

  // ============= Private Stripe Helpers =============

  private async syncProductToStripeInternal(product: AdminProductResponse): Promise<AdminProductResponse> {
    try {
      const stripeResult = await this.stripeService.createProductWithPrices({
        name: product.name,
        description: product.description,
        features: (product.metadata.features as Record<string, string>) || {},
        prices: [], // Create product without prices first
      })

      // Update local product with Stripe ID
      const updatedProduct = await this.paymentsRepository.updateProductStripeId(product.id, stripeResult.product.id)

      this.logger.log(`Product synced to Stripe with id: ${stripeResult.product.id}`)
      return updatedProduct
    } catch (error) {
      this.logger.error(`Failed to sync product to Stripe: ${error.message}`, error.stack)
      throw new ApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        'STRIPE_SYNC_FAILED',
        'Failed to sync product with Stripe. Please try again later.'
      )
    }
  }

  private async syncPriceToStripeInternal(
    price: { id: number; unitAmount: number; currency: string; interval: string },
    stripeProductId: string
  ) {
    try {
      // Create price in Stripe using the Stripe SDK directly
      const stripe = this.stripeService.getStripeClient()
      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: price.unitAmount,
        currency: price.currency.toLowerCase(), // Stripe expects lowercase currency codes
        recurring: {
          interval: price.interval as 'month' | 'year',
        },
      })

      // Update local price with Stripe ID
      const updatedPrice = await this.paymentsRepository.updatePriceStripeId(price.id, stripePrice.id)

      this.logger.log(`Price synced to Stripe with id: ${stripePrice.id}`)
      return updatedPrice
    } catch (error) {
      this.logger.error(`Failed to sync price to Stripe: ${error.message}`, error.stack)
      throw new ApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        'STRIPE_SYNC_FAILED',
        'Failed to sync price with Stripe. Please try again later.'
      )
    }
  }

  private async updateStripeProduct(stripeId: string, data: UpdateProductDto): Promise<void> {
    try {
      const stripe = this.stripeService.getStripeClient()
      await stripe.products.update(stripeId, {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.active !== undefined && { active: data.active }),
      })
    } catch (error) {
      this.logger.error(`Failed to update Stripe product: ${error.message}`)
      throw error
    }
  }

  private async archiveStripeProduct(stripeId: string): Promise<void> {
    try {
      const stripe = this.stripeService.getStripeClient()
      await stripe.products.update(stripeId, { active: false })
    } catch (error) {
      this.logger.error(`Failed to archive Stripe product: ${error.message}`)
      throw error
    }
  }

  private async updateStripePrice(stripeId: string, active: boolean): Promise<void> {
    try {
      const stripe = this.stripeService.getStripeClient()
      await stripe.prices.update(stripeId, { active })
    } catch (error) {
      this.logger.error(`Failed to update Stripe price: ${error.message}`)
      throw error
    }
  }

  private async archiveStripePrice(stripeId: string): Promise<void> {
    try {
      const stripe = this.stripeService.getStripeClient()
      await stripe.prices.update(stripeId, { active: false })
    } catch (error) {
      this.logger.error(`Failed to archive Stripe price: ${error.message}`)
      throw error
    }
  }
}
