## `@js-monorepo/ui-contact-form`

Shared **contact form** UI used in the Next.js apps (e.g. `gym-client` contact page).  
Includes a ready‑made form component and hook for managing submission and validation.

### Exports

From `libs/shared/ui/contact-form/src/index.ts`:

- `ContactForm` – main React component for rendering the form
- `useContactForm` – hook that encapsulates form state, validation, and submit logic

### Basic Usage

```tsx
// apps/gym-client/app/(main)/contact/page.tsx
'use client'

import { ContactForm } from '@js-monorepo/ui-contact-form'

export default function ContactPage() {
  return (
    <main className="container py-12">
      <h1 className="text-3xl font-semibold mb-4">Contact us</h1>
      <p className="text-muted-foreground mb-8">
        Send us a message and we’ll get back to you.
      </p>
      <ContactForm />
    </main>
  )
}
```

### Using the Hook Directly

If you need custom layout or additional fields, you can build on top of `useContactForm`:

```tsx
import { useContactForm } from '@js-monorepo/ui-contact-form'

export function CustomContactForm() {
  const {
    register,
    handleSubmit,
    isSubmitting,
    errors,
    onSubmit, // default submit handler (e.g. POST to /contact API)
  } = useContactForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('name')} placeholder="Your name" />
      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}

      <input {...register('email')} placeholder="Your email" />
      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

      <textarea {...register('message')} placeholder="How can we help?" />
      {errors.message && (
        <p className="text-sm text-red-500">{errors.message.message}</p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
```

> The exact field names and validation rules live in the implementation under `libs/shared/ui/contact-form/src/lib/`.

