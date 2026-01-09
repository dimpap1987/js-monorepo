# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NX monorepo with Next.js 14 frontend (`apps/next-app`), NestJS backend (`apps/my-api`), and shared libraries (`libs/`). Uses pnpm as package manager.

## Common Commands

```bash
# Development
pnpm dev:next              # Start Next.js dev server
pnpm dev:my-api            # Start NestJS dev server

# Building
pnpm build:next            # Build Next.js (production)
pnpm build:my-api          # Build NestJS (production)

# Code Quality
pnpm lint                  # Lint affected files
pnpm lint:all              # Lint all files
pnpm format                # Format with Prettier
pnpm format:check          # Check formatting
pnpm test                  # Test affected
pnpm test:all              # Test all

# Run single test file
npx nx test <project> --testFile=<filename>

# Database (Prisma) - Core DB (my-api, shared libs)
pnpm db:core:migrate       # Run migrations
pnpm db:core:deploy        # Deploy migrations to production
pnpm db:core:create        # Create new migration
pnpm db:core:generate      # Generate Prisma client
pnpm db:core:studio        # Open Prisma Studio

# Database (Prisma) - Gym DB (gym-api)
pnpm db:gym:migrate        # Run migrations
pnpm db:gym:deploy         # Deploy migrations to production
pnpm db:gym:create         # Create new migration
pnpm db:gym:generate       # Generate Prisma client
pnpm db:gym:studio         # Open Prisma Studio

# Environment
pnpm sync:env              # Sync root .env to app .env files (run after changing root .env)

# Full CI locally
pnpm ci:local              # Format check, lint, test, build
```

## Architecture

### Directory Structure

- `apps/my-api/` - NestJS backend API (uses core-db)
- `apps/gym-api/` - NestJS gym API (uses gym-db)
- `apps/next-app/` - Next.js 14 frontend (App Router)
- `libs/auth/` - Authentication (separate nest/next implementations)
- `libs/prisma/shared/` - Shared Prisma types, tokens (PRISMA_SERVICE), and interfaces
- `libs/prisma/core-db/` - Core Prisma schema (my-api) - uses DATABASE_URL
- `libs/prisma/gym-db/` - Gym Prisma schema (gym-api) - uses GYM_DATABASE_URL
- `libs/shared/ui/` - 23+ shadcn-based UI component libraries
- `libs/shared/types/` - Shared TypeScript types
- `libs/shared/schemas/` - Zod validation schemas
- `libs/payments/` - Stripe payment integration (server/client)
- `libs/notifications/` - Notification system (server/client)
- `libs/websockets/` - WebSocket utilities (user-presence)
- `deployments/` - Docker Compose configurations

### Key Entry Points

- Backend (my-api): `apps/my-api/src/main.ts`
- Backend (gym-api): `apps/gym-api/src/main.ts`
- Frontend: `apps/next-app/app/layout.tsx`
- Core Prisma schema: `libs/prisma/core-db/src/lib/prisma/schema/`
- Gym Prisma schema: `libs/prisma/gym-db/src/lib/prisma/schema/`

### Import Aliases

All shared code uses `@js-monorepo/*` path aliases (defined in `tsconfig.base.json`):

- `@js-monorepo/prisma-shared` - Shared Prisma types, DI tokens (PRISMA_SERVICE)
- `@js-monorepo/gym-db` - Core Prisma client (alias to core-db)
- `@js-monorepo/core-db` - Core Prisma client (my-api)
- `@js-monorepo/gym-db` - Gym Prisma client (gym-api)
- `@js-monorepo/types` - Shared types
- `@js-monorepo/ui/*` - UI components
- `@js-monorepo/auth/*` - Auth libraries

## Authentication

**Session-based auth (NOT JWT)** with Redis-backed sessions:

- Cookie: `JSESSIONID`
- OAuth: Google, GitHub via Passport
- Roles: `USER`, `ADMIN`
- Guards: `LoggedInGuard`, `RolesGuard`, `WsLoginGuard`, `WsRolesGuard`

## Tech Stack Highlights

### Frontend (Next.js 14)

- App Router (not Pages Router)
- Server Components by default, `'use client'` only when needed
- React Query for server state, Zustand for client state
- Tailwind CSS with shadcn/ui components

### Backend (NestJS)

- Dependency injection with feature-based modules
- Prisma ORM with PostgreSQL
- Socket.IO with Redis adapter for WebSockets
- Stripe for payments, Winston for logging

## Environment Variables

Centralized in root `.env` with variable interpolation. Base variables (`HOSTNAME`, `*_PORT`) auto-construct URLs:

```bash
HOSTNAME=localhost           # Change for different environments
DATABASE_URL=${...}          # Core database (my-api, shared libs)
GYM_DATABASE_URL=${...}      # Gym database (gym-api)
```

**Always run `pnpm sync:env` after modifying root `.env`**

## Code Conventions

- Use Zod schemas from `libs/shared/schemas/` for validation
- Place reusable code in appropriate `libs/` directory
- Follow existing patterns in the codebase (Repository pattern, DI, etc.)

#### Architecture & Design

- **SOLID Principles**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY**: Don't Repeat Yourself - extract common patterns
- **Separation of Concerns**: Clear boundaries between layers (UI, business logic, data access)
- **Design Patterns**: Use appropriate patterns (Repository, Factory, Strategy, Observer, etc.)
- **API Design**: RESTful conventions, proper HTTP methods, meaningful status codes
- **Error Handling**: Consistent error responses, proper error types

### Code Review Standards

**Always consider:**

- Is this the most maintainable solution?
- Is this performant and scalable?
- Are edge cases handled?
- Is error handling comprehensive?
- Is the code testable?
- Is it accessible and user-friendly?
- Does it follow established patterns in the codebase?
- Is documentation/comments needed for complex logic?

### Anti-Patterns to Avoid

- ❌ Magic numbers/strings (use constants/enums)
- ❌ Deeply nested conditionals (use early returns, guard clauses)
- ❌ God objects/functions (break into smaller, focused pieces)
- ❌ Premature optimization (optimize when needed, measure first)
- ❌ Over-engineering (keep it simple, but not simpler)
- ❌ Ignoring TypeScript errors (fix or properly type)
- ❌ Side effects in render functions
- ❌ Mutating props or state directly
- ❌ Missing error handling
- ❌ Hardcoded values (use configuration)

### Design Principles

- **User Experience**: Prioritize user needs, intuitive interfaces, clear feedback
- **Performance**: Optimize for speed, minimize bundle size, lazy load when appropriate
- **Accessibility**: Ensure all users can access and use the application
- **Responsive Design**: Mobile-first approach, test on multiple screen sizes
- **Consistency**: Follow design system patterns, consistent spacing, typography, colors
- **Maintainability**: Code should be easy to understand and modify by other developers

**CRITICAL: Only senior-level code and best practices are acceptable.**
