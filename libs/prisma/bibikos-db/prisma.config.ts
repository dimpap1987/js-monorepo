import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './src/lib/prisma/schema',
  migrations: {
    path: './src/lib/prisma/migrations',
  },
  datasource: {
    url: process.env.BIBIKOS_DATABASE_URL,
  },
})
