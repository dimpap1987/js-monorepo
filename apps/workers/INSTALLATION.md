# Installation Guide

## Prerequisites

Before running the workers microservice, ensure you have the following dependencies installed:

```bash
npm install @nestjs/microservices
```

This package provides the microservice transport layer (TCP) used by the workers application.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set environment variables:**
```bash
REDIS_URL=redis://localhost:6379
BULLMQ_QUEUE_PREFIX=workers
WORKERS_HOST=0.0.0.0
WORKERS_PORT=3001
GRACEFUL_SHUTDOWN_TIMEOUT=10000
```

3. **Start Redis (if not running):**
```bash
docker run -d -p 6379:6379 redis:latest
```

4. **Run the microservice:**
```bash
npm run dev:workers
```

## Verification

Once started, you should see:
```
[WorkersBootstrap] Starting BullMQ workers microservice...
[WorkersBootstrap] ✅ BullMQ workers microservice started on 0.0.0.0:3001
[EmailProcessor] Registering email worker...
[EmailProcessor] ✅ Email worker registered
[OrderProcessor] Registering order worker...
[OrderProcessor] ✅ Order worker registered
```

## Testing Microservice Connection

You can test the microservice health endpoint using a simple TCP client or NestJS microservice client.

