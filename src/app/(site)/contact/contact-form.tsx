"use client";

import { RiCheckLine, RiErrorWarningLine } from "@remixicon/react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

import { submitContactInquiry } from "@/app/(site)/contact/actions";
import {
  CONTACT_FIELD_NAMES,
  CONTACT_FORM_IDLE_STATE,
  CONTACT_OPERATION_ID_FIELD,
  COURSE_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  INQUIRY_TYPES,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  TEE_SHEET_MAX_LENGTH,
} from "@/app/(site)/contact/schema";
import type {
  ContactFieldName,
  ContactFormState,
} from "@/app/(site)/contact/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useResetOnHide } from "@/hooks/use-reset-on-hide";
import { CONTACT_EMAIL, MARKETING_HOME_HREF } from "@/lib/site";
import { cn } from "@/lib/utils";

// Client wrapper so Activity hide can reset without a server round-trip.
const contactFormAction = (
  previousState: ContactFormState,
  payload: FormData | null
): Promise<ContactFormState> => {
  if (payload === null) {
    switch (previousState.status) {
      case "success": {
        // Fresh form next visit — the submission already finished.
        return Promise.resolve(CONTACT_FORM_IDLE_STATE);
      }
      case "invalid":
      case "failed": {
        // Drop feedback, keep field values so the uncontrolled form key stays
        // stable and Activity does not remount an empty draft.
        return Promise.resolve({
          status: "idle",
          values: previousState.values,
        });
      }
      case "idle": {
        return Promise.resolve(previousState);
      }
      default: {
        const _exhaustive: never = previousState;
        return _exhaustive;
      }
    }
  }
  return submitContactInquiry(previousState, payload);
};

interface ContactAttempt {
  operationId: string;
  payloadFingerprint: string;
}

const payloadFingerprintOf = (formData: FormData): string =>
  JSON.stringify(
    CONTACT_FIELD_NAMES.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value.trim() : null];
    })
  );

const draftValuesOf = (state: ContactFormState) => {
  switch (state.status) {
    case "idle": {
      return state.values;
    }
    case "invalid":
    case "failed": {
      return state.values;
    }
    case "success": {
      return;
    }
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
};

const fieldErrorsOf = (state: ContactFormState, field: ContactFieldName) =>
  state.status === "invalid"
    ? state.fieldErrors[field]?.map((message) => ({ message }))
    : undefined;

const draftValue = (state: ContactFormState, field: ContactFieldName) =>
  draftValuesOf(state)?.[field];

const formKeyOf = (state: ContactFormState) => {
  const values = draftValuesOf(state);
  return values ? JSON.stringify(values) : state.status;
};

const operationIdOf = (state: ContactFormState) =>
  state.status === "failed" ? state.operationId : undefined;

const ContactFormStatus = ({ state }: { state: ContactFormState }) => {
  if (state.status === "failed") {
    return (
      <Alert
        variant="destructive"
        className="border-destructive/25 bg-destructive/5"
      >
        <RiErrorWarningLine />
        <AlertTitle>Your message could not be sent</AlertTitle>
        <AlertDescription>
          Please try again in a moment, or email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </AlertDescription>
      </Alert>
    );
  }

  if (state.status === "invalid") {
    return (
      <Alert
        variant="destructive"
        className="border-destructive/25 bg-destructive/5"
      >
        <RiErrorWarningLine />
        <AlertTitle>
          Please fix the highlighted fields and try again.
        </AlertTitle>
      </Alert>
    );
  }

  return null;
};

const ContactFormActions = ({ pending }: { pending: boolean }) => (
  <Field className="flex-wrap gap-4" orientation="horizontal">
    <Button
      aria-busy={pending || undefined}
      disabled={pending}
      size="lg"
      type="submit"
    >
      <span className="inline-grid grid-cols-1 grid-rows-1 place-items-center">
        <span
          aria-hidden={pending || undefined}
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5",
            pending && "invisible"
          )}
        >
          Send
        </span>
        <span
          aria-hidden={!pending || undefined}
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5",
            !pending && "invisible"
          )}
        >
          <Spinner data-icon="inline-start" />
          Sending…
        </span>
      </span>
    </Button>
    <FieldDescription>
      See how we handle your details in our{" "}
      <Link href="/privacy">privacy notice</Link>.
    </FieldDescription>
  </Field>
);

