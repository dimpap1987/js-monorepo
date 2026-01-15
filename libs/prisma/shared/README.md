## `@js-monorepo/prisma-shared`

Shared Prisma 7 utilities used by all database libraries (`core-db`, `gym-db`, and any future DBs).  
It provides DI tokens, a common `AbstractPrismaService` base class, module factory helpers, and shared Prisma types/errors.

### Exports

- **Tokens**
  - `PRISMA_SERVICE`, `PRISMA_MODULE_OPTIONS`
- **Base service**
  - `AbstractPrismaService`, `PrismaClientBase`, `PrismaServiceConfig`
- **Module factory**
  - `createPrismaModule`, `PrismaSharedModule`, `PrismaModuleOptions`, `PrismaModuleAsyncOptions`, `PrismaModuleClass`
- **Types / errors**
  - `Prisma`, `PrismaNamespace`, `BasePrismaService`, `BatchPayload`
  - `PrismaClientKnownRequestError`, `PrismaClientUnknownRequestError`, `PrismaClientRustPanicError`, `PrismaClientInitializationError`, `PrismaClientValidationError`

### When to Use This Library

- **Shared NestJS modules** (auth, notifications, payments, contact, etc.) that should be **database‑agnostic**
- Code that needs **Prisma types** or **error classes** but must not depend on a specific DB (`core-db` vs `gym-db`)
- Creating a **new Prisma DB library** with the same patterns as `core-db` / `gym-db`

### Basic Usage (Shared Module)

```ts
// libs/your-shared-lib/src/lib/your.repository.ts
import { Inject, Injectable } from '@nestjs/common'
import {
  PRISMA_SERVICE,
  BasePrismaService,
  Prisma,
} from '@js-monorepo/prisma-shared'

@Injectable()
export class YourRepository {
  constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: BasePrismaService,
  ) {}

  async findUserById(id: number) {
    return this.prisma.authUser.findUnique({ where: { id } })
  }

  async createUser(data: Prisma.AuthUserCreateInput) {
    try {
      return await this.prisma.authUser.create({ data })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Handle unique constraint violation
      }
      throw error
    }
  }
}
```

The **app** decides which concrete Prisma service to inject by importing the correct DB module:

- `@js-monorepo/core-db` for `my-api` / `next-app`
- `@js-monorepo/gym-db` for `gym-api`

### Creating a New Prisma DB Library

When you create a new DB library, you extend the pieces from `@js-monorepo/prisma-shared`:

1. Use `AbstractPrismaService` as the base Prisma service
2. Use `createPrismaModule` to build the DB module that:
   - wires up the Prisma 7 driver adapter
   - exposes `PRISMA_SERVICE` so shared libs stay database‑agnostic

See `libs/prisma/core-db` and `libs/prisma/gym-db` for full examples.

