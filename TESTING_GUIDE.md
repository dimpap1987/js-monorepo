# Testing Guide for Frontend Libraries

## Testing Strategy

### For Frontend Libraries (Components, Hooks, Utilities)

**✅ Use Unit Tests** - Test individual components, hooks, and utilities in isolation.

**❌ Don't Use E2E Tests** - E2E tests are for full applications, not libraries.

### For Applications (next-app, etc.)

**✅ Use Both:**
- **Unit/Integration Tests** - Test individual features, pages, components
- **E2E Tests** - Test complete user flows end-to-end

## Recommended Testing Stack

### 1. **Unit/Integration Testing** (For Libraries)

**Primary Stack:**
- **Jest** - Test runner (already installed)
- **@testing-library/react** - Component testing (already installed)
- **@testing-library/jest-dom** - DOM matchers (needs installation)
- **@testing-library/user-event** - User interaction simulation (recommended)

**Install missing dependencies:**
```bash
npm install --save-dev @testing-library/jest-dom @testing-library/user-event
```

**Alternative (Faster):**
- **Vitest** - Faster alternative to Jest with better ESM support
- **@testing-library/react** - Same component testing library

### 2. **E2E Testing** (For Applications Only)

**Current Setup:**
- **Cypress** (already installed) - Good for Next.js apps

**Alternative:**
- **Playwright** - Modern, faster, better browser support

## Testing Best Practices

### What to Test in Libraries

1. **Components:**
   - Rendering with different props
   - User interactions (clicks, inputs)
   - State changes
   - Edge cases (empty states, error states)
   - Accessibility (ARIA attributes)

2. **Hooks:**
   - Return values
   - State updates
   - Side effects
   - Cleanup functions

3. **Utilities:**
   - Input/output transformations
   - Error handling
   - Edge cases

### What NOT to Test

- Implementation details (internal state, refs)
- Third-party library internals
- Styling (CSS classes are fine, but not visual appearance)
- Browser APIs (mock them)

## Example Test Structure

```tsx
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from './my-component'

describe('MyComponent', () => {
  it('should render with props', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## Running Tests

```bash
# Run all tests
nx test notifications-client

# Run tests with coverage
nx test notifications-client --coverage

# Run tests in watch mode
nx test notifications-client --watch

# Run affected tests only
nx affected:test
```

## Coverage Goals

- **Components**: 80%+ coverage
- **Hooks**: 90%+ coverage
- **Utilities**: 95%+ coverage
- **Critical paths**: 100% coverage

## Testing Checklist for New Components

- [ ] Component renders with required props
- [ ] Component handles optional props
- [ ] User interactions work (clicks, inputs, etc.)
- [ ] Error states are handled
- [ ] Loading states are handled
- [ ] Empty states are handled
- [ ] Accessibility attributes are present
- [ ] Component is memoized if needed (performance)