export const ContactForm = () => {
  const [state, formAction, pending] = useActionState(
    contactFormAction,
    CONTACT_FORM_IDLE_STATE
  );
  const id = useId();
  const attemptRef = useRef<ContactAttempt | null>(null);
  const shouldResetRef = useRef(false);

  useLayoutEffect(() => {
    if (
      state.status === "success" ||
      state.status === "invalid" ||
      state.status === "failed"
    ) {
      shouldResetRef.current = true;
    }
  }, [state.status]);

  useResetOnHide(() => {
    if (!shouldResetRef.current) {
      return;
    }
    shouldResetRef.current = false;
    attemptRef.current = null;
    startTransition(() => {
      formAction(null);
    });
  });

  const handleAction = (formData: FormData) => {
    const payloadFingerprint = payloadFingerprintOf(formData);
    const previousAttempt = attemptRef.current;
    const operationId =
      previousAttempt?.payloadFingerprint === payloadFingerprint
        ? previousAttempt.operationId
        : globalThis.crypto.randomUUID();

    attemptRef.current = { operationId, payloadFingerprint };
    formData.set(CONTACT_OPERATION_ID_FIELD, operationId);
    formAction(formData);
  };

  if (state.status === "success") {
    return (
      <div aria-live="polite" className="rounded-4xl border bg-card p-8">
        <h2 className="flex items-center gap-2 text-xl font-medium text-balance">
          <RiCheckLine aria-hidden className="size-5 shrink-0" />
          Message Sent
        </h2>
        <p className="mt-3 leading-relaxed text-balance text-muted-foreground">
          Thanks for reaching out. Your message is on its way to our team, and a
          confirmation is on its way to your inbox. We will follow up by email.
        </p>
        <div className="mt-6">
          <Link
            className={cn(buttonVariants({ variant: "outline" }))}
            href={MARKETING_HOME_HREF}
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    );
  }

  const invalid = (field: ContactFieldName) =>
    state.status === "invalid" && Boolean(state.fieldErrors[field]?.length);

  const errorId = (field: ContactFieldName) => `${id}-${field}-error`;

  const describedBy = (field: ContactFieldName) =>
    invalid(field) ? errorId(field) : undefined;

  return (
    <form action={handleAction} key={formKeyOf(state)} noValidate>
      <input
        defaultValue={operationIdOf(state)}
        name={CONTACT_OPERATION_ID_FIELD}
        type="hidden"
      />
      <FieldGroup>
        <Field data-invalid={invalid("name") || undefined}>
          <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
          <Input
            aria-describedby={describedBy("name")}
            aria-invalid={invalid("name") || undefined}
            autoComplete="name"
            defaultValue={draftValue(state, "name")}
            id={`${id}-name`}
            maxLength={NAME_MAX_LENGTH}
            name="name"
            required
          />
          <FieldError
            errors={fieldErrorsOf(state, "name")}
            id={errorId("name")}
          />
        </Field>

        <Field data-invalid={invalid("email") || undefined}>
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input
            aria-describedby={describedBy("email")}
            aria-invalid={invalid("email") || undefined}
            autoComplete="email"
            defaultValue={draftValue(state, "email")}
            id={`${id}-email`}
            maxLength={EMAIL_MAX_LENGTH}
            name="email"
            required
            type="email"
          />
          <FieldError
            errors={fieldErrorsOf(state, "email")}
            id={errorId("email")}
          />
        </Field>

        <Field data-invalid={invalid("courseOrCompany") || undefined}>
          <FieldLabel htmlFor={`${id}-course`}>Course or company</FieldLabel>
          <Input
            aria-describedby={describedBy("courseOrCompany")}
            aria-invalid={invalid("courseOrCompany") || undefined}
            autoComplete="organization"
            defaultValue={draftValue(state, "courseOrCompany")}
            id={`${id}-course`}
            maxLength={COURSE_MAX_LENGTH}
            name="courseOrCompany"
            required
          />
          <FieldError
            errors={fieldErrorsOf(state, "courseOrCompany")}
            id={errorId("courseOrCompany")}
          />
        </Field>

        <Field data-invalid={invalid("inquiryType") || undefined}>
          <FieldLabel htmlFor={`${id}-inquiry`}>Inquiry type</FieldLabel>
          <Select
            defaultValue={draftValue(state, "inquiryType") ?? null}
            items={INQUIRY_TYPES.map((type) => ({ label: type, value: type }))}
            name="inquiryType"
            required
          >
            <SelectTrigger
              aria-describedby={describedBy("inquiryType")}
              aria-invalid={invalid("inquiryType") || undefined}
              className="w-full"
              id={`${id}-inquiry`}
            >
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {INQUIRY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError
            errors={fieldErrorsOf(state, "inquiryType")}
            id={errorId("inquiryType")}
          />
        </Field>

        <Field data-invalid={invalid("teeSheetProvider") || undefined}>
          <FieldLabel htmlFor={`${id}-tee-sheet`}>
            Tee-sheet provider{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <Input
            aria-describedby={describedBy("teeSheetProvider")}
            aria-invalid={invalid("teeSheetProvider") || undefined}
            defaultValue={draftValue(state, "teeSheetProvider")}
            id={`${id}-tee-sheet`}
            maxLength={TEE_SHEET_MAX_LENGTH}
            name="teeSheetProvider"
          />
          <FieldError
            errors={fieldErrorsOf(state, "teeSheetProvider")}
            id={errorId("teeSheetProvider")}
          />
        </Field>

        <Field data-invalid={invalid("phone") || undefined}>
          <FieldLabel htmlFor={`${id}-phone`}>
            Phone{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <FieldDescription>
            Only used if a reply by phone is clearly better for your inquiry.
          </FieldDescription>
          <Input
            aria-describedby={describedBy("phone")}
            aria-invalid={invalid("phone") || undefined}
            autoComplete="tel"
            defaultValue={draftValue(state, "phone")}
            id={`${id}-phone`}
            maxLength={PHONE_MAX_LENGTH}
            name="phone"
            type="tel"
          />
          <FieldError
            errors={fieldErrorsOf(state, "phone")}
            id={errorId("phone")}
          />
        </Field>

        <Field data-invalid={invalid("message") || undefined}>
          <FieldLabel htmlFor={`${id}-message`}>Message</FieldLabel>
          <Textarea
            aria-describedby={describedBy("message")}
            aria-invalid={invalid("message") || undefined}
            className="min-h-32"
            defaultValue={draftValue(state, "message")}
            id={`${id}-message`}
            maxLength={MESSAGE_MAX_LENGTH}
            name="message"
            required
          />
          <FieldDescription>
            Up to {MESSAGE_MAX_LENGTH.toLocaleString("en-US")} characters.
          </FieldDescription>
          <FieldError
            errors={fieldErrorsOf(state, "message")}
            id={errorId("message")}
          />
        </Field>

        {/* Honeypot: hidden from people, filled only by bots. Never delivered. */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            autoComplete="off"
            id={`${id}-website`}
            name="website"
            tabIndex={-1}
            type="text"
          />
        </div>

        <ContactFormStatus state={state} />
        <ContactFormActions pending={pending} />
      </FieldGroup>
    </form>
  );
};
