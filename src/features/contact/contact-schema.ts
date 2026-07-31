import { isValidPhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";

// Canonical contract shared by form validation, the safe action, delivery, and
// notification rendering. Presentation and Privacy copy still need deliberate
// review when a field changes.

export const INQUIRY_TYPES = [
  "Product question",
  "Tee-sheet integration",
  "Partnership",
  "Support",
  "Other",
] as const;

export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const COURSE_MAX_LENGTH = 150;
export const TEE_SHEET_MAX_LENGTH = 100;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 2000;

export const HONEYPOT_FIELD = "website" as const;

export const contactFormSchema = z.object({
  courseOrCompany: z
    .string()
    .trim()
    .min(1, "Enter your course or company name.")
    .max(
      COURSE_MAX_LENGTH,
      `Course or company must be ${COURSE_MAX_LENGTH} characters or fewer.`
    ),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .max(EMAIL_MAX_LENGTH, "Enter a valid email address.")
    .pipe(z.email("Enter a valid email address.")),
  inquiryType: z.enum(INQUIRY_TYPES, "Choose an inquiry type."),
  message: z
    .string()
    .trim()
    .min(
      MESSAGE_MIN_LENGTH,
      `Enter at least ${MESSAGE_MIN_LENGTH} characters so we have enough context to help.`
    )
    .max(
      MESSAGE_MAX_LENGTH,
      `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`
    ),
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(
      NAME_MAX_LENGTH,
      `Name must be ${NAME_MAX_LENGTH} characters or fewer.`
    ),
  // Blank stays optional; otherwise require a real E.164 number from PhoneInput.
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    })
    .optional(),
  teeSheetProvider: z
    .string()
    .trim()
    .max(
      TEE_SHEET_MAX_LENGTH,
      `Tee-sheet provider must be ${TEE_SHEET_MAX_LENGTH} characters or fewer.`
    )
    .optional(),
});

/** Client form values: inquiry fields + honeypot. */
export const contactClientSchema = contactFormSchema.extend({
  [HONEYPOT_FIELD]: z.string().optional(),
});

/** Server action input: client values + idempotency key. */
export const contactActionSchema = contactClientSchema.extend({
  operationId: z.uuid(),
});

export const contactActionResultSchema = z.object({
  submissionId: z.uuid(),
});

export const CONTACT_FIELD_NAMES = contactFormSchema.keyof().options;

export type ContactInquiry = z.output<typeof contactFormSchema>;
export type ContactClientValues = z.input<typeof contactClientSchema>;
export type ContactActionInput = z.input<typeof contactActionSchema>;
export type ContactFieldName = keyof ContactInquiry;
