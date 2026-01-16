## `@js-monorepo/bibikos-db`

Prisma 7 database client and NestJS module for the **bibikos** application database (`bibikos-api`).  
Uses the same schema structure as `core-db` plus any bibikos‑specific models.

### Exports

From `libs/prisma/bibikos-db/src/index.ts`:

- `PrismaService` – concrete Prisma service for the bibikos DB
- `PrismaModule` – NestJS module that:
  - configures the Prisma client with `BIBIKOS_DATABASE_URL`
  - provides `PrismaService`
  - binds it to the shared `PRISMA_SERVICE` token
- All generated Prisma types from:
  - `./lib/prisma/generated/prisma/client`

### Configuration

`BIBIKOS_DATABASE_URL` must point to the **bibikos DB**:

```bash
# .env
BIBIKOS_DATABASE_URL=postgresql://user:password@localhost:5432/bibikos_db
```

### Usage in `bibikos-api`

```ts
// apps/bibikos-api/src/app/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from '@js-monorepo/bibikos-db'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        databaseUrl: config.getOrThrow('BIBIKOS_DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Bibikos‑Specific Models

Bibikos‑specific schema files live under:

- `libs/prisma/bibikos-db/src/lib/prisma/schema/*.prisma`

After changing the schema, run:

```bash
pnpm db:bibikos:migrate
pnpm db:bibikos:generate
```

Shared modules (auth, notifications, payments, contact, etc.) continue to use the `PRISMA_SERVICE` token, so they work seamlessly with both `core-db` and `bibikos-db`.
