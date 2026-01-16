## `@js-monorepo/core-db`

Prisma 7 database client and NestJS module for the **core** application database (`my-api`, `next-app`).  
Uses the shared `@js-monorepo/prisma-shared` utilities for DI and error handling.

### Exports

From `libs/prisma/core-db/src/index.ts`:

- `PrismaService` – concrete Prisma service for the core DB
- `PrismaModule` – NestJS module that:
  - configures the Prisma client (driver adapter)
  - provides `PrismaService`
  - binds it to the shared `PRISMA_SERVICE` token
- All generated Prisma types from:
  - `./lib/prisma/generated/prisma/client`

### Configuration

`DATABASE_URL` must point to the **core DB**:

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/core_db
```

### Usage in NestJS App

```ts
// apps/my-api/src/app/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from '@js-monorepo/core-db'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        databaseUrl: config.getOrThrow('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Using PrismaService Directly

```ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@js-monorepo/core-db'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.authUser.findUnique({ where: { id } })
  }
}
```

Shared libs should **not** import `PrismaService` directly; instead they use the `PRISMA_SERVICE` token from `@js-monorepo/prisma-shared` so they can also work with `@js-monorepo/bibikos-db`.
