## `@js-monorepo/ui-ai-image-generator`

UI components for showcasing AI image generation inside the apps (used primarily in `next-app`).  
Wraps prompts, results, and loading/error states into a reusable section.

### Exports

From `libs/shared/ui/ai-image-generator/src/index.ts`:

- Main AI image generator component(s) from `./lib/ai-image-generator`

> Check `libs/shared/ui/ai-image-generator/src/lib/ai-image-generator.tsx` for exact props and behavior.

### Example Usage

```tsx
import { AiImageGenerator } from '@js-monorepo/ui-ai-image-generator'

export default function AiShowcaseSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">AI Image Generator</h2>
      <p className="text-sm text-muted-foreground">Generate preview images for your marketing content.</p>
      <AiImageGenerator />
    </section>
  )
}
```

The component is designed to integrate with your existing AI/image API endpoints.
