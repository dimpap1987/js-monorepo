## `@js-monorepo/user-presence`

WebSocket utilities and NestJS module for **tracking online users and their sockets**.  
Used by apps that need presence indicators, online counts, or real‑time collaboration.

### Exports

From `libs/websockets/user-presence/src/index.ts`:

- **Module & Gateway**
  - `UserPresenceModule`
  - `UserPresenceGateway`
- **Services**
  - `OnlineUsersService` – tracks which users are online
  - `UserSocketService` – maps users ↔ socket IDs
  - `UserPresenceService` – higher‑level presence operations
- **Guards**
  - `WsLoginGuard`
  - `WsRolesGuard`
- **Infrastructure**
  - Redis adapter helpers
  - Constants and shared types

### Basic Setup (NestJS Gateway)

```ts
// apps/bibikos-api/src/app/app.module.ts
import { Module } from '@nestjs/common'
import { UserPresenceModule } from '@js-monorepo/user-presence'

@Module({
  imports: [UserPresenceModule],
})
export class AppModule {}
```

This wires:

- A Socket.IO gateway for presence events
- Services that store online users (typically backed by Redis)

### Using Presence in a Gateway

```ts
import { UseGuards } from '@nestjs/common'
import { UserPresenceGateway, WsLoginGuard, OnlineUsersService } from '@js-monorepo/user-presence'

@UseGuards(WsLoginGuard)
export class AppGateway extends UserPresenceGateway {
  constructor(onlineUsers: OnlineUsersService) {
    super(onlineUsers)
  }
}
```

On the client side, combine this with your websocket client library to show live presence indicators.
