import { z } from "zod"

const envSchema = z.object({
	BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
	DATABASE_URL: z.string({ description: "Database URL is required" }).min(1),
	CHANNEL_KEY: z.string({ description: "Channel Key is required" }).min(1),
	WEBHOOK_LOGS_URL: z.string().url().optional(),
	GOOGLE_CLIENT_ID: z.string({ description: "Google Client ID is required" }).min(1),
	GOOGLE_CLIENT_SECRET: z.string({ description: "Google Client Secret is required" }).min(1),
	GOOGLE_REDIRECT_URI: z.string({ description: "Google Redirect URI is required" }).min(1),
	GOOGLE_CALENDAR_URL: z.string({ description: "Google Calendar URL is required" }).min(1),
	NODE_ENV: z.enum(['development', 'production']),
	// Env vars...
})

type EnvSchema = z.infer<typeof envSchema>

export { envSchema, type EnvSchema }
