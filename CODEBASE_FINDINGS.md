# Codebase Structure Findings

**Generated:** $(date)
**Scope:** `apps/my-api`, `apps/next-app`, and `libs/` directory

---

## Table of Contents
1. [Monorepo Overview](#monorepo-overview)
2. [Apps Structure](#apps-structure)
3. [Libraries Structure](#libraries-structure)
4. [Key Technologies & Dependencies](#key-technologies--dependencies)
5. [Architecture Patterns](#architecture-patterns)
6. [Authentication & Authorization](#authentication--authorization)
7. [Data Flow & Communication](#data-flow--communication)
8. [Key Files & Entry Points](#key-files--entry-points)

---

## Monorepo Overview

### Technology Stack
- **Monorepo Tool:** Nx (v19.5.7)
- **Backend Framework:** NestJS (v10.0.2)
- **Frontend Framework:** Next.js (v14.2.3)
- **Database:** Prisma ORM (v5.18.0)
- **Language:** TypeScript (v5.5.4)
- **Package Manager:** npm

### Project Structure
```
js-monorepo/
├── apps/
│   ├── my-api/          # NestJS backend API
│   ├── next-app/        # Next.js frontend application
│   ├── docs/            # Documentation app
│   ├── tranquil-studio/ # Another Next.js app
│   └── webhook-server/  # Webhook server
├── libs/                # Shared libraries
└── deployments/         # Deployment configs
```

---

## Apps Structure

### 1. `apps/my-api` - NestJS Backend API

#### Overview
- **Type:** NestJS Application
- **Port:** 3333 (default)
- **Global Prefix:** `/api`
- **Build Tool:** Webpack
- **Entry Point:** `src/main.ts`

#### Architecture
- **Module-based architecture** following NestJS conventions
- **Dependency Injection** throughout
- **Middleware chain:** Session → Passport → Logger → AuthSession
- **WebSocket support** via Socket.IO with Redis adapter

#### Key Modules

**AppModule** (`src/app/app.module.ts`)
- Main application module
- Configures global modules:
  - `ConfigModule` - Environment configuration
  - `ClsModule` - Context management with transactional support
  - `PrismaModule` - Database access
  - `RedisModule` - Redis client
  - `AuthSessionModule` - Authentication & session management
  - `UserPresenceModule` - WebSocket user presence
  - `NotificationServerModule` - Notification system
  - `PaymentsModule` - Stripe payment integration
  - `CacheModule` - Redis-based caching

**Business Modules:**
- `UserModule` - User management (Global module)
- `AdminModule` - Admin operations
- `HealthModule` - Health checks

#### Controllers
- `AppController` - Root controller
- `ExceptionController` - Exception handling
- `AnnouncementsController` - Admin-only announcements
- `UserController` - User profile updates
- `AdminController` - Admin operations (users, roles, online users)

#### Middleware Stack
1. **Session Middleware** - Express session with Redis store
2. **Passport Middleware** - Authentication initialization
3. **LoggerMiddleware** - HTTP request logging
4. **AuthSessionMiddleware** - Session validation (excludes: health, payments/webhook)

#### Key Features
- **CSRF Protection** - Enabled with exclusions
- **CORS** - Configurable origins
- **Helmet** - Security headers
- **Graceful Shutdown** - Handles SIGTERM/SIGINT
- **OpenTelemetry** - Observability (`src/otel.ts`)
- **Validation** - Global ValidationPipe with class-validator
- **Transactions** - Prisma transactions via CLS

#### Repository Pattern
- Uses interface-based repositories (`UserRepo`, `AdminRepo`)
- Prisma implementations (`UserRepositoryPrisma`, `AdminRepositoryPrisma`)

---

### 2. `apps/next-app` - Next.js Frontend Application

#### Overview
- **Type:** Next.js 14 App Router Application
- **Port:** 3000
- **Framework:** React 18.3.1
- **Styling:** Tailwind CSS

#### Architecture
- **App Router** (Next.js 14)
- **Server Components** by default
- **Client Components** marked with `'use client'`
- **Server Actions** for mutations (`actions/`)

#### Route Structure

**Public Routes:**
- `/` - Landing page
- `/pricing` - Pricing page
- `/privacy-cookie-statement` - Privacy policy
- `/terms-of-use` - Terms of service
- `/feedback` - Feedback page
- `/api/checkout_sessions` - Stripe checkout

**Protected Routes (USER/ADMIN):**
- `/notifications` - User notifications
- `/settings` - User settings
- `/ai-image-generator` - AI image generation (commented out)

**Admin Routes:**
- `/dashboard` - Admin dashboard
  - `/dashboard/users` - User management
  - `/dashboard/announcements` - Announcement management
  - `/dashboard/notifications` - Notification management
  - `/dashboard/online-users` - Online users monitoring

**Auth Routes:**
- `/auth/login` - Login page (parallel route)
- `/auth/onboarding` - Registration/onboarding (parallel route)

#### Middleware (`middleware.ts`)
Composed middleware chain:
1. `withPathName` - Path name tracking
2. `withAuth` - Authentication & authorization
3. `withCSP` - Content Security Policy

**Auth Middleware Logic:**
- Checks session via `getCurrentUser()` server action
- Redirects unauthenticated users to `/auth/login`
- Role-based access control
- Public route detection
- Auth route handling (redirect if logged in)

#### Key Components

**Layout Components:**
- `app/layout.tsx` - Root layout with parallel routes
- `app/(main)/layout.tsx` - Main layout
- `app/dashboard/layout.tsx` - Dashboard layout with sidebar

**Provider Components:**
- `components/root.providers.tsx` - Global providers:
  - `SessionProvider` - Auth session context
  - `WebSocketProvider` - WebSocket connection
  - `ThemeProvider` - Dark/light theme
  - `DpLoaderProvider` - Loading states
  - `DpNotificationProvider` - Notification UI
  - `WebNotificationProvider` - Browser notifications
  - `QClientProvider` - React Query client

**Template Components:**
- `components/main.template.tsx` - Main UI template with navbar
- `components/landing.component.tsx` - Landing page
- `components/mobile-navbar.tsx` - Mobile navigation

#### Server Actions (`actions/`)
- `session.ts` - `getCurrentUser()` - Fetches current session
- `predict.ts` - AI image generation via Replicate API
- `submit-error.ts` - Error reporting

#### State Management
- **React Query** (`@tanstack/react-query`) - Server state
- **Zustand** - Client state (notifications, websocket)
- **Context API** - Session, theme, loader

#### WebSocket Integration
- Custom hook: `hooks/useWebsocketConfig.ts`
- WebSocket config: `utils/websocket.config.ts`
- Connects to `my-api` WebSocket server
- Handles user presence, notifications, announcements

---

## Libraries Structure

### Core Libraries (`libs/`)

#### 1. `libs/auth/` - Authentication Libraries

**`libs/auth/nest/`** - NestJS Auth Module
- **Session Management:**
  - `AuthSessionModule` - Main auth module
  - `AuthSessionMiddleware` - Session validation
  - `AuthSessionController` - Auth endpoints (login, logout, callback)
  - `SessionService` - Session operations
  - `SessionSerializer` - Passport session serialization

- **Guards:**
  - `LoggedInGuard` - Requires authentication
  - `RolesGuard` - Role-based access control
  - `LoginGuard` - Login route guard
  - `GoogleGuard` - Google OAuth guard
  - `GithubGuard` - GitHub OAuth guard
  - `WsLoginGuard` - WebSocket auth guard
  - `WsRolesGuard` - WebSocket role guard

- **Strategies:**
  - `GoogleStrategy` - Google OAuth2
  - `GithubStrategy` - GitHub OAuth

- **Common:**
  - `HasRoles` decorator - Role requirement decorator
  - Repositories (Auth, Role, UserProfile, UnregisteredUser)
  - Services (Auth, Role, UserProfile, UnregisteredUser)
  - Exceptions & filters
  - CSRF middleware
  - Utils (cookie options, capitalization, etc.)

**`libs/auth/next/`** - Next.js Auth Client/Server
- **Client:**
  - `SessionProvider` - React context for session
  - `useSession` hook - Session access hook
  - `authClient` - Client-side auth utilities

- **Server:**
  - `getCurrentSession` - Server-side session fetch

---

#### 2. `libs/nest-utils/` - NestJS Utilities

**Modules:**
- `RedisModule` - Redis client module
- `RedisEventPubSubModule` - Redis pub/sub for events

**Utilities:**
- **Logger:** `LoggerService` - Winston-based logger with CLS context
- **Exceptions:** `ApiException` - Custom exception class
- **Pipes:** `ZodPipe` - Zod validation pipe
- **Decorators:**
  - `@MeasurePerformance` - Performance measurement
  - `@Retry` - Retry logic
  - `@Catch` - Error catching

**Redis Event System:**
- Event emitter interface
- Event subscriber interface
- Redis-based pub/sub implementation

---

#### 3. `libs/prisma/db/` - Database Layer

**Exports:**
- `PrismaService` - Prisma client service
- `PrismaModule` - NestJS module

**Location:** `libs/prisma/db/src/lib/prisma/schema.prisma`

**Migration Management:**
- `libs/prisma/run_migrations/` - Migration runner
- Scripts in `package.json`:
  - `db:migrate` - Run migrations
  - `db:deploy` - Deploy migrations
  - `db:generate` - Generate Prisma client
  - `db:studio` - Prisma Studio

---

#### 4. `libs/notifications/` - Notification System

**`libs/notifications/server/`** - Server-side
- `NotificationServerModule` - NestJS module
- `NotificationService` - Notification CRUD
- Events: `notifications` - WebSocket event name
- Prisma schema for notifications

**`libs/notifications/client/`** - Client-side
- React components for notifications
- WebSocket integration
- Notification store (Zustand)
- Hooks: `useNotificationWebSocket`, `useNotificationStore`

---

#### 5. `libs/payments/` - Payment Integration (Stripe)

**`libs/payments/server/`** - Server-side
- `PaymentsModule` - NestJS module
- `PaymentsService` - Payment operations
- `StripeService` - Stripe API wrapper
- `SubscriptionGuard` - Subscription requirement guard
- `@HasProduct` decorator - Product requirement decorator
- `rawBodyMiddleware` - Stripe webhook signature verification
- Callbacks:
  - `onSubscriptionCreateSuccess`
  - `onSubscriptionEvent`
  - `onSubscriptionDeleteSuccess`

**`libs/payments/client/`** - Client-side
- Stripe React components
- Checkout session handling

---

#### 6. `libs/websockets/user-presence/` - WebSocket User Presence

**Exports:**
- `UserPresenceModule` - NestJS module
- `UserPresenceWebsocketService` - WebSocket service
- `OnlineUsersService` - Online users management
- `UserSocketService` - Socket connection management
- `RedisIoAdapter` - Redis adapter for Socket.IO
- Guards: `WsLoginGuard`, `WsRolesGuard`
- Events: `announcements`, `refreshSession`, `notifications`
- Rooms: `admin`, `user`

**Features:**
- Real-time user presence tracking
- Room-based messaging
- User-to-user messaging
- Broadcast messaging
- Disconnect handling

---

#### 7. `libs/next/` - Next.js Utilities

**Providers:**
- `QClientProvider` - React Query provider
- `WebSocketProvider` - WebSocket provider

**Hooks:**
- Various React hooks for Next.js patterns

**Middlewares:**
- `compose` - Middleware composition utility
- `withCSP` - Content Security Policy middleware
- `withPathName` - Path name tracking middleware

---

#### 8. `libs/shared/` - Shared Utilities & UI

**`libs/shared/types/`**
- Shared TypeScript types
- DTOs: `AuthUserDto`, `AuthUserFullDto`, `EditUserDto`, etc.
- Enums: `RolesEnum`, `PaginationType`, etc.

**`libs/shared/schemas/`**
- Zod schemas for validation
- `EditUserSchema`, `UserUpdateUserSchema`, etc.

**`libs/shared/utils/`**
- Utility functions
- HTTP utilities (`getIPAddress`)

**`libs/shared/styles/`**
- Global styles
- CSS utilities

**`libs/shared/ui/`** - UI Component Library
Comprehensive component library with 20+ packages:

**Layout Components:**
- `templates` - Page templates (Body, Container, Admin, DynamicHeight)
- `navbar` - Navigation bar
- `sidebar` - Sidebar navigation
- `bottom-navbar` - Mobile bottom navigation

**Form Components:**
- `button` - Button variants (Login, Logout, etc.)
- `dialog` - Dialog modals (Login, Register, Error, Confirmation, Donation)
- `form` - Form components
- `select` - Select dropdowns
- `textarea` - Text areas
- `multiselect` - Multi-select component

**Display Components:**
- `components` - Base components (Accordion, Avatar, Badge, Card, Carousel, Dropdown, Label, Scroll, Separator, Skeleton, Table, Tabs, Tooltip)
- `loader` - Loading spinners and states
- `error` - Error display components
- `notification` - Notification UI
- `markdown` - Markdown renderer
- `pagination` - Pagination component

**Feature Components:**
- `announcements` - Announcement display
- `ai-image-generator` - AI image generation UI
- `map` - Map component (Leaflet)
- `payment` - Payment UI (Stripe)
- `web-notification` - Browser notification provider
- `page-progress-bar` - Page loading progress bar
- `version` - Version display

**Utilities:**
- `utils` - UI utility functions
- `theme-provider` - Dark/light theme provider
- `nav-link` - Navigation link component
- `back-arrow` - Back navigation component

---

## Key Technologies & Dependencies

### Backend (my-api)
- **NestJS** - Framework
- **Prisma** - ORM
- **Redis** - Caching & sessions
- **Socket.IO** - WebSockets
- **Passport** - Authentication
- **Express Session** - Session management
- **Helmet** - Security headers
- **Winston** - Logging
- **OpenTelemetry** - Observability
- **Stripe** - Payments
- **class-validator** - Validation
- **nestjs-cls** - Context management
- **@nestjs-cls/transactional** - Database transactions

### Frontend (next-app)
- **Next.js 14** - Framework (App Router)
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **React Query** - Server state
- **Zustand** - Client state
- **Socket.IO Client** - WebSocket client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Radix UI** - UI primitives
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **next-themes** - Theme management
- **Replicate** - AI image generation

### Shared
- **TypeScript** - Language
- **Zod** - Runtime validation
- **Prisma Client** - Database client

---

## Architecture Patterns

### 1. Repository Pattern
- Interface-based repositories (`UserRepo`, `AdminRepo`)
- Prisma implementations
- Dependency injection via NestJS

### 2. Module Pattern
- Feature-based modules
- Global modules for shared services
- Lazy-loaded modules where appropriate

### 3. Middleware Chain
- Composable middleware functions
- Next.js middleware composition
- NestJS middleware consumer pattern

### 4. Provider Pattern
- React Context providers
- NestJS dependency injection
- Service providers

### 5. Event-Driven Architecture
- Redis pub/sub for events
- WebSocket events for real-time updates
- Callback hooks in modules

### 6. Transaction Management
- CLS-based transactions
- Prisma transactional adapter
- Decorator-based transactions (`@Transactional`)

---

## Authentication & Authorization

### Backend (my-api)

**Session-Based Auth:**
- Express session with Redis store
- Session cookie: `JSESSIONID`
- Session expiration: 24 hours (rolling)
- CSRF protection enabled

**OAuth Providers:**
- Google OAuth2
- GitHub OAuth

**Guards:**
- `LoggedInGuard` - Requires authentication
- `RolesGuard` - Role-based access
- `WsLoginGuard` - WebSocket authentication
- `WsRolesGuard` - WebSocket role check

**Roles:**
- `USER` - Standard user
- `ADMIN` - Administrator

**Session Management:**
- Redis-backed sessions
- Session invalidation on user update
- Cache invalidation for user data

### Frontend (next-app)

**Session Management:**
- Server-side session fetch (`getCurrentUser()`)
- Client-side session context (`SessionProvider`)
- Session refresh via WebSocket events

**Route Protection:**
- Middleware-based protection
- Role-based access control
- Public/private route configuration

**Auth Flow:**
1. User visits protected route
2. Middleware checks session
3. Redirects to `/auth/login` if not authenticated
4. OAuth login redirects to backend
5. Backend creates session
6. Frontend receives session via context

---

## Data Flow & Communication

### API Communication
- **REST API:** `my-api` exposes REST endpoints
- **Base URL:** `/api` prefix
- **CORS:** Configured for frontend origin
- **Credentials:** Cookies with credentials

### WebSocket Communication
- **Server:** Socket.IO with Redis adapter
- **Client:** Socket.IO client
- **Events:**
  - `announcements` - Broadcast announcements
  - `notifications` - User notifications
  - `refreshSession` - Session refresh trigger
- **Rooms:**
  - `admin` - Admin-only room
  - `user` - User room

### State Synchronization
- **Server State:** React Query
- **Client State:** Zustand
- **Real-time:** WebSocket events
- **Cache Invalidation:** Manual + WebSocket triggers

### Database Access
- **ORM:** Prisma
- **Connection:** Prisma Client via `PrismaService`
- **Transactions:** CLS-based transactions
- **Migrations:** Prisma Migrate

---

## Key Files & Entry Points

### Backend (my-api)

**Entry Points:**
- `src/main.ts` - Application bootstrap
- `src/otel.ts` - OpenTelemetry setup
- `src/app/app.module.ts` - Root module

**Key Files:**
- `src/app/modules/user/` - User module
- `src/app/modules/admin/` - Admin module
- `src/app/modules/health/` - Health checks
- `src/app/controllers/` - API controllers
- `src/middlewares/logger.middleware.ts` - Request logging

**Configuration:**
- `webpack.config.js` - Webpack configuration
- `project.json` - Nx project configuration
- `tsconfig.json` - TypeScript configuration

### Frontend (next-app)

**Entry Points:**
- `app/layout.tsx` - Root layout
- `middleware.ts` - Next.js middleware
- `app/page.tsx` - Landing page

**Key Files:**
- `app/(main)/` - Main application routes
- `app/dashboard/` - Admin dashboard routes
- `app/@auth/` - Auth parallel routes
- `components/root.providers.tsx` - Global providers
- `components/main.template.tsx` - Main UI template
- `app/middlewares/withAuth.ts` - Auth middleware
- `app/middlewares/routes.ts` - Route configuration
- `actions/session.ts` - Session server action

**Configuration:**
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind configuration
- `project.json` - Nx project configuration

### Libraries

**Key Library Entry Points:**
- `libs/auth/nest/session/index.ts` - NestJS auth
- `libs/auth/next/lib/client/index.ts` - Next.js auth client
- `libs/auth/next/lib/server/index.ts` - Next.js auth server
- `libs/prisma/db/src/index.ts` - Prisma module
- `libs/notifications/server/src/index.ts` - Notifications server
- `libs/notifications/client/src/index.ts` - Notifications client
- `libs/payments/server/src/index.ts` - Payments server
- `libs/payments/client/src/index.ts` - Payments client
- `libs/websockets/user-presence/src/index.ts` - WebSocket module
- `libs/shared/types/src/index.ts` - Shared types
- `libs/shared/schemas/src/index.ts` - Zod schemas

---

## Environment Variables

### Backend (my-api)
- `PORT` - Server port (default: 3333)
- `NODE_ENV` - Environment (development/production)
- `REDIS_URL` - Redis connection URL
- `REDIS_NAMESPACE` - Redis namespace
- `SESSION_SECRET` - Session encryption secret
- `CORS_ORIGIN_DOMAINS` - Allowed CORS origins
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GOOGLE_REDIRECT_URL` - Google OAuth callback
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
- `GITHUB_REDIRECT_URL` - GitHub OAuth callback
- `AUTH_LOGIN_REDIRECT` - Frontend login redirect URL
- `LOGGER_LEVEL` - Logging level
- `GRACEFUL_SHUTDOWN_TIMEOUT` - Shutdown timeout

### Frontend (next-app)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `REPLICATE_TOKEN` - Replicate API token (for AI images)

### Database
- `DATABASE_URL` - Prisma database connection string

---

## Build & Development

### Nx Commands
- `nx serve my-api` - Start backend dev server
- `nx serve next-app` - Start frontend dev server
- `nx build my-api` - Build backend
- `nx build next-app` - Build frontend
- `nx test` - Run tests
- `nx lint` - Lint code

### Package Scripts
- `dev:my-api` - Start backend
- `dev:next` - Start frontend
- `build:my-api` - Build backend
- `build:next` - Build frontend
- `db:migrate` - Run database migrations
- `db:generate` - Generate Prisma client

---

## Notes & Observations

### Strengths
1. **Well-organized monorepo** with clear separation of concerns
2. **Type-safe** throughout with TypeScript
3. **Comprehensive UI library** in shared packages
4. **Real-time features** via WebSocket
5. **Transaction support** for data consistency
6. **Observability** with OpenTelemetry
7. **Security** features (CSRF, CORS, Helmet)

### Potential Areas for Improvement
1. **Error handling** could be more consistent
2. **Testing** coverage not visible in structure
3. **Documentation** could be expanded
4. **Environment variable** management could be centralized
5. **API versioning** not evident
6. **Rate limiting** not visible in structure

### Architecture Decisions
1. **Session-based auth** instead of JWT tokens
2. **Redis** for both caching and sessions
3. **WebSocket** for real-time features
4. **Repository pattern** for data access
5. **Module-based** organization in NestJS
6. **App Router** in Next.js (latest pattern)

---

## Next Steps for Refactoring

This document serves as a reference for understanding the current codebase structure before making refactoring decisions. Key areas to consider:

1. **Code organization** - Module boundaries and responsibilities
2. **Shared code** - Duplication and extraction opportunities
3. **Type safety** - Type definitions and schemas
4. **Error handling** - Consistent error patterns
5. **Testing** - Test coverage and structure
6. **Performance** - Optimization opportunities
7. **Security** - Security best practices
8. **Documentation** - Code documentation and API docs

---

**End of Findings Document**

