# Testing Guide

## Quick Overview

**Libraries**: Use unit tests with Jest + React Testing Library  
**Applications**: Use unit tests + E2E tests (Cypress/Playwright)

## Commands

### Run Tests

```bash
# Run tests for a specific library
nx test your-library-name

# Watch mode
nx test your-library-name --watch

# With coverage
nx test your-library-name --coverage

# Run all affected tests
nx affected:test
```

## What to Test

### Components

- ✅ Rendering with different props
- ✅ User interactions (clicks, inputs)
- ✅ State changes and edge cases
- ✅ Accessibility (ARIA attributes)

### Hooks

- ✅ Return values and state updates
- ✅ Side effects and cleanup

### Utilities

- ✅ Input/output transformations
- ✅ Error handling

### Don't Test

- ❌ Implementation details (internal state, refs)
- ❌ Third-party library internals
- ❌ Visual styling

## Example Test

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './my-component'

describe('MyComponent', () => {
  it('should render and handle interactions', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    expect(screen.getByRole('button')).toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    // Assert expected behavior
  })
})
```

## Coverage Goals

- **Components**: 80%+
- **Hooks**: 90%+
- **Utilities**: 95%+
- **Critical paths**: 100%

## Reference

See `libs/shared/ui/button` for a complete working example.
