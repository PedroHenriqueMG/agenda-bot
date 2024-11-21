import { z } from "zod"

const envSchema = z.object({
	BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
	DATABASE_URL: z.string({ description: "Database URL is required" }).min(1),
	CHANNEL_KEY: z.string({ description: "Channel Key is required" }).min(1),
	WEBHOOK_LOGS_URL: z.string().url().optional(),
	// Env vars...
})

type EnvSchema = z.infer<typeof envSchema>

export { envSchema, type EnvSchema }
