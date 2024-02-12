import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  // eslint-disable-next-line no-var
  var dbClient: undefined | ReturnType<typeof prismaClientSingleton>
}

const dbClient = globalThis.dbClient ?? prismaClientSingleton()

export { dbClient }

if (process.env.NODE_ENV !== 'production') globalThis.dbClient = dbClient
