import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
}
