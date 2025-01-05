import { tryCatch } from '@js-monorepo/utils/common'
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
    const { email, ...restUser } = user

    const { result, error } = await tryCatch(() =>
      this.paymentsService.findUserSubscriptionStatus(user.id)
    )

    if (!error) {
      return {
        user: { ...restUser },
        subscription: { ...result },
      }
    }
    return {
      user: { ...restUser },
    }
  }
}
