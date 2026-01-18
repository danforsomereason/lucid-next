import { defineConfig } from 'drizzle-kit'

if (process.env.DATABASE_URL == null) {
  throw new Error('DATABASE_URL is not set')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './emptySchema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
})
