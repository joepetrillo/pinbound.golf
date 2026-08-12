import { defineEnv } from "envin";
import { z } from "zod";

const env = defineEnv({
  client: {
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: z.url(),
  },
  clientPrefix: "NEXT_PUBLIC_",
  envStrict: {
    COMING_SOON_MODE: process.env.COMING_SOON_MODE,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_WORKOS_REDIRECT_URI:
      process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    VERCEL_ENV: process.env.VERCEL_ENV,
    WORKOS_API_KEY: process.env.WORKOS_API_KEY,
    WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
    WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
  },
  server: {
    COMING_SOON_MODE: z.stringbool().default(false),
    DATABASE_URL: z.url().startsWith("postgresql://"),
    RESEND_API_KEY: z.string().startsWith("re_"),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
    WORKOS_API_KEY: z.string().startsWith("sk_"),
    WORKOS_CLIENT_ID: z.string().startsWith("client_"),
    WORKOS_COOKIE_PASSWORD: z.string().min(32),
  },
});

export const isProductionComingSoon = (): boolean =>
  env.VERCEL_ENV === "production" && env.COMING_SOON_MODE;

export default env;
