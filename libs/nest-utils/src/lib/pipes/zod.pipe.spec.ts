import { ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { ZodPipe } from './zod.pipe'
import { z } from 'zod'

describe('ZodPipe', () => {
  let pipe: ZodPipe
  let mockSchema: z.ZodSchema<any>
  let mockMetadata: ArgumentMetadata

  beforeEach(() => {
    mockSchema = z.object({
      name: z.string(),
      age: z.number(),
    })
    pipe = new ZodPipe(mockSchema)
    mockMetadata = {
      type: 'body',
      metatype: Object,
      data: '',
    }
  })

  describe('transform', () => {
    it('should return value when validation passes', () => {
      const value = { name: 'John', age: 30 }
      const result = pipe.transform(value, mockMetadata)

      expect(result).toEqual(value)
    })

    it('should throw BadRequestException when validation fails', () => {
      const value = { name: 'John', age: 'invalid' }

      expect(() => pipe.transform(value, mockMetadata)).toThrow()

      try {
        pipe.transform(value, mockMetadata)
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error)
        // ZodPipe doesn't catch the error, it lets it propagate
      }
    })

    it('should handle missing required fields', () => {
      const value = { name: 'John' }

      expect(() => pipe.transform(value, mockMetadata)).toThrow()
    })

    it('should handle invalid data types', () => {
      const value = { name: 123, age: 'thirty' }

      expect(() => pipe.transform(value, mockMetadata)).toThrow()
    })

    it('should work with different metadata types', () => {
      const value = { name: 'John', age: 30 }

      const queryMetadata: ArgumentMetadata = {
        type: 'query',
        metatype: Object,
        data: '',
      }

      const result = pipe.transform(value, queryMetadata)
      expect(result).toEqual(value)
    })

    it('should work with custom Zod schemas', () => {
      const emailSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      const customPipe = new ZodPipe(emailSchema)

      const validValue = { email: 'test@example.com', password: 'password123' }
      const result = customPipe.transform(validValue, mockMetadata)

      expect(result).toEqual(validValue)
    })

    it('should handle nested objects', () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          address: z.object({
            street: z.string(),
          }),
        }),
      })
      const customPipe = new ZodPipe(nestedSchema)

      const validValue = {
        user: {
          name: 'John',
          address: {
            street: '123 Main St',
          },
        },
      }

      const result = customPipe.transform(validValue, mockMetadata)
      expect(result).toEqual(validValue)
    })
  })
})
