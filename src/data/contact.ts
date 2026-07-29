import "server-only";
import { createElement } from "react";

import type { ContactInquiry } from "@/app/(site)/contact/schema";
import { getResend } from "@/data/resend";
import { ContactAcknowledgementEmail } from "@/emails/contact-acknowledgement";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export type ContactDeliveryResult =
  | { ok: true }
  | { ok: false; reason: "delivery_failed" };

/**
 * Delivers a contact inquiry via Resend (internal notification + acknowledgement).
 * Auth is intentionally absent — this is a public contact channel. Abuse controls
 * (validation, honeypot, BotID, WAF) live at the Server Action boundary.
 */
export const deliverContactInquiry = async ({
  inquiry,
  submissionId,
}: {
  inquiry: ContactInquiry;
  submissionId: string;
}): Promise<ContactDeliveryResult> => {
  try {
    const { error } = await getResend().batch.send(
      [
        {
          from: `${SITE_NAME} <${CONTACT_EMAIL}>`,
          react: createElement(ContactNotificationEmail, {
            inquiry,
            submissionId,
          }),
          replyTo: inquiry.email,
          subject: `New contact inquiry — ${inquiry.inquiryType}`,
          to: [CONTACT_EMAIL],
        },
        {
          from: `${SITE_NAME} <${CONTACT_EMAIL}>`,
          react: createElement(ContactAcknowledgementEmail, {
            contactEmail: CONTACT_EMAIL,
            submissionId,
          }),
          subject: `We received your message — ${SITE_NAME}`,
          to: [inquiry.email],
        },
      ],
      { idempotencyKey: `batch-contact-form/${submissionId}` }
    );

    if (error) {
      console.error(
        "Contact delivery failed:",
        error.name,
        error.message,
        JSON.stringify(error)
      );
      return { ok: false, reason: "delivery_failed" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Contact delivery threw:", error);
    return { ok: false, reason: "delivery_failed" };
  }
};
