'use server'

import {
  RegisterUserSchema,
  RegisterUserSchemaType,
} from '@js-monorepo/schemas'

export type RegisterUserReponseType = {
  message?: string
  error?: string
}

export default async function registerUser(
  values: RegisterUserSchemaType
): Promise<RegisterUserReponseType> {
  const validatedFields = RegisterUserSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      error: JSON.stringify(validatedFields.error.flatten().fieldErrors),
    }
  }

  //   if (true) {
  //     return { error: 'Email already in use!' }
  //   }

  // else signIn ?

  console.log(validatedFields.data)
  // Save in DB

  return { message: 'Successfully registered' }
}
