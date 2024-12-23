import { UserPresenceModule } from '@js-monorepo/user-presence'
import { Module, Provider } from '@nestjs/common'
import { PaymentsController } from './controller/payments.controller'
import { PaymentsRepository } from './repository/payments.repository'
import { PaymentsService } from './service/payments.service'
import { StripeService } from './service/stripe.service'
import { StripeModule } from './stripe.module'

const providers: Provider[] = [
  StripeService,
  PaymentsRepository,
  PaymentsService,
]

@Module({
  controllers: [PaymentsController],
  providers: [...providers],
  exports: [...providers, StripeModule],
  imports: [
    StripeModule.forRoot({
      apiKey: process.env.STRIPE_SECRET_KEY,
      apiVersion: '2023-10-16',
    }),
    UserPresenceModule,
  ],
})
export class PaymentsModule {}
