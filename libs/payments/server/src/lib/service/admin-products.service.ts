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

    // Note: Stripe prices are immutable - we can only update our local record
    // For synced prices, warn the user that Stripe price won't change
    if (!existingPrice.stripeId.startsWith('local_price_')) {
      this.logger.warn(`Price ${id} is synced to Stripe. Stripe prices are immutable - only local record updated.`)
    }

    return this.paymentsRepository.updatePriceAdmin(id, dto)
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

    if (!price.stripeId.startsWith('local_price_')) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'PRICE_ALREADY_SYNCED', 'Price is already synced to Stripe')
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
        features: (product.features as Record<string, string>) || {},
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
        currency: price.currency,
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
