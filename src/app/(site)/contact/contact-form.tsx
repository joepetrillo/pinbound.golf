"use client";

import Link from "next/link";
import { useActionState, useId } from "react";

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";

import { submitContactInquiry } from "./actions";
import {
  CONTACT_FORM_IDLE_STATE,
  COURSE_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  INQUIRY_TYPES,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  TEE_SHEET_MAX_LENGTH,
} from "./schema";
import type { ContactFieldName, ContactFormState } from "./schema";

const fieldErrorsOf = (state: ContactFormState, field: ContactFieldName) =>
  state.status === "invalid"
    ? state.fieldErrors[field]?.map((message) => ({ message }))
    : undefined;

const draftValue = (state: ContactFormState, field: ContactFieldName) =>
  state.status === "invalid" || state.status === "failed"
    ? state.values[field]
    : undefined;

export const ContactForm = () => {
  const [state, formAction, pending] = useActionState(
    submitContactInquiry,
    CONTACT_FORM_IDLE_STATE
  );
  const id = useId();

  if (state.status === "success") {
    return (
      <div aria-live="polite" className="rounded-3xl border bg-card p-8">
        <h2 className="text-xl font-medium">Message sent</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Thanks for reaching out. Your message is on its way to our team, and a
          confirmation is on its way to your inbox. We will follow up by email.
        </p>
        <div className="mt-6">
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/">
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
    <form action={formAction} noValidate>
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
              {INQUIRY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
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

        <output aria-live="polite" className="block">
          {state.status === "failed" ? (
            <p className="text-sm text-destructive">
              Your message could not be sent. Please try again in a moment, or
              email us directly at{" "}
              <a
                className="underline underline-offset-4"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ) : null}
          {state.status === "invalid" ? (
            <p className="text-sm text-destructive">
              Please fix the highlighted fields and try again.
            </p>
          ) : null}
        </output>

        <div className="flex flex-wrap items-center gap-4">
          <Button disabled={pending} size="lg" type="submit">
            {pending ? "Sending…" : "Send message"}
          </Button>
          <p className="text-sm text-muted-foreground">
            See how we handle your details in our{" "}
            <Link className="underline underline-offset-4" href="/privacy">
              privacy notice
            </Link>
            .
          </p>
        </div>
      </FieldGroup>
    </form>
  );
};
