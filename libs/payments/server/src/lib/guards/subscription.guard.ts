import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PaymentsService } from '../service/payments.service'
import { ApiException } from '@js-monorepo/nest/exceptions'

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly paymentService: PaymentsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredProduct = this.reflector.get<string>('hasProduct', context.getHandler())
    if (!requiredProduct) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user?.user

    if (!user) return false

    const userHighestHierarchy = await this.paymentService.getHighestActivePlanByUser(user.id)

    const requiredProductHierarchy = await this.paymentService.findProductyByName(requiredProduct)

    if (userHighestHierarchy < requiredProductHierarchy.hierarchy) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'INSUFFICIENT_SUBSCRIPTION',
        'Your current subscription plan does not allow this action.'
      )
    }

    return true
  }
}
