/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'
import { defineConfig } from 'vite'

function getAliasesFromTsConfigPaths(tsconfigPath: string) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
  const paths = tsconfig.compilerOptions.paths || {}
  const aliases = {}

  for (const alias in paths) {
    // Remove trailing /* in alias key if present
    const key = alias.replace(/\/\*$/, '')
    // Take the first path and remove trailing /* if present
    const target = paths[alias][0].replace(/\/\*$/, '')
    aliases[key] = path.resolve(__dirname, '../../', target)
  }
  return aliases
}

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/my-ionic-app',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../../dist/apps/my-ionic-app',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: getAliasesFromTsConfigPaths(path.resolve(__dirname, '../../tsconfig.base.json')),
  },
})
