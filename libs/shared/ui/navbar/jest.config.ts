/* eslint-disable */
import { getModuleNameMapper } from '../../../../jest.config.helper'

export default {
  displayName: 'navbar',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: [['@babel/preset-react', { runtime: 'automatic' }]] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/shared/ui/navbar',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    ...getModuleNameMapper('<rootDir>/../../../../'),
  },
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/*.stories.{ts,tsx}', '!**/index.{ts,tsx}'],
  clearMocks: true,
  restoreMocks: true,
}
