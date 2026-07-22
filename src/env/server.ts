import "server-only";
import env from "@/env.config";

export const isProductionComingSoon = (): boolean =>
  env.VERCEL_ENV === "production" && env.COMING_SOON_MODE;

export const workOSIsConfigured = (): boolean =>
  env.NEXT_PUBLIC_WORKOS_REDIRECT_URI !== undefined &&
  env.WORKOS_API_KEY !== undefined &&
  env.WORKOS_CLIENT_ID !== undefined &&
  env.WORKOS_COOKIE_PASSWORD !== undefined;
