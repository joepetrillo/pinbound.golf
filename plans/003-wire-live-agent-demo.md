# Plan 003: Wire the orb to the finished ElevenLabs agent

> **Executor instructions**: This plan integrates a finished external demo agent into the existing website. It does not design or build the agent. Follow every verification gate, stop on a STOP condition, and update `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat aeffb3a -- package.json bun.lock src/components/landing/demo.tsx src/components/landing/live-agent-demo.tsx src/components/ui/orb.tsx src/components/ui/live-waveform.tsx src/app/api/demo-agent/session/route.ts 'src/app/(site)/privacy/page.tsx'` This compares the planning baseline with the current working tree, including staged and unstaged edits. If an in-scope file changed, compare the excerpts below with live code. A material mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-refine-homepage-conversion.md`; finished and approved ElevenLabs website demo agent
- **Category**: direction / security
- **Planned at**: commit `aeffb3a`, 2026-07-15

## Why this matters

The orb is intended to be the page’s live product proof, but the current interaction only requests microphone input and renders a waveform. At launch it must hold a real conversation, communicate state clearly, fail gracefully, and leave the recorded samples immediately available. The website must secure agent access and accurately disclose microphone, recording, retention, and provider behavior without adding a call-me flow.

## External prerequisite: finished demo agent

Do not begin until the operator provides an approved ElevenLabs agent that:

- has a stable agent ID and authentication enabled;
- uses the final website-demo greeting, golf scope, and safety/handoff rules;
- cannot perform destructive production tee-sheet writes;
- has cost/session-duration/concurrency controls;
- has known recording, transcript, retention, and training settings;
- has passed its own agent/tool/evaluation work outside this website plan.

## Current state

- `src/components/landing/demo.tsx:271-335` renders `TalkWidget`, changes the orb between idle/listening, and says “Try the demo agent.”
- `src/components/landing/demo.tsx:338-343` only toggles local `micStatus`; no agent session is created.
- `src/components/ui/live-waveform.tsx:286-325` connects `getUserMedia()` to an analyser for visualization only.
- `src/components/landing/demo.tsx:54-135` already defines five recorded sample calls. They remain the no-permission fallback.
- `src/components/landing/home-interactive.tsx:8-20` remounts homepage interactions after Cache Components hides/returns the route; the live session must clean up correctly across that lifecycle.

## Required launch configuration

- Server-only `ELEVENLABS_API_KEY` and `ELEVENLABS_DEMO_AGENT_ID` exist in Vercel. Never expose or print their values.
- The agent uses signed-URL authentication, not a public unauthenticated agent.
- Vercel WAF rate-limits the session-minting endpoint.
- The operator has approved exact website disclosure/retention copy.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Add SDK | `bun add @elevenlabs/react` | exit 0; manifest and lockfile update |
| Typecheck | `bun run typecheck` | exit 0, no errors |
| Lint/format check | `bun run check` | exit 0 |
| Production build | `bun run build` | exit 0; all routes generate |
| Development server | `bun run dev` | demo available locally |

## Suggested executor toolkit

- Follow current ElevenLabs primary docs:
  - `https://elevenlabs.io/docs/eleven-agents/libraries/react`
  - `https://elevenlabs.io/docs/eleven-agents/customization/authentication`
- Use `vercel-react-best-practices` for provider placement and granular SDK hooks.
- Use `web-animation-design` only to map SDK state into the existing orb motion; preserve reduced-motion behavior and avoid decorative state churn.
- Use `next-dev-loop` and `agent-browser` for real permission/session/cleanup QA.

## Scope

**In scope**:

- `package.json`
- `bun.lock`
- `src/components/landing/demo.tsx`
- `src/components/landing/live-agent-demo.tsx` (create)
- `src/components/ui/orb.tsx` (state mapping only if necessary)
- `src/components/ui/live-waveform.tsx` (reuse/adaptation only if necessary)
- `src/app/api/demo-agent/session/route.ts` (create)
- `src/app/(site)/privacy/page.tsx`

**Out of scope**:

- Agent prompt/tool design, tee-sheet adapter, production credentials, evals, telephony, WorkOS, caller phone demo, recorded-audio edits, analytics, or automated tests.
- Removing the orb or recorded samples.
- Starting a session automatically or requesting mic permission on page load.
- Any pre-existing out-of-scope worktree change, including the blog and Open Graph surfaces listed in `plans/README.md`.

## Git workflow

- Branch: `codex/003-live-agent-demo`
- Prefer two commits: secure session endpoint, then client/orb integration.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add the official React SDK with a narrow provider boundary

Install `@elevenlabs/react`. Wrap only the live demo subtree in `ConversationProvider`; do not turn the root layout or entire homepage into a client/provider surface. Use granular hooks for controls, status, mode, and input so unrelated state does not rerender the whole demo.

Extract the live interaction into `live-agent-demo.tsx`. Keep the recorded sample list and shared `AudioPlayerProvider` behavior in `demo.tsx`.

**Verify**: `bun run typecheck` exits 0 and the initial homepage still renders without requesting microphone access or creating an agent session.

### Step 2: Mint short-lived signed sessions on the server

Create `POST /api/demo-agent/session`. It reads the server-only agent ID and API key, requests an ElevenLabs signed URL, returns only the signed URL/session data needed by the client, and maps upstream failure to a generic response. Never return the API key, agent configuration, upstream error body, or stack trace.

