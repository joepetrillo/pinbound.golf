"use server";

import { checkBotId } from "botid/server";
import { returnServerError } from "next-safe-action";

import { deliverContactInquiry } from "@/features/contact/contact-delivery";
import {
  contactActionResultSchema,
  contactActionSchema,
  contactFormSchema,
  HONEYPOT_FIELD,
} from "@/features/contact/contact-schema";
import { actionClient } from "@/lib/safe-action";

const DELIVERY_FAILED_MESSAGE =
  "Your message could not be sent. Please try again in a moment.";

// Public contact form; intentionally unauthenticated. Abuse is limited by
// validation, the honeypot, BotID, the fixed acknowledgement, and the WAF
// rate limit.
export const submitContactInquiry = actionClient
  .inputSchema(contactActionSchema)
  .outputSchema(contactActionResultSchema)
  .action(async ({ parsedInput }) => {
    const { [HONEYPOT_FIELD]: honeypot, operationId, ...fields } = parsedInput;
    const inquiry = contactFormSchema.parse(fields);

    // Visually hidden honeypot. A filled value means an automated submission:
    // report success without delivering anything.
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return { submissionId: operationId };
    }

    try {
      const verification = await checkBotId({
        advancedOptions: { checkLevel: "basic" },
        developmentOptions: { bypass: "HUMAN" },
      });
      if (verification.isBot) {
        return { submissionId: operationId };
      }
    } catch (error) {
      console.error("BotID check failed:", error);
      returnServerError(DELIVERY_FAILED_MESSAGE);
    }

    const delivery = await deliverContactInquiry({
      inquiry,
      submissionId: operationId,
    });

    if (!delivery.ok) {
      // deliverContactInquiry already logged the underlying cause.
      returnServerError(DELIVERY_FAILED_MESSAGE);
    }

    return { submissionId: operationId };
  });
