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
} from "@react-email/components";

// Internal notification for a contact-form submission. Every value is rendered
// through JSX text nodes so user-supplied content is always escaped.

export interface ContactNotificationEmailProps {
  courseOrCompany: string;
  email: string;
  inquiryType: string;
  message: string;
  name: string;
  phone?: string;
  submissionId: string;
  teeSheetProvider?: string;
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

const labelStyle = {
  color: "#6b6b66",
  fontSize: "12px",
  letterSpacing: "0.04em",
  margin: "16px 0 2px",
  textTransform: "uppercase",
} as const;

const valueStyle = {
  color: "#1c1c1a",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
  whiteSpace: "pre-wrap",
} as const;

const metaStyle = {
  color: "#6b6b66",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
} as const;

const FieldRow = ({ label, value }: { label: string; value: string }) => (
  <Section>
    <Text style={labelStyle}>{label}</Text>
    <Text style={valueStyle}>{value}</Text>
  </Section>
);

export const ContactNotificationEmail = ({
  courseOrCompany,
  email,
  inquiryType,
  message,
  name,
  phone,
  submissionId,
  teeSheetProvider,
}: ContactNotificationEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>New contact inquiry from the pinbound.golf contact form</Preview>
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Heading
          as="h1"
          style={{ color: "#1c1c1a", fontSize: "18px", margin: "0 0 8px" }}
        >
          New contact inquiry
        </Heading>
        <Text style={metaStyle}>
          Submitted through the pinbound.golf contact form. Reply to this email
          to answer the visitor directly.
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
        <Text style={metaStyle}>Submission ID: {submissionId}</Text>
      </Container>
    </Body>
  </Html>
);

export default ContactNotificationEmail;