Signed URLs expire quickly; mint one only after the visitor clicks Start. Do not cache the response. Validate request origin/host as an additional boundary and configure a Vercel WAF rule for conservative per-client session starts.

**Verify**:

- A valid preview request returns one usable short-lived session.
- Missing configuration and upstream failure return controlled errors.
- Repeated rapid requests are rate-limited in Vercel.
- The API key does not appear in client bundles, response bodies, or logs.

### Step 3: Preserve explicit click-before-permission behavior

The idle orb displays a clear `Start live demo` action and concise microphone/ processing disclosure. Only after that click:

1. request microphone permission;
2. request a signed agent session;
3. call the SDK `startSession` with the signed URL/token appropriate to the configured connection mode.

If permission is denied, unsupported, or the session cannot start, show a short recoverable error and direct attention to the recorded sample calls. Never loop permission prompts or start on scroll/visibility.

**Verify**: initial page load produces no permission prompt; one explicit click starts the permission flow; denial leaves recordings playable.

### Step 4: Map real conversation state into the existing orb

Represent these user-visible states without inventing SDK states:

- idle;
- connecting;
- listening;
- agent speaking/thinking (map from SDK status/mode conservatively);
- muted;
- ended;
- recoverable error.

Use the existing orb and waveform rather than introducing a new visual demo. Provide accessible text for every state, an obvious End control while connected, and mute/unmute if supported by the SDK. The orb cannot be the only state cue. Respect `prefers-reduced-motion`.

**Verify**: state text and controls match the actual session during a real conversation; screen-reader and keyboard users can start, mute, end, and recover.

### Step 5: Guarantee teardown and navigation safety

End the ElevenLabs session, stop microphone tracks, close/clear audio resources, and reset UI state when the visitor:

- clicks End;
- navigates away;
- returns through Cache Components remount/reset;
- loses the connection;
- closes/hides the page where browser lifecycle permits.

Reuse the project’s cleanup conventions in `home-interactive.tsx`, `audio-player.tsx`, and `live-waveform.tsx`. Do not leave a detached session or browser mic indicator active after navigation.

**Verify**: start a session, navigate to `/contact`, then return home. The old session is ended, mic indicator is off, recordings are stopped, and the demo is idle.

### Step 6: Keep recorded samples as the immediate fallback

Do not remove, hide, or subordinate the five recordings behind the live session. Visitors may play them without microphone permission before, during (after ending the live session), or after a failed session. Starting live mode must stop sample playback; starting a sample must first end any live session.

Keep the existing illustrative-demo disclosure for the fictional course, callers, policies, and tee times. Do not add a call-me option.

**Verify**: all five recordings remain visible and playable; live and recorded audio never overlap.

### Step 7: Make privacy and microcopy match real provider behavior

Replace “No recording is saved” unless the finished agent configuration and provider retention settings make that literally true. Before Start, disclose microphone use, AI interaction, recording/transcript behavior, provider processing, and a Privacy link in concise language. Update Privacy with the approved demo-agent categories, purposes, provider, and retention.

Do not enable the live demo until the website copy and actual ElevenLabs settings agree. Do not claim that demo conversations become customer support requests.

**Verify**: compare rendered copy with the approved agent settings and Privacy; every collected/stored data category is disclosed and no absent collection is claimed.

### Step 8: Run the full launch acceptance matrix

Run all project gates, then manually exercise the live demo on a Vercel preview in current Chrome and Safari on desktop and mobile where available:

- permission granted and denied;
- successful start, multi-turn conversation, mute, and end;
- upstream/session failure;
- network interruption and reconnect/error behavior;
- sample playback before/after live session;
- soft and full navigation cleanup;
- reduced motion;
- keyboard and screen-reader state text.

**Verify**:

- `bun run typecheck` → exit 0.
- `bun run check` → exit 0.
- `bun run build` → exit 0.
- Every matrix case has the expected visible state and cleanup behavior.

## Test plan

By explicit owner decision, do not add automated tests. Use the real-provider preview acceptance matrix in step 8 plus Vercel function/WAF inspection. Record the agent environment/branch, browsers, permission outcomes, session cleanup, and provider-retention configuration in the completion note.

## Done criteria

- [ ] Orb holds a genuine multi-turn agent conversation.
- [ ] Mic permission and signed session are requested only after explicit Start.
- [ ] API key stays server-only and session minting is rate-limited.
- [ ] Accessible states and Start/End/mute/error controls match reality.
- [ ] Navigation and disconnection fully release session/audio/mic resources.
- [ ] Five recorded samples remain available and never overlap live audio.
- [ ] Privacy/microcopy match actual recording and retention settings.
- [ ] Typecheck, check, build, and the manual acceptance matrix pass.
- [ ] No out-of-scope file is modified.

## STOP conditions

- The finished agent prerequisite, agent authentication, or cost controls are missing.
- The agent can write to production tee sheets from the public demo.
- Recording/retention/training behavior is unknown or conflicts with website disclosure.
- The API key would need to reach the browser or the agent must be public.
- Cleanup cannot reliably end sessions and microphone capture on navigation.
- Implementation expands into building the agent, tools, or product backend.

## Maintenance notes

Recheck the SDK integration against current ElevenLabs docs during upgrades; signed URL/token and hook APIs can change. Treat agent settings, session endpoint, demo microcopy, Privacy, WAF limits, and recorded fallback as one launch surface.
