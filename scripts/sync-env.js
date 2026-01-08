#!/usr/bin/env node

/**
 * Environment Variable Sync Script
 *
 * Syncs root .env file to app-specific directories for compatibility.
 * Expands variables using dotenv-expand so Next.js gets expanded values at build time.
 * This ensures Next.js and other tools that look for .env in their directories
 * can find the centralized configuration with variables already expanded.
 */

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const rootEnvPath = path.join(__dirname, '..', '.env')
const targetPaths = [
  path.join(__dirname, '..', 'apps', 'my-api', '.env'),
  path.join(__dirname, '..', 'apps', 'next-app', '.env'),
  path.join(__dirname, '..', 'libs', 'prisma', 'run_migrations', '.env'),
  path.join(__dirname, '..', 'deployments', 'my-api_next-app', '.env'),
]
/**
 * Expands environment variables in .env content
 * Preserves comments and formatting
 */
function expandEnvVars(envContent) {
  // Parse and expand variables
  const parsed = dotenv.parse(envContent)
  const expanded = dotenvExpand.expand({ parsed })

  if (!expanded.parsed) {
    return envContent
  }

  // Rebuild .env file with expanded values, preserving comments and structure
  const lines = envContent.split('\n')
  const result = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Preserve comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      result.push(line)
      continue
    }

    // Match KEY=VALUE pattern (case-insensitive to handle edge cases)
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/i)
    if (match) {
      const key = match[1]
      const originalValue = match[2]

      // Get expanded value
      const expandedValue = expanded.parsed[key]

      if (expandedValue !== undefined) {
        // Preserve inline comments if present
        const commentMatch = originalValue.match(/^([^#]*)(#.*)?$/)
        if (commentMatch && commentMatch[2]) {
          result.push(`${key}=${expandedValue}${commentMatch[2]}`)
        } else {
          result.push(`${key}=${expandedValue}`)
        }
      } else {
        result.push(line)
      }
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

function syncEnv() {
  if (!fs.existsSync(rootEnvPath)) {
    console.error(`❌ Root .env file not found at: ${rootEnvPath}`)
    console.error('   Please create a .env file in the project root first.')
    process.exit(1)
  }

  const rootEnvContent = fs.readFileSync(rootEnvPath, 'utf-8')

  // Expand variables for syncing
  let expandedContent
  try {
    expandedContent = expandEnvVars(rootEnvContent)
  } catch (error) {
    console.warn('⚠️  Warning: Could not expand variables, syncing raw content:', error.message)
    expandedContent = rootEnvContent
  }

  let syncedCount = 0

  targetPaths.forEach((targetPath) => {
    const targetDir = path.dirname(targetPath)

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // Only sync if content is different
    let shouldSync = true
    if (fs.existsSync(targetPath)) {
      const existingContent = fs.readFileSync(targetPath, 'utf-8')
      if (existingContent === expandedContent) {
        shouldSync = false
      }
    }

    if (shouldSync) {
      fs.writeFileSync(targetPath, expandedContent, 'utf-8')
      console.log(`✅ Synced to: ${path.relative(process.cwd(), targetPath)}`)
      syncedCount++
    } else {
      console.log(`⏭️  Already synced: ${path.relative(process.cwd(), targetPath)}`)
    }
  })

  if (syncedCount > 0) {
    console.log(`\n✨ Synced ${syncedCount} environment file(s) from root .env`)
    console.log(`   Variables have been expanded for compatibility.`)
  } else {
    console.log(`\n✨ All environment files are already in sync`)
  }
}

// Run sync
syncEnv()
