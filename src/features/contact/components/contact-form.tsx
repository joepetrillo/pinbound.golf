"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { RiCheckLine, RiErrorWarningLine } from "@remixicon/react";
import Link from "next/link";
import { useId, useLayoutEffect, useRef } from "react";
import type { FormEvent, ReactNode } from "react";
import { Controller } from "react-hook-form";
import type {
  Control,
  DefaultValues,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";

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
import { PhoneInput } from "@/components/ui/phone-input";
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
import { submitContactInquiry } from "@/features/contact/contact-actions";
import {
  CONTACT_FIELD_NAMES,
  contactActionSchema,
  COURSE_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  HONEYPOT_FIELD,
  INQUIRY_TYPES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
  TEE_SHEET_MAX_LENGTH,
} from "@/features/contact/contact-schema";
import type {
  ContactActionInput,
  ContactFieldName,
} from "@/features/contact/contact-schema";
import { CONTACT_EMAIL, MARKETING_HOME_HREF } from "@/lib/site";
import { cn } from "@/lib/utils";

interface ContactAttempt {
  operationId: string;
  payloadFingerprint: string;
}

const payloadFingerprintOf = (values: ContactActionInput): string =>
  JSON.stringify(
    CONTACT_FIELD_NAMES.map((field) => {
      const value = values[field];
      return [field, value === undefined ? null : value.trim()];
    })
  );

// Placeholder UUID so the shared action schema validates on the client; the
// real idempotency key is stamped in onSubmit before executeAsync.
const OPERATION_ID_PLACEHOLDER = "00000000-0000-4000-8000-000000000000";

const CONTACT_FORM_DEFAULTS: DefaultValues<ContactActionInput> = {
  courseOrCompany: "",
  email: "",
  message: "",
  name: "",
  operationId: OPERATION_ID_PLACEHOLDER,
  phone: "",
  teeSheetProvider: "",
  [HONEYPOT_FIELD]: "",
};

const fieldErrorList = (message: string | undefined) =>
  message ? [{ message }] : undefined;

const ContactSuccessMessage = () => (
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

const ContactFormStatus = ({
  serverError,
  hasFieldErrors,
}: {
  serverError?: string;
  hasFieldErrors: boolean;
}) => {
  if (serverError) {
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

  if (hasFieldErrors) {
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

const TextField = ({
  id,
  name,
  label,
  errorMessage,
  children,
}: {
  id: string;
  name: ContactFieldName;
  label: ReactNode;
  errorMessage?: string;
  children: (ids: {
    fieldId: string;
    errorId: string;
    describedBy?: string;
    invalid: boolean;
  }) => ReactNode;
}) => {
  const invalid = Boolean(errorMessage);
  const fieldId = `${id}-${name}`;
  const errorId = `${fieldId}-error`;

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      {children({
        describedBy: invalid ? errorId : undefined,
        errorId,
        fieldId,
        invalid,
      })}
      <FieldError errors={fieldErrorList(errorMessage)} id={errorId} />
    </Field>
  );
};

const InquiryTypeField = ({
  id,
  control,
  errorMessage,
}: {
  id: string;
  control: Control<ContactActionInput>;
  errorMessage?: string;
}) => (
  <TextField
    errorMessage={errorMessage}
    id={id}
    label="Inquiry type"
    name="inquiryType"
  >
    {({ describedBy, fieldId, invalid }) => (
      <Controller
        control={control}
        name="inquiryType"
        render={({ field }) => (
          <Select
            items={INQUIRY_TYPES.map((type) => ({
              label: type,
              value: type,
            }))}
            onValueChange={(value) => {
              field.onChange(value ?? undefined);
            }}
            value={field.value ?? null}
          >
            <SelectTrigger
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              className="w-full"
              id={fieldId}
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
        )}
      />
    )}
  </TextField>
);

const ContactFormFields = ({
  id,
  control,
  register,
  errors,
  pending,
  serverError,
}: {
  id: string;
  control: Control<ContactActionInput>;
  register: UseFormRegister<ContactActionInput>;
  errors: FieldErrors<ContactActionInput>;
  pending: boolean;
  serverError?: string;
}) => {
  const hasFieldErrors = CONTACT_FIELD_NAMES.some((field) => errors[field]);

  return (
    <FieldGroup>
      <TextField
        errorMessage={errors.name?.message}
        id={id}
        label="Name"
        name="name"
      >
        {({ describedBy, fieldId, invalid }) => (
          <Input
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            autoComplete="name"
            id={fieldId}
            maxLength={NAME_MAX_LENGTH}
            {...register("name")}
          />
        )}
      </TextField>

      <TextField
        errorMessage={errors.email?.message}
        id={id}
        label="Email"
        name="email"
      >
        {({ describedBy, fieldId, invalid }) => (
          <Input
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            autoComplete="email"
            id={fieldId}
            maxLength={EMAIL_MAX_LENGTH}
            type="email"
            {...register("email")}
          />
        )}
      </TextField>

      <TextField
        errorMessage={errors.courseOrCompany?.message}
        id={id}
        label="Course or company"
        name="courseOrCompany"
      >
        {({ describedBy, fieldId, invalid }) => (
          <Input
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            autoComplete="organization"
            id={fieldId}
            maxLength={COURSE_MAX_LENGTH}
            {...register("courseOrCompany")}
          />
        )}
      </TextField>

      <InquiryTypeField
        control={control}
        errorMessage={errors.inquiryType?.message}
        id={id}
      />

      <TextField
        errorMessage={errors.teeSheetProvider?.message}
        id={id}
        label={
          <>
            Tee-sheet provider{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </>
        }
        name="teeSheetProvider"
      >
        {({ describedBy, fieldId, invalid }) => (
          <Input
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            id={fieldId}
            maxLength={TEE_SHEET_MAX_LENGTH}
            {...register("teeSheetProvider")}
          />
        )}
      </TextField>

      <TextField
        errorMessage={errors.phone?.message}
        id={id}
        label={
          <>
            Phone{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </>
        }
        name="phone"
      >
        {({ describedBy, fieldId, invalid }) => (
          <>
            <FieldDescription>
              Only used if a reply by phone is clearly better for your inquiry.
            </FieldDescription>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => {
                const handleBlur = field.onBlur;
                return (
                  <PhoneInput
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    defaultCountry="US"
                    id={fieldId}
                    onBlur={handleBlur}
                    onChange={(value) => {
                      field.onChange(value ?? "");
                    }}
                    placeholder="Enter phone number"
                    value={field.value || undefined}
                  />
                );
              }}
            />
          </>
        )}
      </TextField>

      <TextField
        errorMessage={errors.message?.message}
        id={id}
        label="Message"
        name="message"
      >
        {({ describedBy, fieldId, invalid }) => (
          <>
            <Textarea
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              className="min-h-32"
              id={fieldId}
              maxLength={MESSAGE_MAX_LENGTH}
              {...register("message")}
            />
            <FieldDescription>
              At least {MESSAGE_MIN_LENGTH.toLocaleString("en-US")} characters,
              up to {MESSAGE_MAX_LENGTH.toLocaleString("en-US")}.
            </FieldDescription>
          </>
        )}
      </TextField>

      {/* Honeypot: hidden from people, filled only by bots. Never delivered. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          autoComplete="off"
          id={`${id}-website`}
          tabIndex={-1}
          type="text"
          {...register(HONEYPOT_FIELD)}
        />
      </div>

      <ContactFormStatus
        hasFieldErrors={hasFieldErrors}
        serverError={serverError}
      />
      <ContactFormActions pending={pending} />
    </FieldGroup>
  );
};

export const ContactForm = () => {
  const id = useId();
  const attemptRef = useRef<ContactAttempt | null>(null);
  const shouldResetOnHideRef = useRef(false);

  const { form, action, resetFormAndAction } = useHookFormAction(
    submitContactInquiry,
    zodResolver(contactActionSchema),
    {
      actionProps: {
        onSuccess: () => {
          shouldResetOnHideRef.current = true;
        },
      },
      formProps: {
        defaultValues: CONTACT_FORM_DEFAULTS,
        mode: "onSubmit",
      },
    }
  );

  // Next.js Activity preserves this route during soft navigation. Keep drafts,
  // but clear a completed submission when its success screen is hidden so a
  // later visit starts with a fresh form.
  useLayoutEffect(
    () => () => {
      if (shouldResetOnHideRef.current) {
        shouldResetOnHideRef.current = false;
        attemptRef.current = null;
        resetFormAndAction();
      }
    },
    [resetFormAndAction]
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(async (values) => {
      const payloadFingerprint = payloadFingerprintOf(values);
      const previousAttempt = attemptRef.current;
      const operationId =
        previousAttempt?.payloadFingerprint === payloadFingerprint
          ? previousAttempt.operationId
          : globalThis.crypto.randomUUID();

      attemptRef.current = { operationId, payloadFingerprint };
      await action.executeAsync({ ...values, operationId });
    })(event);
  };

  if (action.hasSucceeded) {
    return <ContactSuccessMessage />;
  }

  return (
    <form noValidate onSubmit={onSubmit}>
      <ContactFormFields
        control={form.control}
        errors={form.formState.errors}
        id={id}
        pending={action.isPending}
        register={form.register}
        serverError={action.result.serverError}
      />
    </form>
  );
};
