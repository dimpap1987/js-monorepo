## `@js-monorepo/nest-utils`

Shared NestJS utilities for decorators, interceptors, pipes, Redis helpers, vault secrets, idempotency, logging, and more.  
These are used by multiple backend apps (`my-api`, `bibikos-api`, webhook server, etc.).

### Exports

From `libs/nest-utils/src/lib/index.ts`:

- **Decorators** (`./decorators`)
  - `@CatchAndLog`, `@Retry`, `@MeasurePerformance`, cookie helpers, etc.
- **Exceptions & Filters** (`./exceptions`)
  - `ApiException`, HTTP exception helpers, filters
- **Idempotency** (`./idempotency`)
  - `IdempotencyInterceptor`, `IdempotencyModule`, helpers
- **Interceptors** (`./interceptors`)
  - Timeout and other cross‑cutting concerns
- **Pipes** (`./pipes`)
  - `QueryValidationPipe`, `ZodPipe`
- **Redis utilities** (`./redis`, `./redis-event-pub-sub`)
  - Redis client helpers
  - Event emitter/subscriber for pub/sub
- **Vault** (`./vault`)
  - Vault module + service for secrets management
- **Logger** (within `./logger`)
  - Structured logging module/service

> See the individual sub‑folders in `src/lib/` for exact exports and docs per feature.

### Example – Zod Validation Pipe

```ts
import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '@js-monorepo/nest-utils'
import { someQuerySchema } from '@js-monorepo/schemas'

@Controller('items')
export class ItemsController {
  @Get()
  @UsePipes(new ZodValidationPipe(someQuerySchema))
  findAll(@Query() query: any) {
    // query is now validated against someQuerySchema
  }
}
```

### Example – Idempotency Interceptor

```ts
import { Controller, Post, UseInterceptors } from '@nestjs/common'
import { IdempotencyInterceptor } from '@js-monorepo/nest-utils'

@Controller('payments')
@UseInterceptors(IdempotencyInterceptor)
export class PaymentsController {
  @Post('charge')
  async charge() {
    // Will not be executed multiple times for the same idempotency key
  }
}
```

Always prefer these shared utilities over re‑implementing similar patterns in each app.
