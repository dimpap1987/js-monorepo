## `@js-monorepo/contact-server`

NestJS module that handles **contact / support messages** (e.g. from the public contact form in `bibikos-client`).  
It uses Prisma (via the shared `PRISMA_SERVICE` token) to persist messages in the DB.

### Features

- **NestJS module** to register contact message handling in an API
- **Service + repository** abstraction over the `ContactMessage` Prisma model
- Compatible with both `core-db` and `bibikos-db` through `@js-monorepo/prisma-shared`

### Exports

From `libs/contact/server/src/index.ts`:

- `ContactModule`
- `ContactService`
- `ContactRepository`

### Installation

```ts
// apps/bibikos-api/src/app/app.module.ts (example)
import { Module } from '@nestjs/common'
import { PrismaModule } from '@js-monorepo/bibikos-db'
import { ContactModule } from '@js-monorepo/contact-server'

@Module({
  imports: [
    PrismaModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        databaseUrl: config.get('BIBIKOS_DATABASE_URL'),
      }),
    }),
    ContactModule,
  ],
})
export class AppModule {}
```

> **Note**  
> `ContactModule` expects a Prisma service registered under the `PRISMA_SERVICE` token, provided by the active DB library (`core-db` or `bibikos-db`).

### Typical Usage

In a controller (e.g. `apps/bibikos-api/src/app/contact/contact.controller.ts`):

```ts
import { Body, Controller, Post } from '@nestjs/common'
import { ContactService } from '@js-monorepo/contact-server'

interface CreateContactDto {
  name: string
  email: string
  message: string
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() dto: CreateContactDto) {
    const message = await this.contactService.create(dto)
    return { id: message.id }
  }
}
```

### Database Schema

The underlying Prisma model lives in the shared schema (see `libs/prisma/*/src/lib/prisma/schema/contact.prisma`):

- Stores metadata like `name`, `email`, `message`
- Connected to the same Postgres database as the rest of the app (core or bibikos DB, depending on which Prisma module is imported)
