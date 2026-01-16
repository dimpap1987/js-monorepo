## `@js-monorepo/auth-nest`

NestJS authentication utilities and modules for the monorepo.  
Implements session‑based auth (no JWT), OAuth (Google, GitHub), guards, and decorators.

### Overview

Key concepts (see `libs/auth/nest/src/` for full details):

- **Session‑based auth** backed by Redis
- **OAuth providers**: Google, GitHub
- **Roles**: `USER`, `ADMIN`
- **Guards**:
  - `LoggedInGuard`
  - `RolesGuard`
  - `WsLoginGuard`
  - `WsRolesGuard`
- **Modules**:
  - Session/auth modules used by `my-api` and `bibikos-api`

### Typical Usage

```ts
// apps/bibikos-api/src/app/app.module.ts
import { Module } from '@nestjs/common'
import { AuthSessionModule } from '@js-monorepo/auth-nest'

@Module({
  imports: [AuthSessionModule],
})
export class AppModule {}
```

### Protecting Routes

```ts
import { Controller, Get, UseGuards } from '@nestjs/common'
import { LoggedInGuard, RolesGuard, Roles } from '@js-monorepo/auth-nest'

@Controller('admin')
@UseGuards(LoggedInGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  @Get('dashboard')
  getDashboard() {
    return { ok: true }
  }
}
```

### WebSocket Guards

```ts
import { UseGuards } from '@nestjs/common'
import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets'
import { WsLoginGuard, WsRolesGuard, Roles } from '@js-monorepo/auth-nest'

@WebSocketGateway()
@UseGuards(WsLoginGuard, WsRolesGuard)
@Roles('USER')
export class NotificationsGateway {
  @SubscribeMessage('ping')
  handlePing() {
    return 'pong'
  }
}
```

All auth code is designed to work with the shared Prisma models from `@js-monorepo/core-db` / `@js-monorepo/bibikos-db`.
