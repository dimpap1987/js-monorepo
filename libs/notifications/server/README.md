## `@js-monorepo/notifications-server`

Backend notification infrastructure for the monorepo.  
Responsible for persisting user notifications, marking them as read, and emitting events to clients (typically via WebSockets).

### Exports

From `libs/notifications/server/src/index.ts`:

- `NotificationsModule` – NestJS module wiring up repositories/services for notifications
- `NotificationService` – main service to create + manage notifications
- `Events` – event channel constants, e.g.:
  - `Events.notifications = 'events:notifications'`

### Basic Setup (NestJS)

```ts
// apps/gym-api/src/app/app.module.ts
import { Module } from '@nestjs/common'
import { NotificationsModule } from '@js-monorepo/notifications-server'

@Module({
  imports: [NotificationsModule],
})
export class AppModule {}
```

`NotificationsModule` expects:

- A working Prisma setup (via `@js-monorepo/prisma-shared` and your DB library)
- Optionally, a pub/sub or WebSocket gateway if you want real‑time delivery

### Creating Notifications

```ts
import { Injectable } from '@nestjs/common'
import { NotificationService } from '@js-monorepo/notifications-server'

@Injectable()
export class BookingService {
  constructor(private readonly notifications: NotificationService) {}

  async confirmBooking(userId: number) {
    // ... booking logic ...

    await this.notifications.create({
      userId,
      title: 'Booking confirmed',
      body: 'Your visit is scheduled.',
      type: 'booking',
      // any other metadata your schema supports
    })
  }
}
```

Depending on your implementation, `NotificationService` can:

- Store notifications in the DB
- Emit events on `Events.notifications` for connected clients

### Marking Notifications as Read

Typically exposed via an HTTP or WebSocket endpoint:

```ts
import { Body, Controller, Post } from '@nestjs/common'
import { NotificationService } from '@js-monorepo/notifications-server'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationService) {}

  @Post('read-all')
  readAll(@Body('userId') userId: number) {
    return this.notifications.readAll(userId)
  }
}
```

Client utilities in `@js-monorepo/notifications-client` call these APIs.
