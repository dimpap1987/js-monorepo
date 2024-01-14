# styles

## How to use

import styles like below

```css
@import '@js-monorepo/tailwind';
@import '@js-monorepo/base';
```
***NOTE***   
You need to create a typescript project in order to use them
because they are being imported from tsconfig.*.json

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

## @js-monorepo/tailwind

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
