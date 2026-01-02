import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { SessionUserType } from '@js-monorepo/types'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { InvoiceListResponse } from '../dto/invoice.dto'
import { PaymentsService } from '../service/payments.service'
import { StripeService } from '../service/stripe.service'

@Controller('payments/invoices')
export class InvoiceController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Get()
  @UseGuards(LoggedInGuard)
  async listInvoices(
    @SessionUser() sessionUser: SessionUserType,
    @Query('limit') limit?: string,
    @Query('startingAfter') startingAfter?: string
  ): Promise<InvoiceListResponse> {
    const paymentCustomer = await this.paymentsService.findPaymentCustomerById(sessionUser.id)

    if (!paymentCustomer?.stripeCustomerId) {
      return { invoices: [], hasMore: false }
    }

    const invoiceLimit = limit ? Math.min(parseInt(limit, 10), 100) : 10

    return this.stripeService.listInvoices(paymentCustomer.stripeCustomerId, invoiceLimit, startingAfter)
  }
}
