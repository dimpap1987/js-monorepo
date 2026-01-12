import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  CreatePriceDto,
  CreateProductDto,
  ToggleActiveDto,
  UpdatePriceDto,
  UpdateProductDto,
} from '../dto/admin-product.dto'
import { AdminProductsService } from '../service/admin-products.service'

/**
 * Admin Products Controller
 *
 * Note: This controller does NOT include authentication guards.
 * Auth guards should be applied by the consuming application (e.g., RolesGuard with ADMIN role).
 *
 * Example usage in your app:
 * - Import PaymentsModule in your AdminModule
 * - Apply @UseGuards(RolesGuard) and @HasRoles(RolesEnum.ADMIN) at the module level
 */
@Controller('payments/admin')
export class AdminProductsController {
  private readonly logger = new Logger(AdminProductsController.name)

  constructor(private readonly adminProductsService: AdminProductsService) {}

  // ============= Product Endpoints =============

  @Get('products')
  async getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('active') active?: string,
    @Query('search') search?: string
  ) {
    const filters = {
      ...(active !== undefined && { active: active === 'true' }),
      ...(search && { search }),
    }

    return this.adminProductsService.findAllProducts(page, pageSize, filters)
  }

  @Get('products/stats')
  async getProductStats() {
    return this.adminProductsService.getProductStats()
  }

  @Get('products/:id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.findProductById(id)
  }

  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.adminProductsService.createProduct(dto)
  }

  @Put('products/:id')
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.adminProductsService.updateProduct(id, dto)
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    await this.adminProductsService.deleteProduct(id)
  }

  @Patch('products/:id/toggle')
  async toggleProductActive(@Param('id', ParseIntPipe) id: number, @Body() dto: ToggleActiveDto) {
    return this.adminProductsService.toggleProductActive(id, dto.active)
  }

  @Post('products/:id/sync')
  async syncProductToStripe(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.syncProductToStripe(id)
  }

  // ============= Price Endpoints =============

  @Get('prices')
  async getPrices(@Query('productId') productId?: string) {
    const parsedProductId = productId ? parseInt(productId, 10) : undefined
    return this.adminProductsService.findPricesByProduct(parsedProductId)
  }

  @Get('prices/:id')
  async getPrice(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.findPriceById(id)
  }

  @Post('prices')
  async createPrice(@Body() dto: CreatePriceDto) {
    return this.adminProductsService.createPrice(dto)
  }

  @Put('prices/:id')
  async updatePrice(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePriceDto) {
    return this.adminProductsService.updatePrice(id, dto)
  }

  @Delete('prices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePrice(@Param('id', ParseIntPipe) id: number) {
    await this.adminProductsService.deletePrice(id)
  }

  @Patch('prices/:id/toggle')
  async togglePriceActive(@Param('id', ParseIntPipe) id: number, @Body() dto: ToggleActiveDto) {
    return this.adminProductsService.togglePriceActive(id, dto.active)
  }

  @Post('prices/:id/sync')
  async syncPriceToStripe(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.syncPriceToStripe(id)
  }
}
