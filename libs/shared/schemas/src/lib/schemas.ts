import { PROVIDERS_ARRAY } from '@js-monorepo/types'
import * as z from 'zod'

class RegisterUserSchemaConfig {
  public readonly MIN_VALUE = 4

  public readonly MAX_VALUE = 16

  public readonly MIN_ERROR_MESSAGE = `Username must be at least ${this.MIN_VALUE} characters long.`

  public readonly MAX_ERROR_MESSAGE = `Username cannot exceed ${this.MAX_VALUE} characters.`

  public readonly MAX_ERROR_REGEX = `Username must not contain special characters`

  /* eslint-disable */
  createSchema() {
    return z.object({
      username: UsernameSchema,
    })
  }

  updateSchema() {
    return z
      .object({
        username: UsernameSchema.optional(),
        roles: z.array(ObjectIdSchema).optional(),
      })
      .refine((data) => data.username || (data.roles && data.roles.length > 0), {
        message: "At least one of 'username' or 'roles' must be provided.",
      })
  }
}

const ObjectIdSchema = z.object({
  id: z.number(),
})

export const registerUserSchemaConfig = new RegisterUserSchemaConfig()

export const UsernameSchema = z
  .string()
  .min(registerUserSchemaConfig.MIN_VALUE, {
    message: registerUserSchemaConfig.MIN_ERROR_MESSAGE,
  })
  .max(registerUserSchemaConfig.MAX_VALUE, {
    message: registerUserSchemaConfig.MAX_ERROR_MESSAGE,
  })
  // eslint-disable-next-line no-useless-escape
  .regex(/^[^\s!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/\\]+$/, {
    message: 'Username contains invalid characters.',
  })

export const RegisterUserSchema = registerUserSchemaConfig.createSchema()

export const UserUpdateUserSchema = registerUserSchemaConfig.updateSchema()

export type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>

export const CreateUnregisteredUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  provider: z
    .enum(PROVIDERS_ARRAY, {
      description: 'Provider must be one of: GITHUB, GOOGLE, FACEBOOK.',
    })
    .nullable()
    .optional(),
  profileImage: z.string().url({ message: 'Profile image must be a valid URL.' }).nullable().optional(),
})

export const EditUserSchema = z
  .object({
    username: UsernameSchema.optional(),
    profileImage: z.string().optional(),
  })
  .refine((data) => data.username !== undefined || data.profileImage !== undefined, {
    message: 'At least one of "username" or "profileImage" must be provided.',
    path: [], // Applies to the entire object
  })
