# Prisma Database Libraries

This directory contains the database layer for the monorepo using **Prisma 7** with PostgreSQL.

## Architecture Overview

```
libs/prisma/
├── shared/                      # Shared types, tokens, interfaces (NO implementation)
│   └── src/
│       ├── index.ts             # Exports PRISMA_SERVICE, Prisma namespace, BasePrismaService
│       └── lib/
│           ├── prisma.tokens.ts # DI tokens (PRISMA_SERVICE)
│           ├── prisma.types.ts  # Shared types and Prisma error classes
│           └── prisma.module.ts # Shared module utilities
│
├── core-db/                     # Core database (my-api, next-app)
│   ├── prisma.config.ts         # Prisma 7 configuration → DATABASE_URL
│   └── src/
│       ├── index.ts             # Exports PrismaService, PrismaModule, all Prisma types
│       └── lib/
│           ├── db-client.ts     # PrismaService implementation
│           ├── prisma.module.ts # NestJS module (provides PRISMA_SERVICE)
│           └── prisma/
│               ├── schema/      # Multi-file Prisma schema
│               ├── migrations/  # Database migrations
│               └── generated/   # Generated Prisma client
│
├── bibikos-db/                      # Bibikos database (bibikos-api)
│   ├── prisma.config.ts         # Prisma 7 configuration → BIBIKOS_DATABASE_URL
│   └── src/                     # Same structure as core-db
│       └── ...
│
└── run_migrations/              # Docker setup for remote migrations
```

## Key Concepts

### Multi-Database Architecture

Each app can have its own database while sharing common libraries:

```
┌─────────────────────────────────────────────────────────────────┐
│                    @js-monorepo/prisma-shared                   │
│  - PRISMA_SERVICE token (DI injection token)                    │
│  - Prisma namespace (error types, BatchPayload)                 │
│  - BasePrismaService interface                                  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ imports types & tokens
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────┴───────┐                         ┌────────┴────────┐
│  Shared Libs  │                         │   DB Libraries   │
│  - auth/nest  │                         │  - core-db       │
│  - notifications                        │  - bibikos-db        │
│  - contact    │                         │                  │
│  - payments   │                         │  Each provides:  │
│               │                         │  PRISMA_SERVICE  │
│ @Inject(PRISMA_SERVICE)                 │  PrismaService   │
└───────────────┘                         └─────────────────┘
        │                                           │
        └──────────────────┬────────────────────────┘
                           ▼
              ┌────────────────────────┐
              │        Apps            │
              │  my-api → core-db      │
              │  bibikos-api → bibikos-db      │
              └────────────────────────┘
```

### How It Works

1. **Shared libraries** import `PRISMA_SERVICE` token and `Prisma` types from `@js-monorepo/prisma-shared`
2. **Each app** imports `PrismaModule` from its database lib (core-db or bibikos-db)
3. **PrismaModule** registers `PrismaService` AND provides it under `PRISMA_SERVICE` token
4. **At runtime**, NestJS injects the correct PrismaService based on which module is registered

### Import Aliases

| Alias                        | Points To                | Use For                      |
| ---------------------------- | ------------------------ | ---------------------------- |
| `@js-monorepo/prisma-shared` | `libs/prisma/shared`     | Shared libs (tokens, types)  |
| `@js-monorepo/db`            | `libs/prisma/core-db`    | Backward compatibility alias |
| `@js-monorepo/core-db`       | `libs/prisma/core-db`    | my-api, next-app             |
| `@js-monorepo/bibikos-db`    | `libs/prisma/bibikos-db` | bibikos-api                  |

## Usage

### In Shared Libraries

```typescript
// Use PRISMA_SERVICE token for database-agnostic code
import { PRISMA_SERVICE, BasePrismaService, Prisma } from '@js-monorepo/prisma-shared'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class MyRepository {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prisma: BasePrismaService
  ) {}

  async findUser(id: number) {
    return this.prisma.authUser.findUnique({ where: { id } })
  }
}

// Handle Prisma errors
try {
  await this.prisma.authUser.create({ ... })
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      throw new Error('Duplicate entry')
    }
  }
}
```

### In Apps (my-api)

```typescript
// app.module.ts
import { PrismaModule } from '@js-monorepo/core-db' // or @js-monorepo/db

@Module({
  imports: [
    PrismaModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        databaseUrl: config.get('DATABASE_URL'),
      }),
    }),
    // Shared modules automatically receive core-db's PrismaService
    AuthSessionModule,
    NotificationServerModule,
  ],
})
export class AppModule {}
```

### In Apps (bibikos-api)

