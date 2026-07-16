"use server";

import { randomUUID } from "node:crypto";

import { createElement } from "react";
import { Resend } from "resend";

import { ContactAcknowledgementEmail } from "@/emails/contact-acknowledgement";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

import { contactFormSchema } from "./schema";
import type {
  ContactFieldName,
  ContactFormDraft,
  ContactFormState,
} from "./schema";

const FIELD_NAMES: readonly ContactFieldName[] = [
  "name",
  "email",
  "courseOrCompany",
  "inquiryType",
  "teeSheetProvider",
  "phone",
  "message",
] as const;

// Visually hidden honeypot field. A filled value means an automated
// submission: report success without delivering anything.
const HONEYPOT_FIELD = "website";

const readDraft = (formData: FormData): ContactFormDraft => {
  const draft: ContactFormDraft = {};
  for (const field of FIELD_NAMES) {
    const value = formData.get(field);
    if (typeof value === "string") {
      draft[field] = value;
    }
  }
  return draft;
};

// Public contact form; intentionally unauthenticated. Abuse is limited by
// validation, the honeypot, the fixed acknowledgement, and the WAF rate limit.
// oxlint-disable-next-line react-doctor/server-auth-actions
export const submitContactInquiry = async (
  _previousState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> => {
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { status: "success", submissionId: randomUUID() };
  }

  const draft = readDraft(formData);
  const parsed = contactFormSchema.safeParse(draft);
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { fieldErrors, status: "invalid", values: draft };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.CONTACT_FROM_EMAIL;
  const toAddress = process.env.CONTACT_TO_EMAIL;
  if (!(apiKey && fromAddress && toAddress)) {
    // Fail closed with a retryable state; never expose configuration details.
    return { status: "failed", values: draft };
  }

  const {
    courseOrCompany,
    email,
    inquiryType,
    message,
    name,
    phone,
    teeSheetProvider,
  } = parsed.data;
  const submissionId = randomUUID();
  const resend = new Resend(apiKey);

  const { error } = await resend.batch.send(
    [
      {
        from: fromAddress,
        react: createElement(ContactNotificationEmail, {
          courseOrCompany,
          email,
          inquiryType,
          message,
          name,
          phone,
          submissionId,
          teeSheetProvider,
        }),
        replyTo: email,
        subject: `New contact inquiry — ${inquiryType}`,
        to: [toAddress],
      },
      {
        from: fromAddress,
        react: createElement(ContactAcknowledgementEmail, {
          contactEmail: CONTACT_EMAIL,
          submissionId,
        }),
        subject: `We received your message — ${SITE_NAME}`,
        to: [email],
      },
    ],
    { idempotencyKey: `batch-contact-form/${submissionId}` }
  );

  if (error) {
    return { status: "failed", values: draft };
  }

  return { status: "success", submissionId };
};
