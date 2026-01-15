## `@js-monorepo/payments-server`

NestJS Stripe integration and subscription/payments domain for the monorepo.  
Provides modules, services, guards, and decorators to handle products, prices, subscriptions, webhooks, and admin flows.

> **Price & Locale Rule**  
> Each Stripe product has separate prices for **EUR** and **USD**.  
> In the apps, users with `el` locale see **EUR** prices; users with `en` locale see **USD** prices.  
> Always ensure displayed prices in the UI match the Stripe price **for the same currency** that will be charged at checkout.

### Exports

From `libs/payments/server/src/index.ts`:

- **Modules**
  - `PaymentsModule` – main feature module with routes/services (extends your API with payments endpoints)
  - `StripeModule` – low‑level Stripe client module (used internally by `PaymentsModule` or standalone)
- **Services**
  - `PaymentsService` – subscription lifecycle, checkout sessions, webhooks
  - `StripeService` – thin wrapper around the Stripe SDK
  - `AdminProductsService` – product + price management for admin UI
- **Guards / Decorators**
  - `SubscriptionGuard` – protects routes that require an active subscription
  - `HasProduct` decorator – asserts the user has access to a given product
- **Infrastructure**
  - `rawBodyMiddleware` – exposes raw request body for webhook signature verification
  - `constants`, `utils`
- **Admin DTOs / Types**
  - `AdminProductDto` and related DTOs
  - `ProductMetadataType`, `CreateProductType`, `CreateProductWithPricesRequest`

### Basic Setup (NestJS)

```ts
// apps/gym-api/src/app/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PaymentsModule } from '@js-monorepo/payments-server'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PaymentsModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        stripeSecretKey: config.getOrThrow('STRIPE_SECRET_KEY'),
        webhookSecret: config.getOrThrow('STRIPE_WEBHOOK_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Handling Stripe Webhooks

Use the provided `rawBodyMiddleware` to ensure webhook signatures validate correctly:

```ts
// main.ts
import { rawBodyMiddleware } from '@js-monorepo/payments-server'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.use('/webhooks/stripe', rawBodyMiddleware)
  await app.listen(3000)
}
```

Then in a controller within `PaymentsModule`:

```ts
import { Controller, Post, Req } from '@nestjs/common'
import { PaymentsService } from '@js-monorepo/payments-server'

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async handle(@Req() req: any) {
    await this.paymentsService.handleStripeWebhook(req)
    return { received: true }
  }
}
```

### Admin Product Management

The admin UI (`@js-monorepo/payments-ui`) talks to API endpoints backed by `AdminProductsService`:

- Create a product with **multiple prices** (EUR + USD, monthly/yearly)
- Update product metadata (features, descriptions)
- Deactivate prices or products safely

Example controller usage:

```ts
import { Body, Controller, Post } from '@nestjs/common'
import { AdminProductsService, CreateProductWithPricesRequest } from '@js-monorepo/payments-server'

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProducts: AdminProductsService) {}

  @Post()
  create(@Body() body: CreateProductWithPricesRequest) {
    return this.adminProducts.createProductWithPrices(body)
  }
}
```

Make sure the admin UI and backend agree on:

- **Currency codes** (`EUR`, `USD`)
- **Intervals** (`month`, `year`)
- **Features** shape (keys used in UI badges)

### Protecting Subscription‑Only Endpoints

```ts
import { Controller, Get, UseGuards } from '@nestjs/common'
import { SubscriptionGuard } from '@js-monorepo/payments-server'

@Controller('gym')
@UseGuards(SubscriptionGuard)
export class GymController {
  @Get('protected-resource')
  getProtectedData() {
    return { ok: true }
  }
}
```

Use `HasProduct` when a specific product/plan is required.
