import fs from 'fs'
import path from 'path'

export interface DocEntry {
  path: string
  data: string
  module: string
}

// When running inside the docs app, process.cwd() points to apps/docs.
// The workspace root is two levels up: ../../
const WORKSPACE_ROOT = path.resolve(process.cwd(), '..', '..')
const LIBS_DIR = path.join(WORKSPACE_ROOT, 'libs')

let cache: DocEntry[] | null = null

function walkForReadmes(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return walkForReadmes(fullPath)
    }

    if (entry.isFile() && entry.name.toLowerCase() === 'readme.md') {
      return [fullPath]
    }

    return []
  })
}

function buildModuleSlugFromPath(readmePath: string): { module: string; relDir: string } {
  const dir = path.dirname(readmePath)
  const relDir = path.relative(WORKSPACE_ROOT, dir) // e.g. libs/shared/ui/button

  const withoutLibsPrefix = relDir.startsWith(`libs${path.sep}`) ? relDir.slice(`libs${path.sep}`.length) : relDir

  // Create a stable, unique slug like "shared-ui-button"
  const moduleSlug = withoutLibsPrefix.split(path.sep).join('-')

  return { module: moduleSlug, relDir }
}

export async function getDocs(): Promise<DocEntry[]> {
  if (cache) {
    return cache
  }

  if (!fs.existsSync(LIBS_DIR)) {
    cache = []
    return cache
  }

  const readmeFiles = walkForReadmes(LIBS_DIR)

  const docs: DocEntry[] = readmeFiles.map((fullPath) => {
    const data = fs.readFileSync(fullPath, 'utf8')
    const { module, relDir } = buildModuleSlugFromPath(fullPath)

    return {
      path: relDir,
      data,
      module,
    }
  })

  // Keep navigation stable by sorting alphabetically by module slug
  docs.sort((a, b) => a.module.localeCompare(b.module))

  cache = docs
  return docs
}

export async function getDocByModule(module: string): Promise<DocEntry | undefined> {
  const docs = await getDocs()
  return docs.find((doc) => doc.module === module)
}
