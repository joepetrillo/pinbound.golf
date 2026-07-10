# Pinbound product context

_Last updated: July 9, 2026_

## Product in one paragraph

Pinbound is a planned self-serve AI phone assistant for golf courses. It answers a course's existing public phone line, speaks naturally, handles routine questions using course-approved information, and—when connected and authorized—searches, books, looks up, changes, and cancels tee times through the course's tee sheet. Callers can ask for a person at any time. Pinbound is intended to give callers faster, more consistent service while letting pro-shop staff stay focused on the golfers physically in front of them.

## Current reality

Pinbound is pre-launch and pre-product. The repository currently contains a Next.js marketing site and illustrative call audio, but there are no customers, pilots, production calls, certified tee-sheet integrations, or operating results. EZLinks is the intended first tee-sheet integration, but API and sandbox access still need to be obtained and validated.

Pinehills is the archetypal design target, not a customer. Personalized course recordings, a public demo line, integrations, prices, and performance claims must not be marketed as available until they are genuinely working.

## Users, buyer, and best initial market

- **Buyer and accountable owner:** General Manager or owner-operator.
- **Daily operators:** Pro-shop managers and staff who review calls, update daily conditions, and receive transfers or callbacks.
- **End user:** A golfer calling the course.
- **Initial ideal-customer hypothesis:** Busy semi-private or premium public facilities, especially multi-course or 27–36-hole operations with meaningful call volume. Pinbound may serve any course; this is a go-to-market focus, not a product restriction.
- **Initial acquisition:** Personalized outbound, missed-call audits, warm introductions, and golf-association events. SEO and paid acquisition are later priorities.

## The problem and value hierarchy

The visible problem is a phone competing with the counter: staff are checking in a wave of golfers while callers need rates, conditions, availability, changes, or directions. Voicemail and generic answering services defer work rather than completing it. Online booking reduces booking calls but does not eliminate questions, cancellations, same-day requests, or routing calls.

Pinbound's priority outcomes are:

1. Give callers faster, more consistent service.
2. Reduce staff interruptions and phone workload so staff can serve the golfer in front of them.
3. Handle tee-sheet actions safely and according to course policy.
4. Capture bookings and callers that might otherwise abandon the call.
5. Give management visibility into demand, call outcomes, recurring questions, and operational gaps.

After-hours answering is supported but is not a primary selling point. The long-term default is **agent first, human immediately available**. Courses may instead choose overflow-only, busy-line, ring-no-answer, or after-hours modes.

## Product principles

- **Self-serve by default:** A course must be able to sign up, configure, test, activate, operate, and pay without founder intervention. Early customers may receive hands-on help, but no required workflow should exist only in the founder's head.
- **Human on request:** The agent transfers immediately when asked and does not argue. Ambiguous, emotional, sensitive, or excluded requests also transfer.
- **The tee sheet is the source of truth:** Nothing is verbally confirmed unless the tee sheet returns a successful result. Writes require deterministic policy and permission checks, idempotency, and an audit record.
- **Course control within safe limits:** Courses control facts, policies, temporary updates, permitted actions, handoff rules, voice, greeting, and terminology. Pinbound controls core safety behavior and does not allow configuration that weakens required disclosures or transaction protections.
- **Natural conversation, deterministic consequences:** The voice layer may be flexible; any action that can create an incorrect or unauthorized transaction must pass server-side validation.
- **Fail open to the pro shop, not into silence:** Outages or failed integrations route calls to the course's fallback destination and alert the course.
- **Improve a human phone workflow:** Pinbound should automate what a capable pro-shop employee can reasonably do on the phone, not become a CRM, tee sheet, or general course-management system.

## End-to-end experience

### 1. Course onboarding

An organization creates one workspace and adds one or more facilities, courses, phone lines, and tee sheets. A standard onboarding flow collects required baseline information: location, courses and hole counts, hours, rates, booking windows, cart and walking rules, cancellation/no-show policies, amenities, common questions, routing destinations, and escalation rules.

Pinbound may import published information from the course website, but the course must review it and supply unpublished rules. Required fields establish a minimum service level. Authorized users can edit information at any time.

