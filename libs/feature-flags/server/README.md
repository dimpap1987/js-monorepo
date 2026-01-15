# Feature Flags – Server Library (`@js-monorepo/feature-flags-server`)

Server-side helpers for managing feature flags backed by the `gym-db` Prisma schema, using the same transactional pattern as the payments module.

## Overview

This library provides a `FeatureFlagsService` that reads and writes to the `FeatureFlag` Prisma model:

```prisma
// libs/prisma/gym-db/src/lib/prisma/schema/feature_flags.prisma
model FeatureFlag {
  id          Int      @id @default(autoincrement())
  key         String   @unique
  description String?
  enabled     Boolean  @default(false)
  rollout     Int      @default(100) // 0–100 percentage for gradual rollout
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("feature_flags")
}
```

It uses `TransactionHost<TransactionalAdapterPrisma>` (same as `payments-server`) so all DB access participates in the app’s transactional context.

## Installation / Wiring

1. **Ensure the Prisma model and migrations exist**

   The `FeatureFlag` model is defined in `libs/prisma/gym-db/src/lib/prisma/schema/feature_flags.prisma`. Run migrations if you haven’t:

   ```bash
   pnpm db:gym:migrate
   ```

2. **Make sure `tsconfig.base.json` has the path alias**

   ```jsonc
   {
     "compilerOptions": {
       "paths": {
         // ...
         "@js-monorepo/feature-flags-server": ["libs/feature-flags/server/src/index.ts"],
       },
     },
   }
   ```

3. **Register the service in your NestJS module**

The service is designed to be used in any Nest module that already has `TransactionalAdapterPrusma` via `@nestjs-cls/transactional` (like `gym-api` does):

```ts
// apps/gym-api/src/app/modules/admin/admin.module.ts
import { Module } from '@nestjs/common'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { PrismaModule, PrismaService } from '@js-monorepo/gym-db'

@Module({
  imports: [PrismaModule /* ...other imports... */],
  providers: [
    // transactional plugin is already configured globally in AppModule:
    // new ClsPluginTransactional({ imports: [PrismaModule], adapter: new TransactionalAdapterPrisma({ prismaInjectionToken: PrismaService }) }),
    FeatureFlagsService,
  ],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
```

4. **Inject and use the service**

```ts
import { Controller, Get, Post, Body } from '@nestjs/common'
import { FeatureFlagsService, FeatureFlagKey } from '@js-monorepo/feature-flags-server'

@Controller('admin/feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlags: FeatureFlagsService) {}

  @Get()
  async list() {
    return this.featureFlags.getAllFlags()
  }

  @Post()
  async upsert(@Body() body: { key: FeatureFlagKey; enabled?: boolean; rollout?: number; description?: string }) {
    await this.featureFlags.upsertFlag(body)
    return this.handleGetAll()
  }
}
```

You can also use `isEnabled` anywhere in your services/guards:

```ts
const canSeeNewPricing = await this.featureFlags.isEnabled('pricing.v2', userId)
if (!canSeeNewPricing) {
  // fall back to old behavior
}
```

## API Surface

```ts
export type FeatureFlagKey = string

export interface FeatureFlagConfig {
  key: FeatureFlagKey
  enabled: boolean
  rollout: number
  description?: string | null
}

class FeatureFlagsService {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  // Returns a map { [key]: { key, enabled, rollout, description } }
  getAllFlags(): Promise<Record<FeatureFlagKey, FeatureFlagConfig>>

  // Checks if a flag is effectively enabled for a given user (supports % rollout)
  isEnabled(key: FeatureFlagKey, userId?: number): Promise<boolean>

  // Create or update a flag
  upsertFlag(input: { key: string; enabled?: boolean; rollout?: number; description?: string }): Promise<void>
}
```
