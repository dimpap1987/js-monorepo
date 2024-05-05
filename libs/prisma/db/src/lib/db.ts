import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  // eslint-disable-next-line no-var
  var authClient: undefined | ReturnType<typeof prismaClientSingleton>
}

const authClient = globalThis.authClient ?? prismaClientSingleton()

export { authClient }

if (process.env.NODE_ENV !== 'production') globalThis.authClient = authClient
