## `@js-monorepo/ui-announcements`

Announcement/notification banner components for surfacing product updates, alerts, or marketing messages.

### Exports

From `libs/shared/ui/announcements/src/index.ts`:

- Components from `./lib/announcements` (e.g. announcement bar/banner, list)

> See `libs/shared/ui/announcements/src/lib/` for full component list and props.

### Example – Top Announcement Bar

```tsx
import { AnnouncementBar } from '@js-monorepo/ui-announcements'

export function TopAnnouncement() {
  return <AnnouncementBar message="New: Annual plan with 2 months free ✨" href="/pricing" />
}
```

Use these components to keep announcement styling and behavior consistent across apps.