Temporary conditions—frost delays, closures, cart-path-only rules, aeration, range status, weather disruptions—have start and expiration times so stale information disappears automatically.

### 2. Connections and testing

The course connects its phone routing and, when available, authorizes tee-sheet access. Each tee-sheet vendor is implemented behind a common Pinbound adapter with normalized actions: search, book, look up, change, and cancel. Vendor-specific capabilities and limitations remain explicit.

Before activation, the GM calls a private test agent configured with that course's information. Automated evals cover normal calls, adversarial wording, policy edge cases, tool use, failed integrations, and handoffs. The GM explicitly approves go-live and always has a prominent kill switch that restores normal routing.

### 3. A live call

1. A golfer calls the course's existing number.
2. Recognized VIP phone numbers may bypass Pinbound and ring a separate staff destination. Caller ID is a routing convenience, not secure identity verification.
3. Other calls reach the course's agent. The opening identifies it as an AI/virtual assistant and provides the required recording notice. [ElevenLabs currently requires both disclosures](https://elevenlabs.io/docs/eleven-agents/legal/disclosure-requirement), so this is not an optional course toggle.
4. The agent determines intent and either answers from approved course information, calls a Pinbound tool, or transfers.
5. Live availability and transactions go through Pinbound's policy layer and tee-sheet adapter. A booking is never promised before a successful vendor response.
6. Reservation-specific changes require verification no weaker than the course's human workflow. Prefer a confirmation identifier plus matching booking details; use an SMS one-time code when the destination number can be trusted and the added friction is justified. If membership or identity cannot be verified, transfer. A Pinbound VIP list is not a membership database.
7. A caller who requests a person is transferred immediately. The human destination must be an internal extension, hunt group, or separate number so forwarding does not loop back into the agent.
8. If nobody answers, Pinbound takes a normal message or callback request and creates a staff task with the caller, reason, relevant details, requested callback time, and transcript link.
9. Post-call data populates the dashboard, analytics, notifications, and evals.

### 4. Course operations

The web application includes role-based access. Workspace owners manage billing, integrations, and core policies; staff can review calls and update approved day-to-day information. The dashboard provides recordings, transcripts, outcomes, transfers, tee-sheet actions, failures, uncertain calls, searchable history, staff callback tasks, daily summaries, weekly metrics, usage, and urgent incident alerts.

Primary metrics include resolution rate, transfer rate, tee-time actions, failed/uncertain calls, handling time, estimated staff time saved, and demand by time and topic. Revenue attribution appears only when supported by tee-sheet data.

## Capability boundaries

### Launch scope

- Routine questions based on required and course-supplied information.
- Tee-time availability, booking, lookup, change, and cancellation through the first supported adapter.
- Per-course booking rules, blocked inventory, permissions, and transfer conditions.
- Immediate human handoff, VIP routing, failed-transfer messages, and callback tasks.
- Multi-course workspaces, roles, scheduled updates, testing, kill switch, analytics, alerts, privacy controls, billing, and usage management.
- English first.

### Not launch scope

- A separate CRM or membership database.
- Replacing the tee sheet or phone provider.
- Independently completing outings, leagues, lessons, restaurant reservations, or work requiring off-phone judgment. The agent gathers useful details and routes these requests.
- Promising that courses can eliminate employees. The product removes repetitive phone work and improves the in-person experience.
- Voice collection of card numbers.

## Payments and reservation verification

Payment requirements differ by course and tee-sheet configuration, and EZLinks capabilities cannot be assumed before access is granted. The recommended launch policy is:

