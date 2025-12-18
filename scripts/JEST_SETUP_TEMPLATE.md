# Jest Setup Template for React Libraries

Since Nx doesn't have a generator to add Jest to existing libraries, use this template to quickly set up Jest + React Testing Library for any React library.

## Quick Setup Script

Use the automated script:

```bash
node scripts/setup-jest.js libs/shared/ui/sidebar
```

## Manual Setup

If you prefer to set up manually, follow these steps:

### 1. Create `jest.config.ts`

```typescript
/* eslint-disable */
export default {
  displayName: 'your-library-name',
  preset: '../../../../jest.preset.js', // Adjust depth based on library location
  testEnvironment: 'jsdom',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: [['@babel/preset-react', { runtime: 'automatic' }]] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/shared/ui/your-library',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    // Add path mappings if needed
  },
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/*.stories.{ts,tsx}', '!**/index.{ts,tsx}'],
  clearMocks: true,
  restoreMocks: true,
}
```

### 2. Create `tsconfig.spec.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node", "@testing-library/jest-dom"],
    "jsx": "react-jsx"
  },
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts",
    "src/test-setup.d.ts"
  ]
}
```

### 3. Create `src/test-setup.ts`

```typescript
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
```

### 4. Create `src/test-setup.d.ts`

```typescript
/// <reference types="@testing-library/jest-dom" />
```

### 5. Update `project.json`

Add test target:

```json
{
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/shared/ui/your-library/jest.config.ts",
        "passWithNoTests": true
      }
    }
  }
}
```

### 6. Install Dependencies

```bash
npm install --save-dev @testing-library/jest-dom @testing-library/user-event
```

### 7. Write Your First Test

Create `src/lib/your-component.spec.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YourComponent } from './your-component'

describe('YourComponent', () => {
  it('should render', () => {
    render(<YourComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## Running Tests

```bash
# Run tests
nx test your-library-name

# Watch mode
nx test your-library-name --watch

# With coverage
nx test your-library-name --coverage
```

## Reference

See `libs/shared/ui/button` for a complete working example.
