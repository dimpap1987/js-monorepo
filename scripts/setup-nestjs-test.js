#!/usr/bin/env node

/**
 * Script to scaffold a test file for a NestJS class (service, guard, pipe, decorator, etc.)
 *
 * Usage:
 *   node scripts/setup-nestjs-test.js <file-path>
 *
 * Example:
 *   node scripts/setup-nestjs-test.js libs/auth/nest/src/session/guards/login.guard.ts
 */

const fs = require('fs')
const path = require('path')

const filePath = process.argv[2]

if (!filePath) {
  console.error('❌ Error: Please provide a file path')
  console.log('Usage: node scripts/setup-nestjs-test.js <file-path>')
  console.log('Example: node scripts/setup-nestjs-test.js libs/auth/nest/src/session/guards/login.guard.ts')
  process.exit(1)
}

const fullPath = path.resolve(filePath)

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Error: File not found: ${fullPath}`)
  process.exit(1)
}

// Read the source file to extract class name and imports
const sourceContent = fs.readFileSync(fullPath, 'utf-8')
const fileName = path.basename(fullPath, '.ts')
const testFileName = `${fileName}.spec.ts`
const testFilePath = path.join(path.dirname(fullPath), testFileName)

if (fs.existsSync(testFilePath)) {
  console.log(`⚠️  Test file already exists: ${testFilePath}`)
  console.log('Skipping...')
  process.exit(0)
}

// Extract class name from the file
const classMatch = sourceContent.match(/export\s+(?:class|function)\s+(\w+)/)
const className = classMatch ? classMatch[1] : fileName

// Determine what type of NestJS component it is
let componentType = 'class'
if (sourceContent.includes('implements CanActivate')) {
  componentType = 'guard'
} else if (sourceContent.includes('implements PipeTransform')) {
  componentType = 'pipe'
} else if (sourceContent.includes('@Injectable()')) {
  componentType = 'service'
} else if (sourceContent.includes('export function')) {
  componentType = 'decorator'
}

// Generate test file content based on component type
let testContent = ''

if (componentType === 'guard') {
  testContent = `import { ExecutionContext } from '@nestjs/common'
import { ${className} } from './${fileName}'

describe('${className}', () => {
  let guard: ${className}
  let mockExecutionContext: jest.Mocked<ExecutionContext>

  beforeEach(() => {
    guard = new ${className}()
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          isAuthenticated: jest.fn(),
          user: {},
        }),
      }),
    } as any
  })

  describe('canActivate', () => {
    it('should return true when user is authenticated', () => {
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated.mockReturnValue(true)

      const result = guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
    })

    it('should throw error when user is not authenticated', () => {
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated.mockReturnValue(false)

      expect(() => guard.canActivate(mockExecutionContext)).toThrow()
    })
  })
})
`
} else if (componentType === 'pipe') {
  testContent = `import { ArgumentMetadata } from '@nestjs/common'
import { ${className} } from './${fileName}'

describe('${className}', () => {
  let pipe: ${className}
  let mockSchema: any
  let mockMetadata: ArgumentMetadata

  beforeEach(() => {
    mockSchema = {
      parse: jest.fn().mockReturnValue({}),
    }
    pipe = new ${className}(mockSchema)
    mockMetadata = {
      type: 'body',
      metatype: Object,
      data: '',
    }
  })

  describe('transform', () => {
    it('should parse value using schema', () => {
      const value = { test: 'data' }
      const result = pipe.transform(value, mockMetadata)

      expect(mockSchema.parse).toHaveBeenCalledWith(value)
      expect(result).toEqual(value)
    })

    it('should throw error when schema validation fails', () => {
      const value = { invalid: 'data' }
      const error = new Error('Validation failed')
      mockSchema.parse.mockImplementation(() => {
        throw error
      })

      expect(() => pipe.transform(value, mockMetadata)).toThrow(error)
    })
  })
})
`
} else if (componentType === 'service') {
  testContent = `import { Test, TestingModule } from '@nestjs/testing'
import { ${className} } from './${fileName}'

describe('${className}', () => {
  let service: ${className}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [${className}],
    }).compile()

    service = module.get<${className}>(${className})
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // Add more tests based on service methods
})
`
} else if (componentType === 'decorator') {
  testContent = `import { ${className} } from './${fileName}'

describe('${className}', () => {
  let mockTarget: any
  let mockPropertyKey: string
  let mockDescriptor: PropertyDescriptor

  beforeEach(() => {
    mockTarget = {
      constructor: { name: 'TestClass' },
    }
    mockPropertyKey = 'testMethod'
    mockDescriptor = {
      value: jest.fn(),
    }
  })

  it('should be defined', () => {
    expect(${className}).toBeDefined()
  })

  // Add more tests based on decorator behavior
})
`
} else {
  testContent = `import { ${className} } from './${fileName}'

describe('${className}', () => {
  it('should be defined', () => {
    expect(${className}).toBeDefined()
  })

  // Add more tests based on class behavior
})
`
}

// Write test file
fs.writeFileSync(testFilePath, testContent, 'utf-8')

console.log(`✅ Created test file: ${testFilePath}`)
console.log(`📝 Component type detected: ${componentType}`)
console.log(`📝 Class name: ${className}`)
console.log(`\n🎉 Test file scaffolded successfully!`)
console.log(`\n📝 Next steps:`)
console.log(`1. Review and update the test file`)
console.log(`2. Add tests for all methods and edge cases`)
console.log(`3. Run tests: nx test <project-name>`)
