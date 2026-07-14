import type { Metadata } from "next";

import { Section } from "@/components/section";
import { FOUNDERS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  description:
    "Terms governing use of the Pinbound marketing website and its published materials.",
  title: "Terms — Pinbound",
};

const TermsPage = () => (
  <Section className="pt-16 md:pt-20">
    <article className="typeset typeset-docs mx-auto max-w-[45em]">
      <h1>Website terms</h1>
      <p>
        <strong>Last updated: July 13, 2026</strong>
      </p>
      <p>
        These terms govern your use of the Pinbound marketing website. By using
        this website, you agree to these terms. If you do not agree, do not use
        the website.
      </p>

      <h2>Product pilots and service agreements</h2>
      <p>
        This website describes a developing product and founding-pilot program.
        It does not itself create a Pinbound account or service contract. Any
        pilot or paid use of Pinbound is subject to eligibility, technical fit,
        and a separate written agreement between Pinbound and the participating
        course.
      </p>
      <p>
        Pricing shown on the website is a planning estimate based on the stated
        assumptions. Final scope, usage allowance, price, and service terms are
        confirmed before a paid plan begins.
      </p>

      <h2>Website content</h2>
      <p>
        We aim to keep product descriptions, integration status, examples, and
        articles useful and current. The product is evolving, and website
        content may change. Sample calls, courses, callers, policies, and tee
        times are illustrative unless clearly identified otherwise.
      </p>
      <p>
        Articles and other materials are general information, not legal,
        financial, compliance, or professional advice. A course remains
        responsible for its operating policies, caller notices, recording
        practices, and use of the service.
      </p>

      <h2>Acceptable use</h2>
      <p>You may not use the website to:</p>
      <ul>
        <li>Break the law or infringe another person&apos;s rights.</li>
        <li>Attempt unauthorized access, disruption, or security testing.</li>
        <li>Introduce malicious code or interfere with website operation.</li>
        <li>
          Scrape, copy, or republish substantial portions of the website in a
          way that violates applicable law or Pinbound&apos;s rights.
        </li>
        <li>Misrepresent an affiliation with or endorsement by Pinbound.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Pinbound and its licensors retain their rights in the website, product
        materials, branding, text, graphics, demos, and software. You may use
        the website for your internal evaluation of Pinbound. No other license
        is granted except as required to access the website normally.
      </p>

      <h2>Third-party services and links</h2>
      <p>
        The website may refer or link to tee-sheet vendors, research sources,
        payment providers, and other third parties. Those services are operated
        under their own terms and privacy practices. A reference or link does
        not imply that every capability is available through Pinbound.
      </p>

      <h2>Disclaimers and limitation</h2>
      <p>
        The website is provided on an &quot;as is&quot; and &quot;as
        available&quot; basis to the extent permitted by law. We do not promise
        that the website will always be uninterrupted, error-free, or suitable
        for a particular purpose.
      </p>
      <p>
        To the extent permitted by law, Pinbound will not be liable for
        indirect, incidental, special, consequential, or punitive damages
        arising from use of this marketing website. These website terms do not
        replace or alter the remedies and liability terms in a signed Pinbound
        service agreement.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms as the website and product develop. The date
        above will show the latest revision. Questions can be sent to{" "}
        <a href={`mailto:${FOUNDERS_EMAIL}`}>{FOUNDERS_EMAIL}</a>.
      </p>
    </article>
  </Section>
);

export default TermsPage;
