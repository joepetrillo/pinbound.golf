import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
  Tailwind,
} from "@react-email/components";

import { emailTheme } from "@/emails/email-theme";

// Fixed acknowledgement sent to the visitor. It intentionally contains no
// visitor-supplied content so the form can never be used as an email relay,
// and it makes no promise about a specific response window.

export interface ContactAcknowledgementEmailProps {
  contactEmail: string;
  submissionId: string;
}

export const ContactAcknowledgementEmail = ({
  contactEmail,
  submissionId,
}: ContactAcknowledgementEmailProps) => (
  <Html lang="en">
    <Tailwind config={emailTheme}>
      <Head />
      <Preview>We received your message and will follow up by email.</Preview>
      <Body className="bg-background font-sans">
        <Container className="mx-auto my-6 max-w-xl rounded-xl bg-card p-8">
          <Heading as="h1" className="m-0 mb-4 text-lg text-foreground">
            We received your message
          </Heading>
          <Text className="m-0 mb-4 text-sm leading-relaxed text-foreground">
            Thanks for contacting Pinbound. Your message reached our team, and
            we read every inquiry. We will follow up by email as soon as we can.
          </Text>
          <Text className="m-0 mb-4 text-sm leading-relaxed text-foreground">
            If you want to add anything in the meantime, reply to this email or
            write to {contactEmail}.
          </Text>
          <Hr />
          <Text className="m-0 text-xs leading-relaxed text-muted-foreground">
            Reference: {submissionId}
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default ContactAcknowledgementEmail;
