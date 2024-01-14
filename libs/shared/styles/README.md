# styles

## How to use

```css
@import '@js-monorepo/base';
```

**_NOTE_**  
You need to create a typescript project in order to use it
because it is being imported from tsconfig.\*.json

## @js-monorepo/base

```css
html,
body,
main {
  scroll-behavior: smooth;
  font-size: 14px;
}

.min-h-100svh {
  min-height: 100vh;
  min-height: 100svh;
}

*,
*:before,
*:after {
  box-sizing: border-box;
}

* {
  font: inherit;
  margin: 0;
  padding: 0;
}

img {
  max-width: 100%;
  height: auto;
}
```

## import tailwind

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

h1 {
  @apply text-2xl;
  @apply font-bold;
}

h2 {
  @apply text-xl;
  @apply font-bold;
}

h3 {
  @apply text-lg;
  @apply font-bold;
}

h4 {
  @apply text-lg;
  @apply font-semibold;
}
```
