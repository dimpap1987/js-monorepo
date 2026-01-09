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

Each application now manages its own environment variables using a local `.env` file. This allows for greater flexibility and ensures that each app's configuration is self-contained.

To get started, create a `.env` file in the root of each application that requires environment variables. Common locations include:

- `apps/next-app/.env`
- `apps/my-api/.env`
- `apps/gym-api/.env`
- `apps/webhook-server/.env`
- `libs/prisma/run_migrations/.env`

Refer to the `.env.example` file (if available in the respective app's directory or the root for general guidance) for a list of necessary variables.

**Note**: When using `dotenv-expand` (e.g., in `apps/my-api` or `apps/gym-api`), variable interpolation within these local `.env` files is supported.

HOSTNAME=localhost
API_PORT=3333
FRONTEND_PORT=3000

````

**Staging/Production:**

```bash
# HOSTNAME=staging.yourdomain.com  # or yourdomain.com
# API_PORT=3333
# FRONTEND_PORT=3000
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

See `.env.example` for the complete template.

### Running specific apps

```bash
# Start frontend only
npm run dev:next

# Start backend only
npm run dev:my-api

```

### Building projects

docker network create super-network

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

# TODO

1. move all shadcn compoents in libs/shared/ui/components/src/lib/ui by executing comands from the oficial site
````
