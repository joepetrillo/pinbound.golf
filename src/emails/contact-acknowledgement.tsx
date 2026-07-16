import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

// Fixed acknowledgement sent to the visitor. It intentionally contains no
// visitor-supplied content so the form can never be used as an email relay,
// and it makes no promise about a specific response window.

export interface ContactAcknowledgementEmailProps {
  contactEmail: string;
  submissionId: string;
}

const bodyStyle = {
  backgroundColor: "#f6f6f4",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

const containerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  margin: "24px auto",
  maxWidth: "560px",
  padding: "32px",
} as const;

const textStyle = {
  color: "#1c1c1a",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
} as const;

const metaStyle = {
  color: "#6b6b66",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
} as const;

export const ContactAcknowledgementEmail = ({
  contactEmail,
  submissionId,
}: ContactAcknowledgementEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>We received your message and will follow up by email.</Preview>
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Heading
          as="h1"
          style={{ color: "#1c1c1a", fontSize: "18px", margin: "0 0 16px" }}
        >
          We received your message
        </Heading>
        <Text style={textStyle}>
          Thanks for contacting Pinbound. Your message reached our team, and we
          read every inquiry. We will follow up by email as soon as we can.
        </Text>
        <Text style={textStyle}>
          If you want to add anything in the meantime, reply to this email or
          write to {contactEmail}.
        </Text>
        <Hr />
        <Text style={metaStyle}>Reference: {submissionId}</Text>
      </Container>
    </Body>
  </Html>
);

export default ContactAcknowledgementEmail;