1. **Never ask a caller to speak card data to the AI.** Pinbound records and transcribes calls, while [PCI DSS prohibits retaining card security codes in audio after authorization](https://www.pcisecuritystandards.org/faqs/1210/).
2. If the tee-sheet vendor supports a secure hosted checkout and temporary reservation hold, text that vendor-hosted link, wait for a verified payment result, and only then confirm the booking.
3. If a safe link/hold workflow is unavailable, warm-transfer the caller or direct them to the course's existing online booking flow. Do not build an independent payment ledger that can drift from the tee sheet.
4. Consider keypad-based phone payment later through a PCI-oriented provider such as [Twilio Pay](https://www.twilio.com/docs/voice/pci-workflows), where card digits are hidden from the agent and logs. This adds integration, compliance, testing, transaction, and support cost and is not necessary for the first release.

## Recommended technical shape

- **Application:** The existing Next.js project becomes the complete Pinbound SaaS: marketing, authentication, onboarding, workspace/course configuration, test agent, operations dashboard, tasks, billing, usage, and support.
- **Voice platform:** Use ElevenLabs Agents heavily for speech, turn-taking, agent orchestration, tools, transfers, testing, and conversation analysis. Keep Pinbound's domain data, rules, audit trail, and vendor adapters outside ElevenLabs so the business has a credible future migration path.
- **Telephony:** Begin with Twilio-native or SIP routing compatible with ElevenLabs transfers. Preserve the course's public number through forwarding, porting, or PBX/SIP configuration. Setup must verify original caller ID, a non-looping human destination, VIP routing, and automatic fallback.
- **Agent configuration split:** Put conversational identity, style, and handoff instructions in the agent prompt; stable course facts in structured configuration or a small knowledge base; temporary facts and live state behind tools; and every consequential transaction behind deterministic Pinbound validation.
- **Integration layer:** A normalized tee-sheet interface with vendor-specific adapters, capability flags, idempotency keys, conflict handling, timeouts, retries that cannot duplicate writes, and complete audit logs.
- **Events and analytics:** Use signed post-call webhooks to store transcript, outcome, cost, tool results, and evaluation data in Pinbound. Create global evals for core behavior and course-specific evals from configured policies and real failures.

ElevenLabs is the preferred launch dependency, not a permanent architectural prison. Do not prematurely rebuild its voice stack, but keep telephony, course configuration, business rules, tools, and data models provider-owned by Pinbound.

## Trust, privacy, and safety

- ElevenLabs currently requires notice that the caller is interacting with AI and that the conversation is recorded and shared with service providers. Pinbound should enforce one compliant opening rather than expose an unsafe disclosure toggle.
- Course-specific recording-law and privacy requirements still require legal review. The safest product default is disclosure on every call.
- Courses control retention and deletion. Recommended starting defaults are 90 days for audio, 12 months for transcripts, and account-lifetime structured metrics; validate these with counsel and customer needs. [ElevenLabs currently defaults to two years](https://elevenlabs.io/docs/eleven-agents/customization/privacy/retention), so Pinbound must explicitly configure shorter retention.
- Define "product improvement" narrowly: quality review, failure diagnosis, eval creation, and aggregated/de-identified analysis under clear contract terms. Provide an account-level exclusion when required by a customer or agreement. Avoid using identifiable calls for unrelated model training.
- Validate webhook signatures, encrypt sensitive data, limit role access, log every configuration and transaction change, and test fallback routing continuously.

## Commercial model

Start with one product rather than separate "answering" and "tee-sheet" tiers. The product can run in different coverage modes, and packaging can split later if demand proves a distinct answering-only market.

Recommended launch structure:

- A 30-day pilot beginning after successful activation, not signup. Extend it when weather, seasonality, or low volume prevents a fair test.
- A recurring workspace subscription with pooled included minutes, clear usage reporting, threshold warnings, and disclosed overages or plan upgrades. Never stop answering unexpectedly at a usage limit.
- Use approximately **$399 per month** as a planning hypothesis, not published pricing, until pilots establish call volume, support burden, LLM cost, telephony cost, integration cost, and willingness to pay.
- Model at least a 1,000-minute scenario before setting allowances. As of July 2026, [ElevenLabs lists agent calls at $0.08 per minute](https://elevenlabs.io/pricing/agents?price.platform=agents_platform), with LLM and telephony additional; [Twilio lists US local inbound calling at $0.0085 per minute](https://www.twilio.com/en-us/voice/pricing/us). That creates a platform floor of about $88.50 per 1,000 inbound minutes before LLM, messaging, storage, infrastructure, support, transfer legs, and failed-call overhead.

## Launch MVP and build sequence

The customer-facing MVP includes the complete self-serve loop; early manual assistance may support it but may not replace missing product features.

1. **Foundation:** Workspaces, facilities, roles, required onboarding schema, temporary updates, agent configuration sync, private test agent, call storage, and usage metering.
2. **Reliable call handling:** Existing-number routing, required disclosure, VIP bypass, immediate handoff, non-looping human destination, failed-transfer tasks, kill switch, monitoring, and automatic fallback.
3. **Golf operations:** Mock tee-sheet adapter, deterministic policy layer, verification flows, normalized tool contracts, audit log, and extensive global/course evals.
4. **EZLinks:** Obtain authorized sandbox access; validate exact search, booking, lookup, change, cancellation, customer, rate, payment, confirmation, and concurrency behavior; then build and certify the first production adapter.
5. **Self-serve launch:** Billing, 30-day trial, pooled usage, alerts, support content, deletion/retention controls, analytics, and guided phone/integration setup.

## Open decisions and gating risks

- Whether EZLinks will grant suitable API/sandbox access and which actions and data it actually exposes.
- How each vendor represents members, rates, payment requirements, holds, confirmations, cancellations, and customer identity.
- The exact telephony setup that supports agent-first routing, VIP bypass, warm transfer, caller-ID preservation, and failover across common course phone systems.
- Final verification rules for lookup/change/cancel by vendor and course.
- Final pricing, included minutes, overage rate, multi-course pricing, concurrency needs, and shoulder-season treatment after real usage data.
- Retention, customer-data improvement rights, consent language, and state-specific obligations after counsel review.
- The minimum acceptable latency and reliability for course knowledge, tools, and tee-sheet writes.

## Marketing truth and current-site corrections

The central message is: **Pinbound gives callers fast, consistent help while pro-shop staff stay with the golfer in front of them.** Safety and control support that promise: callers can reach a human, the course controls the rules, and the tee sheet remains the source of truth.

Do not lead with 24/7 or after-hours coverage. Do not market layoffs. Do not use golf puns, futuristic robot imagery, fake scarcity, unsupported statistics, fake testimonials, or generic "AI-powered" claims.

Before driving traffic, the current site needs truth corrections: it presently describes EZLinks/GolfNow as live, leads with around-the-clock coverage, advertises $299 pricing and after-hours shadow mode, and implies working tee-sheet transactions. Those statements conflict with the confirmed pre-product status. Illustrative Pinehills conversations and audio must be labeled as demos, not customer calls.

The preferred proof path is a personalized recording based only on rates, hours, and booking rules published on a prospect's website. Do not promise that deliverable until the mock-adapter agent and course-configuration workflow can produce it reliably with roughly ten minutes of founder preparation.

## Current reference points

- [ElevenLabs Agents overview](https://elevenlabs.io/docs/eleven-agents/overview)
- [ElevenLabs dynamic variables](https://elevenlabs.io/docs/eleven-agents/customization/personalization/dynamic-variables)
- [ElevenLabs webhook tools](https://elevenlabs.io/docs/eleven-agents/customization/tools/webhook-tools)
- [ElevenLabs human transfer](https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/transfer-to-number)
- [ElevenLabs agent testing](https://elevenlabs.io/docs/eleven-agents/customization/agent-testing)
- [ElevenLabs post-call webhooks](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks)
- [ElevenLabs disclosure requirements](https://elevenlabs.io/docs/eleven-agents/legal/disclosure-requirement)
- [ElevenLabs retention controls](https://elevenlabs.io/docs/eleven-agents/customization/privacy/retention)
- [ElevenLabs pricing](https://elevenlabs.io/pricing/agents?price.platform=agents_platform)
- [Twilio US voice pricing](https://www.twilio.com/en-us/voice/pricing/us)
- [Twilio PCI voice payments](https://www.twilio.com/docs/voice/pci-workflows)
- [PCI SSC guidance on card data in recordings](https://www.pcisecuritystandards.org/faqs/1210/)
