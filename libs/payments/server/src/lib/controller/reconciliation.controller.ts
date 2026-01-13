import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { RolesGuard } from '@js-monorepo/auth/nest/session'
import { Body, Controller, Get, Logger, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { BulkReconcileDto, ImportFromStripeDto } from '../dto/reconciliation.dto'
import { ReconciliationService } from '../service/reconciliation.service'

@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
@Controller('payments/admin/reconciliation')
export class ReconciliationController {
  private readonly logger = new Logger(ReconciliationController.name)

  constructor(private readonly reconciliationService: ReconciliationService) {}

  // ============= Report =============

  @Get('report')
  async getReconciliationReport() {
    this.logger.log('Generating reconciliation report')
    return this.reconciliationService.generateReconciliationReport()
  }

  // ============= Product Endpoints =============

  @Get('products/:id/status')
  async getProductSyncStatus(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.verifyProductSyncStatus(id)
  }

  @Post('products/:id/push')
  async pushProductToStripe(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.pushProductToStripe(id)
  }

  @Post('products/:id/pull')
  async pullProductFromStripe(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.pullProductFromStripe(id)
  }

  @Post('products/:id/unlink')
  async unlinkProduct(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.unlinkProduct(id)
  }

  @Post('products/import')
  async importProductFromStripe(@Body() dto: ImportFromStripeDto) {
    return this.reconciliationService.importProductFromStripe(dto.stripeId)
  }

  // ============= Price Endpoints =============

  @Get('prices/:id/status')
  async getPriceSyncStatus(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.verifyPriceSyncStatus(id)
  }

  @Post('prices/:id/push')
  async pushPriceToStripe(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.pushPriceToStripe(id)
  }

  @Post('prices/:id/pull')
  async pullPriceFromStripe(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.pullPriceFromStripe(id)
  }

  @Post('prices/:id/unlink')
  async unlinkPrice(@Param('id', ParseIntPipe) id: number) {
    return this.reconciliationService.unlinkPrice(id)
  }

  @Post('prices/import')
  async importPriceFromStripe(@Body() dto: ImportFromStripeDto) {
    return this.reconciliationService.importPriceFromStripe(dto.stripeId)
  }

  // ============= Bulk Operations =============

  @Post('bulk')
  async bulkReconcile(@Body() dto: BulkReconcileDto) {
    return this.reconciliationService.bulkReconcile(dto)
  }
}
