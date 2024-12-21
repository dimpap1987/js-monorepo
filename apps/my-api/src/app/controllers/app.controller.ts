import { PaymentsService } from '@js-monorepo/payments-server'
import { Controller, Get, Logger, Req } from '@nestjs/common'
import { Request } from 'express'

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('session')
  async getSession(@Req() req: Request) {
    const user = req.user?.user
    if (!user) return null

    const sub = await this.paymentsService.findUserSubscriptionStatus(user.id)
    const { email, ...restUser } = user
    return {
      user: { ...restUser },
      subscription: {
        plan: sub.plans,
        isSubscribed: sub.isSubscribed,
      },
    }
  }
}
