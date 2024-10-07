import { PROVIDERS_ARRAY } from '@js-monorepo/types'
import * as z from 'zod'

class RegisterUserSchemaConfig {
  private readonly MIN_VALUE = 4

  private readonly MAX_VALUE = 16

  public readonly MIN_ERROR_MESSAGE = `Username must be at least ${this.MIN_VALUE} characters long.`

  public readonly MAX_ERROR_MESSAGE = `Username cannot exceed ${this.MAX_VALUE} characters.`

  public readonly MAX_ERROR_REGEX = `Username must not contain special characters`

  /* eslint-disable */
  createSchema() {
    return z.object({
      username: z
        .string()
        .min(this.MIN_VALUE, { message: this.MIN_ERROR_MESSAGE })
        .max(this.MAX_VALUE, { message: this.MAX_ERROR_MESSAGE })
        .regex(/^[^\s!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/\\]+$/, {
          message: this.MAX_ERROR_REGEX,
        }),
    })
  }

  updateSchema() {
    return z
      .object({
        username: z
          .string()
          .min(this.MIN_VALUE, { message: this.MIN_ERROR_MESSAGE })
          .max(this.MAX_VALUE, { message: this.MAX_ERROR_MESSAGE })
          .regex(/^[^\s!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/\\]+$/, {
            message: this.MAX_ERROR_REGEX,
          })
          .optional(),
        roles: z.array(ObjectIdSchema).optional(),
      })
      .refine(
        (data) => data.username || (data.roles && data.roles.length > 0),
        {
          message: "At least one of 'username' or 'roles' must be provided.",
        }
      )
  }
}

const ObjectIdSchema = z.object({
  id: z.number(),
})

export const registerUserSchemaConfig = new RegisterUserSchemaConfig()

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
  profileImage: z
    .string()
    .url({ message: 'Profile image must be a valid URL.' })
    .nullable()
    .optional(),
})
