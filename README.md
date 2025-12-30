# 🚀 NX Monorepo Workspace

## 📋 Overview

This project is an educational monorepo that demonstrates how to create and organize reusable components, implement authentication and session management, and establish communication between frontend and backend services.

The architecture includes:

- **Frontend**: Next.js application for user interface
- **Backend**: Nest.js API for business logic and authentication
- **Libraries**: Reusable UI components and backend services, including shadcn components
- **Infrastructure**: Docker configuration and GitHub Actions pipelines

## 🏗️ Architecture

```
.
├── apps/
│   ├── next-app/           # Next.js frontend application
│   └── my-api/             # Nest.js backend API
├── libs/                   # Libraries - Reusable libraries
├── deployments/            # Include all the Docker-composes
└── .github/                # GitHub Actions workflows
```

## ✨ Features

### 🔄 Reusable Components

- Customizable notification system
- shadcn UI components with Tailwind styling
- Shared utility functions and hooks

### 🔐 Authentication System

- Secure cookie-based authentication
- Session management with Redis
- Role-based access control

### 💳 Subscription System

- Integrated Stripe payment processing
- Multiple subscription plan tiers
- Secure payment handling
- Subscription management interface

### 👥 Real-time Features

- WebSocket integration for tracking online users
- Real-time notifications and updates
- User presence indicators

### 🛠️ Development Experience

- Shared ESLint and TypeScript configurations
- Cross-application type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Redis

## 🔧 Development

### Environment Variables

This monorepo uses **centralized environment variable management** with **configurable base variables**. All environment variables are defined in a single root `.env` file using variable interpolation.

#### Setup

1. **Create root `.env` file**:

   ```bash
   # Copy from template
   cp .env.example .env
   ```

2. **Configure base variables** (edit `.env`):

   ```bash
   # For local development:
   HOSTNAME=localhost
   API_PORT=3333
   FRONTEND_PORT=3000
   DATABASE_PORT=5432
   REDIS_PORT=6379

   # For production, just change HOSTNAME:
   # HOSTNAME=yourdomain.com
   # API_PORT=3333
   # FRONTEND_PORT=3000
   ```

3. **Sync to all apps**:
   ```bash
   npm run sync:env
   ```
   This syncs and expands variables from root `.env` to:
   - `apps/my-api/.env`
   - `apps/next-app/.env`
   - `libs/prisma/run_migrations/.env`

#### How It Works

The `.env` file uses **variable interpolation** (via `dotenv-expand`). Base variables are defined at the top, and all URLs are constructed from them:

```bash
# Base configuration
HOSTNAME=localhost
API_PORT=3333
FRONTEND_PORT=3000

# Auto-constructed URLs
HOSTNAME_API=${HOSTNAME}:${API_PORT}           # → localhost:3333
HOSTNAME_FRONTEND=${HOSTNAME}:${FRONTEND_PORT} # → localhost:3000
AUTH_LOGIN_REDIRECT=http://${HOSTNAME_FRONTEND} # → http://localhost:3000
GOOGLE_REDIRECT_URL=http://${HOSTNAME_API}/api/auth/google/redirect
```

#### Workflow

- **Edit base variables**: Change `HOSTNAME`, `*_PORT` in root `.env`
- **Sync changes**: Run `npm run sync:env` (expands variables automatically)
- **Restart services**: Restart dev servers to load new values

> **Note**: Run `npm run sync:env` whenever you change the root `.env` file. Variables are automatically expanded for Next.js compatibility.

#### Environment-Specific Configuration

**Local Development:**

```bash
HOSTNAME=localhost
API_PORT=3333
FRONTEND_PORT=3000
```

**Staging/Production:**

```bash
HOSTNAME=staging.yourdomain.com  # or yourdomain.com
API_PORT=3333
FRONTEND_PORT=3000
# All URLs automatically update!
```

#### Key Variables

**Base Variables** (change these for different environments):

- `HOSTNAME` - Base hostname (localhost, staging.example.com, etc.)
- `API_PORT` - Backend API port (default: 3333)
- `FRONTEND_PORT` - Frontend port (default: 3000)
- `DATABASE_PORT` - PostgreSQL port (default: 5432)
- `REDIS_PORT` - Redis port (default: 6379)

**Auto-constructed** (don't edit directly):

- `HOSTNAME_API`, `HOSTNAME_FRONTEND`, `HOSTNAME_DATABASE`, `HOSTNAME_REDIS`
- `DATABASE_URL`, `REDIS_URL`
- `AUTH_LOGIN_REDIRECT`, `GOOGLE_REDIRECT_URL`, `GITHUB_REDIRECT_URL`
- `NEXT_PUBLIC_AUTH_URL`, `NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL`
- `CORS_ORIGIN_DOMAINS`, `API_URL`

See `.env.example` for the complete template.

### Running specific apps

```bash
# Start frontend only
npm run dev:next

# Start backend only
npm run dev:my-api

```

### Building projects

#### Next-app

1. npm run build:next
2. docker build -t dimpap/next-app:1.0.100 -f apps/next-app/Dockerfile .

**_ IMPORTANT _**
Before building, ensure your root `.env` file is configured and synced:

```bash
npm run sync:env
```

The build process will use environment variables from the root `.env` file.

#### My-api

1. npm run build:my-api
2. docker build -t dimpap/my-api:1.0.100 -f apps/my-api/Dockerfile .

## 🔄 CI/CD

GitHub Actions workflows are configured for:

- Automated testing
- Linting and type checking
- Building and pushing Docker images

## 📚 Technology Stack

### Frontend

- **Framework**: Next.js, React
- **Styling**: TailwindCSS, shadcn UI components
- **State Management**: React Context API

### Backend

- **Framework**: Nest.js
- **Real-time**: WebSockets
- **Data Storage**: Redis
- **Payment Processing**: Stripe

### Infrastructure

- **Build System**: NX Monorepo
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Authentication**: Cookies, Sessions, Redis

### Development Tools

- **Linting**: ESLint
- **Type Safety**: TypeScript
- **Testing**: Jest
