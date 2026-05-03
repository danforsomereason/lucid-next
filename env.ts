import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  CLOUDINARY_KEY: z.string(),
  CLOUDINARY_SECRET: z.string(),
  CLOUDINARY_NAME: z.string(),
})

const env = envSchema.parse(process.env)
export default env