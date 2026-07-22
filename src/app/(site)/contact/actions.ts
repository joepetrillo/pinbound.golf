"use server";

import { randomUUID } from "node:crypto";

import { checkBotId } from "botid/server";
import { createElement } from "react";

import {
  CONTACT_FIELD_NAMES,
  CONTACT_OPERATION_ID_FIELD,
  contactFormSchema,
  contactOperationIdSchema,
} from "@/app/(site)/contact/schema";
import type {
  ContactFormDraft,
  ContactFormState,
  ContactInquiry,
} from "@/app/(site)/contact/schema";
import { ContactAcknowledgementEmail } from "@/emails/contact-acknowledgement";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import { getResend } from "@/lib/resend";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

// Visually hidden honeypot field. A filled value means an automated
// submission: report success without delivering anything.
const HONEYPOT_FIELD = "website";

const readDraft = (formData: FormData): ContactFormDraft => {
  const draft: ContactFormDraft = {};
  for (const field of CONTACT_FIELD_NAMES) {
    const value = formData.get(field);
    if (typeof value === "string") {
      draft[field] = value;
    }
  }
  return draft;
};

const inquiriesMatch = (
  first: ContactInquiry,
  second: ContactInquiry
): boolean =>
  CONTACT_FIELD_NAMES.every((field) => first[field] === second[field]);

const readSubmittedOperationId = (formData: FormData): string | undefined => {
  const parsed = contactOperationIdSchema.safeParse(
    formData.get(CONTACT_OPERATION_ID_FIELD)
  );
  return parsed.success ? parsed.data : undefined;
};

const operationIdFor = (
  previousState: ContactFormState,
  formData: FormData,
  inquiry: ContactInquiry
): string => {
  const submittedOperationId = readSubmittedOperationId(formData);
  if (previousState.status !== "failed") {
    return submittedOperationId ?? randomUUID();
  }

  const previousOperationId = contactOperationIdSchema.safeParse(
    previousState.operationId
  );
  const previousInquiry = contactFormSchema.safeParse(previousState.values);
  const isIdenticalRetry =
    previousOperationId.success &&
    previousInquiry.success &&
    inquiriesMatch(previousInquiry.data, inquiry);

  if (isIdenticalRetry) {
    return previousOperationId.data;
  }

  if (
    submittedOperationId &&
    (!previousOperationId.success ||
      submittedOperationId !== previousOperationId.data)
  ) {
    return submittedOperationId;
  }

  return randomUUID();
};

const failedState = (
  values: ContactFormDraft,
  operationId: string
): ContactFormState => ({ operationId, status: "failed", values });

// Public contact form; intentionally unauthenticated. Abuse is limited by
// validation, the honeypot, the fixed acknowledgement, and the WAF rate limit.
// oxlint-disable-next-line react-doctor/server-auth-actions
export const submitContactInquiry = async (
  previousState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> => {
  const draft = readDraft(formData);
  const parsed = contactFormSchema.safeParse(draft);
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { fieldErrors, status: "invalid", values: draft };
  }

  const inquiry = parsed.data;
  const operationId = operationIdFor(previousState, formData, inquiry);
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { status: "success", submissionId: operationId };
  }

  try {
    const verification = await checkBotId({
      advancedOptions: { checkLevel: "basic" },
      developmentOptions: { bypass: "HUMAN" },
    });
    if (verification.isBot) {
      return { status: "success", submissionId: operationId };
    }
  } catch {
    return failedState(draft, operationId);
  }

  try {
    const { error } = await getResend().batch.send(
      [
        {
          from: `${SITE_NAME} <${CONTACT_EMAIL}>`,
          react: createElement(ContactNotificationEmail, {
            inquiry,
            submissionId: operationId,
          }),
          replyTo: inquiry.email,
          subject: `New contact inquiry — ${inquiry.inquiryType}`,
          to: [CONTACT_EMAIL],
        },
        {
          from: `${SITE_NAME} <${CONTACT_EMAIL}>`,
          react: createElement(ContactAcknowledgementEmail, {
            contactEmail: CONTACT_EMAIL,
            submissionId: operationId,
          }),
          subject: `We received your message — ${SITE_NAME}`,
          to: [inquiry.email],
        },
      ],
      { idempotencyKey: `batch-contact-form/${operationId}` }
    );

    if (error) {
      return failedState(draft, operationId);
    }
  } catch {
    return failedState(draft, operationId);
  }

  return { status: "success", submissionId: operationId };
};