```typescript
// app.module.ts
import { PrismaModule } from '@js-monorepo/bibikos-db'

@Module({
  imports: [
    PrismaModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        databaseUrl: config.get('BIBIKOS_DATABASE_URL'), // Different DB!
      }),
    }),
    // Shared modules automatically receive bibikos-db's PrismaService
    AuthSessionModule,
    NotificationServerModule,
  ],
})
export class AppModule {}
```

### Importing Types (App-Specific Code)

```typescript
// In bibikos-api specific code, import from bibikos-db
import { PrismaService, AuthUser, Prisma } from '@js-monorepo/bibikos-db'

// In my-api specific code, import from core-db
import { PrismaService, AuthUser, Prisma } from '@js-monorepo/core-db'
```

## Commands

### Core Database (my-api)

```bash
pnpm db:core:generate    # Generate Prisma client
pnpm db:core:create      # Create a new migration
pnpm db:core:migrate     # Run migrations (development)
pnpm db:core:deploy      # Deploy migrations (production)
pnpm db:core:studio      # Open Prisma Studio
```

### Gym Database (bibikos-api)

```bash
pnpm db:bibikos:generate     # Generate Prisma client
pnpm db:bibikos:create       # Create a new migration
pnpm db:bibikos:migrate      # Run migrations (development)
pnpm db:bibikos:deploy       # Deploy migrations (production)
pnpm db:bibikos:studio       # Open Prisma Studio
```

## Environment Variables

Add to your **root `.env`** file:

```bash
# Core database (my-api, next-app)
DATABASE_URL=postgresql://user:password@localhost:5432/core_db

# Gym database (bibikos-api)
BIBIKOS_DATABASE_URL=postgresql://user:password@localhost:5432/bibikos_db
```

## Adding a New Database

To add a new database for another app:

1. **Copy the structure:**

   ```bash
   cp -r libs/prisma/core-db libs/prisma/new-db
   ```

2. **Update configurations:**

   - `project.json` - change name to `new-db`
   - `jest.config.ts` - change displayName and coverageDirectory
   - `prisma.config.ts` - change to use `NEW_DATABASE_URL`

3. **Clear migrations (start fresh):**

   ```bash
   rm -rf libs/prisma/new-db/src/lib/prisma/migrations/*
   ```

4. **Add path alias** in `tsconfig.base.json`:

   ```json
   "@js-monorepo/new-db": ["libs/prisma/new-db/src/index.ts"]
   ```

5. **Add scripts** in `package.json`:

   ```json
   "db:new:migrate": "prisma migrate dev --config=libs/prisma/new-db/prisma.config.ts",
   "db:new:generate": "prisma generate --config=libs/prisma/new-db/prisma.config.ts"
   ```

6. **Generate the client:**
   ```bash
   pnpm db:new:generate
   ```

## Schema Structure

Each database has a multi-file schema in `src/lib/prisma/schema/`:

| File                        | Models                                          |
| --------------------------- | ----------------------------------------------- |
| `schema.prisma`             | Generator, datasource config                    |
| `auth.prisma`               | AuthUser, UserProfile, Provider, Role, UserRole |
| `payments.prisma`           | PaymentCustomer, Subscription, Product, Price   |
| `user_notifications.prisma` | Notification, UserNotification                  |
| `contact.prisma`            | ContactMessage                                  |

### Extending a Schema

To add bibikos-specific models, create a new file in bibikos-db:

```prisma
// libs/prisma/bibikos-db/src/lib/prisma/schema/bibikos.prisma

model GymMember {
  id        Int      @id @default(autoincrement())
  userId    Int
  authUser  AuthUser @relation(fields: [userId], references: [id])
  membershipType String
  // ... bibikos-specific fields
}
```

Then run:

```bash
pnpm db:bibikos:migrate
pnpm db:bibikos:generate
```

## Driver Adapter (Prisma 7)

Prisma 7 uses **driver adapters** instead of the built-in Rust query engine:

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const client = new PrismaClient({ adapter })
```

**Benefits:**

- Faster startup (no Rust binary)
- Smaller bundle size
- Direct database driver control
- Better connection pool management

## Remote Migrations (Docker)

For running migrations on remote servers:

```bash
cd libs/prisma/run_migrations
cp .env.example .env  # Configure with remote credentials
docker compose up --build
```

## Troubleshooting

### "Cannot find module '@js-monorepo/prisma-shared'"

Run `pnpm install` or restart your TypeScript server.

### "PRISMA_SERVICE not found"

Ensure your app module imports `PrismaModule.forRootAsync()` from the correct db library.

### Schema changes not reflected

```bash
pnpm db:core:generate  # or db:bibikos:generate
```

### Type mismatches between databases

Both databases must have identical schemas for shared models (AuthUser, etc.). If you modify a shared model, update it in ALL database schemas.
