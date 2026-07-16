import type { Metadata } from "next";

import { Section } from "@/components/section";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  description:
    "How Pinbound handles information from this website, the contact form, and product pilots.",
  title: "Privacy — Pinbound",
};

const PrivacyPage = () => (
  <Section className="pt-16 md:pt-20">
    <article className="typeset typeset-docs mx-auto max-w-[45em]">
      <h1>Privacy</h1>
      <p>
        <strong>Last updated: July 16, 2026</strong>
      </p>
      <p>
        This notice explains how Pinbound handles information through this
        marketing website and during product pilots. A course&apos;s service use
        is also governed by the service terms accepted at account activation,
        which describe the specific data, providers, retention periods, and
        responsibilities for that deployment.
      </p>

      <h2>Information we receive</h2>
      <p>
        If you submit the contact form, we receive the details you enter: your
        name, email, course or company, inquiry type, message, and, if you
        choose to provide them, your tee-sheet provider and phone number. If you
        email us instead, we receive the contact details and other information
        you choose to include.
      </p>
      <p>
        Contact-form submissions are delivered by email through Resend, our
        email service provider. Each submission sends two transactional emails:
        an internal notification to our team so we can respond, and a short
        acknowledgement to the email address you entered confirming we received
        your message. Submissions are retained at our email provider and in our
        inbox for as long as reasonably needed to handle the inquiry; they are
        not stored in a marketing database or CRM, used for marketing, or added
        to a mailing list. To ask about or request deletion of a submission,
        email us at the address below.
      </p>
      <p>
        Our website host may also process standard technical information such as
        IP address, browser type, device type, requested pages, timestamps, and
        diagnostic or security logs.
      </p>

      <h2>Information used in a product pilot</h2>
      <p>
        Before a live pilot begins, Pinbound and the participating course will
        agree on the supported call flows and data handling. Depending on that
        setup, Pinbound may process caller contact details, call audio,
        transcripts, call metadata, course policies, tee-time requests,
        reservation results, transfers, and callback tasks.
      </p>
      <p>
        Pinbound is designed to identify itself as an AI or virtual assistant
        and provide the configured recording notice at the beginning of a call.
        The participating course is responsible for confirming that its use of
        call recording and the service is appropriate for its location and
        operation.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>Respond to questions and evaluate pilot fit.</li>
        <li>Configure, provide, support, secure, and troubleshoot Pinbound.</li>
        <li>
          Complete authorized call handling, tee-sheet actions, transfers, and
          callback workflows.
        </li>
        <li>
          Review service quality and improve supported workflows as permitted by
          the applicable course agreement.
        </li>
        <li>Meet legal obligations and protect the service from misuse.</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Pinbound is not designed to collect spoken card details. When a
        supported tee-sheet provider offers secure hosted checkout, the caller
        can be directed to that provider&apos;s payment flow. Payment
        information is then handled under the provider&apos;s own terms and
        privacy practices.
      </p>

      <h2>When information may be shared</h2>
      <p>
        Information may be available to the participating course and its
        authorized staff. We may also use service providers to operate,
        communicate, secure, and support Pinbound. We may disclose information
        when required by law, to protect rights or safety, or as part of a
        business transaction subject to appropriate safeguards.
      </p>
      <p>Pinbound does not sell personal information.</p>

      <h2>Retention and security</h2>
      <p>
        We retain information only for as long as reasonably needed for the
        purposes described here, the applicable course agreement, security,
        dispute resolution, or legal obligations. Pilot-specific retention and
        deletion details will be confirmed before live calls are activated.
      </p>
      <p>
        We use administrative, technical, and organizational measures intended
        to protect information. No method of storage or transmission can be
        guaranteed completely secure.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask about, correct, or request deletion of information you sent
        directly to Pinbound by emailing us. If your request concerns a call to
        a participating course, include the course and approximate call date so
        we can identify the appropriate data owner and process.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update this notice as the product and our practices develop. The
        date above will show the latest revision. Questions or requests can be
        sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </article>
  </Section>
);

export default PrivacyPage;
