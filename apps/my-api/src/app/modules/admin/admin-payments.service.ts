import { PaginationType, Subscription } from '@js-monorepo/types'
import { PaymentsService } from '@js-monorepo/payments-server'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AdminPaymentsService {
  constructor(private readonly paymentsService: PaymentsService) {}

  async getAllSubscriptions(
    page?: number,
    pageSize?: number,
    filters?: { status?: string; search?: string; plan?: string }
  ): Promise<PaginationType<Subscription>> {
    return this.paymentsService.findAllSubscriptions(page, pageSize, filters)
  }

  async getSubscriptionStats() {
    return this.paymentsService.getSubscriptionStats()
  }
}
