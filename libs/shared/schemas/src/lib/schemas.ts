import * as z from 'zod'

class RegisterUserSchemaConfig {
  private readonly MIN_VALUE = 4

  private readonly MAX_VALUE = 16

  public readonly MIN_ERROR_MESSAGE = `Username must be at least ${this.MIN_VALUE} characters long.`

  public readonly MAX_ERROR_MESSAGE = `Username cannot exceed ${this.MAX_VALUE} characters.`

  public readonly MAX_ERROR_REGEX = `Username must not contain special characters`

  /* eslint-disable */
  getSchema() {
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
}

export const registerUserSchemaConfig = new RegisterUserSchemaConfig()

export const RegisterUserSchema = registerUserSchemaConfig.getSchema()

export type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>

//EventSchema
export const EventSchema = z.object({
  channel: z.string(),
  data: z.any(),
  type: z.enum(['announcement', 'notification']),
})

export type EventSchemaType = z.infer<typeof EventSchema>
