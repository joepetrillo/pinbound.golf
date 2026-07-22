import "server-only";
import { Resend } from "resend";

import env from "@/env.config";

let resendClient: Resend | undefined;

export const getResend = (): Resend => {
  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
};
