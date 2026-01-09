# Prisma Database Library

This library provides the database layer for the monorepo using **Prisma 7** with PostgreSQL.

## Architecture

```
libs/prisma/
├── db/                          # Main Prisma library
│   ├── prisma.config.ts         # Prisma 7 configuration
│   └── src/
│       ├── index.ts             # Exports PrismaService, PrismaModule, and all Prisma types
│       └── lib/
│           ├── db-client.ts     # PrismaService (NestJS injectable)
│           ├── prisma.module.ts # NestJS module configuration
│           └── prisma/
│               ├── schema/      # Multi-file Prisma schema
│               ├── migrations/  # Database migrations
│               └── generated/   # Generated Prisma client (gitignored)
└── run_migrations/              # Docker setup for remote migrations
```

## Key Concepts

### Driver Adapter (Prisma 7)

Prisma 7 uses **driver adapters** instead of the built-in Rust query engine. This provides:

- Faster startup (no Rust binary)
- Smaller bundle size
- Direct database driver control

```typescript
// db-client.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: options.databaseUrl })
const adapter = new PrismaPg(pool)

super({ adapter, ... })
```

### Connection Pool

The `pg.Pool` manages database connections:

- **Automatic connection pooling** - reuses connections efficiently
- **Configurable pool size** - defaults to 10 connections
- **Connection timeout handling** - prevents hanging queries

The pool is created once when `PrismaService` is instantiated and closed on application shutdown.

### PrismaService

A NestJS injectable service that extends `PrismaClient`:

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  // Auto-connects on module init with retry logic
  async onModuleInit() { ... }

  // Cleanly disconnects on shutdown
  async onApplicationShutdown() {
    await this.$disconnect()
    await this.pool.end()
  }
}
```

**Features:**

- Automatic connection with 10 retries (10s delay between)
- Query logging when `SHOW_SQL=true`
- Event-based error logging

### PrismaModule

Register in your NestJS app:

```typescript
// Async configuration (recommended)
PrismaModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    databaseUrl: config.get('DATABASE_URL'),
  }),
  inject: [ConfigService],
})
```

## Commands

```bash
# Generate Prisma client (required after schema changes)
pnpm db:generate

# Create a new migration
pnpm db:create

# Run migrations (development)
pnpm db:migrate

# Deploy migrations (production)
pnpm db:deploy

# Open Prisma Studio (database GUI)
pnpm db:studio
```

## Configuration

Configuration is in `libs/prisma/db/prisma.config.ts`:

```typescript
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './src/lib/prisma/schema',
  migrations: {
    path: './src/lib/prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
```

## Environment Variables

Only one variable needed in root `.env`:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Importing Types

All Prisma types are re-exported from `@js-monorepo/db`:

```typescript
import { PrismaService, AuthUser, Prisma } from '@js-monorepo/db'

// Use in services
constructor(private prisma: PrismaService) {}

// Type your data
const user: AuthUser = await this.prisma.authUser.findUnique(...)

// Use Prisma namespace for advanced types
const where: Prisma.AuthUserWhereInput = { email: 'test@example.com' }
```

## Remote Migrations (Docker)

For running migrations on remote servers:

```bash
cd libs/prisma/run_migrations

# Configure .env with remote database credentials
cp .env.example .env

# Run migrations
docker compose up --build
```

The Docker setup:

1. Waits for PostgreSQL to be ready
2. Runs `prisma migrate deploy`
3. Exits after completion

## Schema Structure

Multi-file schema in `db/src/lib/prisma/schema/`:

| File              | Models                                                |
| ----------------- | ----------------------------------------------------- |
| `schema.prisma`   | Generator, datasource, Notification, UserNotification |
| `auth.prisma`     | AuthUser, UserProfile, Provider, Role, UserRole       |
| `payments.prisma` | PaymentCustomer, Subscription, Product, Price         |
| `contact.prisma`  | ContactMessage                                        |
