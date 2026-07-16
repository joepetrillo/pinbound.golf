import { z } from "zod";

// The contact form, this schema, the two email templates, and the Privacy
// disclosure are one data contract: adding a field here requires updating all
// of them together.

export const INQUIRY_TYPES = [
  "Product question",
  "Tee-sheet integration",
  "Partnership",
  "Support",
  "Other",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const COURSE_MAX_LENGTH = 150;
export const TEE_SHEET_MAX_LENGTH = 100;
export const PHONE_MAX_LENGTH = 30;
export const MESSAGE_MAX_LENGTH = 2000;

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
    .min(1, "Enter a message.")
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
  phone: z
    .string()
    .trim()
    .max(PHONE_MAX_LENGTH, "Enter a shorter phone number.")
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

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export type ContactFieldName = keyof ContactFormValues;

export type ContactFieldErrors = Partial<Record<ContactFieldName, string[]>>;

// Raw values echoed back to the submitting client so a failed submission does
// not wipe the form. They are never logged or sent anywhere else.
export type ContactFormDraft = Partial<Record<ContactFieldName, string>>;

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; submissionId: string }
  | {
      status: "invalid";
      fieldErrors: ContactFieldErrors;
      values: ContactFormDraft;
    }
  | { status: "failed"; values: ContactFormDraft };

export const CONTACT_FORM_IDLE_STATE: ContactFormState = { status: "idle" };
