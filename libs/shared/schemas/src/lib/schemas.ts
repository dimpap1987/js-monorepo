import * as z from 'zod'

export const RegisterUserSchema = z.object({
  email: z.string().email({ message: 'Email is required' }),
  username: z
    .string()
    .min(6, { message: 'The minimum length should be 6 letters' }),
  uuid: z.string().min(1, { message: 'Invalid identifier' }),
})

export type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>
