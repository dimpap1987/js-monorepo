import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { RolesGuard } from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
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
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  CreatePriceDto,
  CreateProductDto,
  ToggleActiveDto,
  UpdatePriceDto,
  UpdateProductDto,
} from '../dto/admin-product.dto'
import { AssignTrialDto, DeactivateTrialDto, ExtendTrialDto } from '../dto/admin-trial.dto'
import { AdminProductsService } from '../service/admin-products.service'
import { TrialService } from '../service/trial.service'

@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
@Controller('payments/admin')
export class AdminProductsController {
  private readonly logger = new Logger(AdminProductsController.name)

  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly trialService: TrialService
  ) {}

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
    // Validate and parse productId if provided
    const parsedProductId = productId ? (isNaN(Number(productId)) ? undefined : Number(productId)) : undefined
    if (productId && parsedProductId === undefined) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'INVALID_PRODUCT_ID', 'Invalid productId parameter')
    }
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

  // ============= Trial Management Endpoints =============

  @Post('trials/:subscriptionId/extend')
  async extendTrial(@Param('subscriptionId', ParseIntPipe) subscriptionId: number, @Body() dto: ExtendTrialDto) {
    return this.trialService.extendTrialAdmin(subscriptionId, dto)
  }

  @Post('trials/:subscriptionId/deactivate')
  async deactivateTrial(
    @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
    @Body() dto?: DeactivateTrialDto
  ) {
    return this.trialService.deactivateTrialAdmin(subscriptionId, dto)
  }

  @Post('trials/assign')
  async assignTrial(@Body() dto: AssignTrialDto) {
    return this.trialService.assignTrialAdmin(dto)
  }
}
