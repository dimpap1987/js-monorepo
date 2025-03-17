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

### Running specific apps

```bash
# Start frontend only
npm run dev:next

# Start backend only
npm run dev:my-api

```

**_ IMPORTANT _**  Check the .env.example in each project to see the required env variables

### Building projects

#### Next-app

1. npm run build:next
2. docker build -t dimpap/next-app:1.0.100 -f apps/next-app/Dockerfile .

**_ IMPORTANT _**
Before you build the image you need to set .env in `apps/next-app/.env`

```.env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_AUTH_URL=http://localhost:80                         ##  Replace with your domain
NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL=ws://localhost:80/presence    ## Replace with your domain
```

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
