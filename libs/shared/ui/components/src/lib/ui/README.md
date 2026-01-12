# UI Components

Shared UI components library built with React, Tailwind CSS, and class-variance-authority.

## Installation

These components are available via the `@js-monorepo/components/ui/*` path alias.

```tsx
import { FeatureBadge } from '@js-monorepo/components/ui/feature-badge'
import { ComingSoonWrapper } from '@js-monorepo/components/ui/coming-soon-wrapper'
```

---

## FeatureBadge

A configurable badge component for highlighting feature states like "Soon", "Hot", "New", "Beta", "Premium", or "Deprecated".

### Usage

```tsx
import { FeatureBadge } from '@js-monorepo/components/ui/feature-badge'

// Basic usage with default labels
<FeatureBadge variant="soon" />     // Displays "Soon"
<FeatureBadge variant="hot" />      // Displays "Hot"
<FeatureBadge variant="new" />      // Displays "New"
<FeatureBadge variant="beta" />     // Displays "Beta"
<FeatureBadge variant="premium" />  // Displays "Premium"
<FeatureBadge variant="deprecated" /> // Displays "Deprecated"

// Custom label
<FeatureBadge variant="soon" label="Coming Q2" />

// With animation (pulse effect)
<FeatureBadge variant="hot" animated />
<FeatureBadge variant="new" animated />

// Size variants
<FeatureBadge variant="new" size="sm" />
<FeatureBadge variant="new" size="default" />
<FeatureBadge variant="new" size="lg" />

// With children (alternative to label)
<FeatureBadge variant="beta">Early Access</FeatureBadge>
```

### Props

| Prop        | Type                                                              | Default     | Description                                         |
| ----------- | ----------------------------------------------------------------- | ----------- | --------------------------------------------------- |
| `variant`   | `'soon' \| 'hot' \| 'new' \| 'beta' \| 'premium' \| 'deprecated'` | `'soon'`    | Visual style and default label                      |
| `size`      | `'sm' \| 'default' \| 'lg'`                                       | `'default'` | Badge size                                          |
| `animated`  | `boolean`                                                         | `false`     | Enable pulse animation (works with `hot` and `new`) |
| `label`     | `string`                                                          | -           | Custom label text (overrides default)               |
| `className` | `string`                                                          | -           | Additional CSS classes                              |

---

## ComingSoonWrapper

A wrapper component that overlays content with a disabled state and optional badge, perfect for indicating upcoming features.

### Usage

```tsx
import { ComingSoonWrapper } from '@js-monorepo/components/ui/coming-soon-wrapper'

// Basic usage
<ComingSoonWrapper>
  <Button>Feature Coming Soon</Button>
</ComingSoonWrapper>

// With different badge variants
<ComingSoonWrapper badgeVariant="beta">
  <Card>Beta Feature</Card>
</ComingSoonWrapper>

// Custom badge label
<ComingSoonWrapper badgeVariant="soon" badgeLabel="Q2 2025">
  <div>Upcoming Feature</div>
</ComingSoonWrapper>

// Different opacity levels
<ComingSoonWrapper opacity="low">   {/* 30% opacity */}
<ComingSoonWrapper opacity="medium"> {/* 50% opacity - default */}
<ComingSoonWrapper opacity="high">  {/* 70% opacity */}

// With blur effect
<ComingSoonWrapper blur="sm">  {/* 1px blur */}
<ComingSoonWrapper blur="md">  {/* 2px blur */}
<ComingSoonWrapper blur="lg">  {/* 4px blur */}

// Badge positioning
<ComingSoonWrapper badgePosition="top-left">
<ComingSoonWrapper badgePosition="top-center">
<ComingSoonWrapper badgePosition="top-right">    {/* default */}
<ComingSoonWrapper badgePosition="center">
<ComingSoonWrapper badgePosition="bottom-left">
<ComingSoonWrapper badgePosition="bottom-center">
<ComingSoonWrapper badgePosition="bottom-right">

// Without badge (just the disabled state)
<ComingSoonWrapper showBadge={false}>
  <Button>Disabled Button</Button>
</ComingSoonWrapper>

// Not disabled (for preview purposes)
<ComingSoonWrapper disabled={false}>
  <Button>Clickable but marked as Coming Soon</Button>
</ComingSoonWrapper>
```

### Props

| Prop            | Type                                                                                                          | Default       | Description                          |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------ |
| `opacity`       | `'low' \| 'medium' \| 'high'`                                                                                 | `'medium'`    | Opacity level of wrapped content     |
| `blur`          | `'none' \| 'sm' \| 'md' \| 'lg'`                                                                              | `'none'`      | Blur effect on wrapped content       |
| `badgePosition` | `'top-left' \| 'top-center' \| 'top-right' \| 'center' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'top-right'` | Badge placement                      |
| `disabled`      | `boolean`                                                                                                     | `true`        | Disable pointer events and selection |
| `showBadge`     | `boolean`                                                                                                     | `true`        | Show/hide the badge overlay          |
| `badgeVariant`  | `FeatureBadgeProps['variant']`                                                                                | `'soon'`      | Badge style variant                  |
| `badgeLabel`    | `string`                                                                                                      | -             | Custom badge label                   |
| `badgeSize`     | `FeatureBadgeProps['size']`                                                                                   | -             | Badge size                           |
| `className`     | `string`                                                                                                      | -             | Additional CSS classes               |

---

## Styling

Both components use Tailwind CSS and support dark mode out of the box. Colors are designed to work with the application's color palette.

### Customization

You can override styles using the `className` prop:

```tsx
<FeatureBadge variant="hot" className="shadow-lg" />
<ComingSoonWrapper className="rounded-lg overflow-hidden" />
```
