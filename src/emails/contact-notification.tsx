import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

import { emailTheme } from "@/emails/email-theme";
import type { ContactInquiry } from "@/features/contact/contact-schema";

// Internal notification for a contact-form submission. Every value is rendered
// through JSX text nodes so user-supplied content is always escaped.

export interface ContactNotificationEmailProps {
  inquiry: ContactInquiry;
  submissionId: string;
}

const FieldRow = ({ label, value }: { label: string; value: string }) => (
  <Section>
    <Text className="m-0 mt-4 mb-0.5 text-xs tracking-wide text-muted-foreground uppercase">
      {label}
    </Text>
    <Text className="m-0 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
      {value}
    </Text>
  </Section>
);

export const ContactNotificationEmail = ({
  inquiry,
  submissionId,
}: ContactNotificationEmailProps) => {
  const {
    courseOrCompany,
    email,
    inquiryType,
    message,
    name,
    phone,
    teeSheetProvider,
  } = inquiry;

  return (
    <Html lang="en">
      <Tailwind config={emailTheme}>
        <Head />
        <Preview>
          New contact inquiry from the pinbound.golf contact form
        </Preview>
        <Body className="bg-background font-sans">
          <Container className="mx-auto my-6 max-w-xl rounded-xl bg-card p-8">
            <Heading as="h1" className="m-0 mb-2 text-lg text-foreground">
              New contact inquiry
            </Heading>
            <Text className="m-0 text-xs leading-relaxed text-muted-foreground">
              Submitted through the pinbound.golf contact form. Reply to this
              email to answer the visitor directly.
            </Text>
            <Hr />
            <FieldRow label="Name" value={name} />
            <FieldRow label="Email" value={email} />
            <FieldRow label="Course or company" value={courseOrCompany} />
            <FieldRow label="Inquiry type" value={inquiryType} />
            <FieldRow
              label="Tee-sheet provider"
              value={teeSheetProvider || "Not provided"}
            />
            <FieldRow label="Phone" value={phone || "Not provided"} />
            <FieldRow label="Message" value={message} />
            <Hr />
            <Text className="m-0 text-xs leading-relaxed text-muted-foreground">
              Submission ID: {submissionId}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ContactNotificationEmail;
