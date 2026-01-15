## `@js-monorepo/gym-db`

Prisma 7 database client and NestJS module for the **gym** application database (`gym-api`).  
Uses the same schema structure as `core-db` plus any gym‑specific models.

### Exports

From `libs/prisma/gym-db/src/index.ts`:

- `PrismaService` – concrete Prisma service for the gym DB
- `PrismaModule` – NestJS module that:
  - configures the Prisma client with `GYM_DATABASE_URL`
  - provides `PrismaService`
  - binds it to the shared `PRISMA_SERVICE` token
- All generated Prisma types from:
  - `./lib/prisma/generated/prisma/client`

### Configuration

`GYM_DATABASE_URL` must point to the **gym DB**:

```bash
# .env
GYM_DATABASE_URL=postgresql://user:password@localhost:5432/gym_db
```

### Usage in `gym-api`

```ts
// apps/gym-api/src/app/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from '@js-monorepo/gym-db'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        databaseUrl: config.getOrThrow('GYM_DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Gym‑Specific Models

Gym‑specific schema files live under:

- `libs/prisma/gym-db/src/lib/prisma/schema/*.prisma`

After changing the schema, run:

```bash
pnpm db:gym:migrate
pnpm db:gym:generate
```

Shared modules (auth, notifications, payments, contact, etc.) continue to use the `PRISMA_SERVICE` token, so they work seamlessly with both `core-db` and `gym-db`.
