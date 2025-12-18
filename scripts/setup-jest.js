#!/usr/bin/env node

/**
 * Script to add Jest + React Testing Library setup to an existing Nx React library
 *
 * Usage:
 *   node scripts/setup-jest.js <library-path>
 *
 * Example:
 *   node scripts/setup-jest.js libs/shared/ui/sidebar
 */

const fs = require('fs')
const path = require('path')

const libraryPath = process.argv[2]

if (!libraryPath) {
  console.error('❌ Error: Please provide a library path')
  console.log('Usage: node scripts/setup-jest.js <library-path>')
  console.log('Example: node scripts/setup-jest.js libs/shared/ui/sidebar')
  process.exit(1)
}

const fullPath = path.resolve(libraryPath)
const libraryName = path.basename(fullPath)
// Calculate depth: count how many directories deep the library is from root
const pathParts = libraryPath.split('/').filter((p) => p)
const relativeDepth = pathParts.length
const presetPath = '../'.repeat(relativeDepth) + 'jest.preset.js'
const coveragePath = '../'.repeat(relativeDepth) + 'coverage/' + libraryPath

// Calculate paths relative to library root
const getRelativePath = (targetPath) => {
  const relative = path.relative(fullPath, path.resolve(targetPath))
  return relative.startsWith('.') ? relative : './' + relative
}

console.log(`📦 Setting up Jest for library: ${libraryName}`)
console.log(`📍 Path: ${fullPath}\n`)

// 1. Create jest.config.ts
const tsconfigBasePath = '../'.repeat(relativeDepth) + 'tsconfig.base.json'
const prefixPath = '../'.repeat(relativeDepth)
const jestConfig = `/* eslint-disable */
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('${tsconfigBasePath}')

module.exports = {
  displayName: '${libraryName}',
  preset: '${presetPath}',
  testEnvironment: 'jsdom',
  transform: {
    '^(?!.*\\\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\\\.[tj]sx?$': ['babel-jest', { presets: [['@babel/preset-react', { runtime: 'automatic' }]] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '${coveragePath}',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: '<rootDir>/${prefixPath}',
    }),
  },
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/*.stories.{ts,tsx}', '!**/index.{ts,tsx}'],
  clearMocks: true,
  restoreMocks: true,
}
`

// 2. Create tsconfig.spec.json
const outDirPath = '../'.repeat(relativeDepth + 1) + 'dist/out-tsc'
const tsconfigSpec = {
  extends: './tsconfig.json',
  compilerOptions: {
    outDir: outDirPath,
    module: 'commonjs',
    types: ['jest', 'node', '@testing-library/jest-dom'],
  },
  include: [
    'jest.config.ts',
    'src/**/*.test.ts',
    'src/**/*.test.tsx',
    'src/**/*.spec.ts',
    'src/**/*.spec.tsx',
    'src/**/*.d.ts',
    'src/test-setup.d.ts',
  ],
}

// 3. Create test-setup.ts
const testSetup = `// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
`

// 4. Create test-setup.d.ts
const testSetupDts = `/// <reference types="@testing-library/jest-dom" />
`

// 5. Update project.json
const projectJsonPath = path.join(fullPath, 'project.json')
let projectJson = {}
if (fs.existsSync(projectJsonPath)) {
  projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'))
} else {
  console.error(`❌ Error: project.json not found at ${projectJsonPath}`)
  process.exit(1)
}

// Add test target if it doesn't exist
if (!projectJson.targets) {
  projectJson.targets = {}
}

if (!projectJson.targets.test) {
  projectJson.targets.test = {
    executor: '@nx/jest:jest',
    outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
    options: {
      jestConfig: `${libraryPath}/jest.config.ts`,
      passWithNoTests: true,
    },
  }
  console.log('✅ Added test target to project.json')
} else {
  console.log('ℹ️  Test target already exists in project.json')
}

// Write files
try {
  // Create src directory if it doesn't exist
  const srcDir = path.join(fullPath, 'src')
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true })
  }

  fs.writeFileSync(path.join(fullPath, 'jest.config.ts'), jestConfig)
  console.log('✅ Created jest.config.ts')

  fs.writeFileSync(path.join(fullPath, 'tsconfig.spec.json'), JSON.stringify(tsconfigSpec, null, 2) + '\n')
  console.log('✅ Created tsconfig.spec.json')

  fs.writeFileSync(path.join(srcDir, 'test-setup.ts'), testSetup)
  console.log('✅ Created src/test-setup.ts')

  fs.writeFileSync(path.join(srcDir, 'test-setup.d.ts'), testSetupDts)
  console.log('✅ Created src/test-setup.d.ts')

  fs.writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2) + '\n')
  console.log('✅ Updated project.json')

  console.log('\n🎉 Jest setup complete!')
  console.log('\n📝 Next steps:')
  console.log('1. Install dependencies: npm install --save-dev @testing-library/jest-dom @testing-library/user-event')
  console.log(`2. Run tests: nx test ${libraryName}`)
  console.log('3. Write your first test file (e.g., src/lib/component.spec.tsx)')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
