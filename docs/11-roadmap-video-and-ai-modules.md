# 11 — Roadmap: video and AI simulation modules

These are the two "future capability" extension points called out in the original spec. The data model and module dispatch path are already designed to accommodate them (see ADR-0004 and the `modules` table in [`03-schema.md`](./03-schema.md)). This doc captures the **product intent** and the **implementation plan** for each.

---

## Video modules

### Product intent (question 19)

Instructors do NOT upload video files into Lucid. They host the video themselves on **YouTube** or **Vimeo** (the two providers chosen because they have well-behaved embed players and don't require server-side auth) and paste a URL into the module form. Lucid embeds an iframe.

We are explicitly not in the video hosting business. Cloudinary credentials are present in `.env` but are not used by the video module path.

### Schema

Already on `modules`:

```ts
moduleType:     'video',
videoProvider:  videoProviderEnum,  // 'youtube' | 'vimeo'
videoUrl:       text,                // the canonical URL the instructor pasted
```

### URL validation

Per provider, normalize and validate on input:

```ts
// lib/video/normalize.ts
export function parseVideoUrl(provider: VideoProvider, raw: string): { id: string; embedUrl: string } | null {
  if (provider === 'youtube') {
    const id = matchYoutubeId(raw);                  // handles /watch?v=, /embed/, youtu.be/
    return id ? { id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (provider === 'vimeo') {
    const id = matchVimeoId(raw);                    // numeric id after /
    return id ? { id, embedUrl: `https://player.vimeo.com/video/${id}` } : null;
  }
  return null;
}
```

`courses.create` rejects unparseable URLs with `BAD_REQUEST: BAD_VIDEO_URL`. The stored `videoUrl` is the original; the embed URL is computed at render time.

### Player

`components/modules/VideoModulePlayer.tsx` (to be added) renders a `<iframe>` with `allowFullScreen` and YouTube's `enablejsapi=0` (we don't subscribe to playback events — completion is user-marked by clicking **Complete Module**, same as text).

### Completion semantics

A video module is completed the same way as a text module: the user clicks **Complete Module** and we call `modules.end`. We do **not** verify they watched it through — these are CEU-bearing courses where the legal liability rests on the user, and adversarial watch-tracking adds complexity for low value.

### Open questions (deferred until first real customer asks)

- Captions / accessibility requirements.
- Subtitles for non-English speakers.
- Adaptive bitrate / Mux migration if YouTube/Vimeo bandwidth becomes a customer concern.

---

## AI simulation modules

### Product intent (question 20)

Instructors craft a clinical scenario: they write **(a)** an opening statement spoken by an imaginary patient and **(b)** the criteria a competent clinician's response should meet. Lucid presents the opening statement to the user, accepts a single free-text response, and asks OpenAI to judge whether the response satisfies the criteria. Pass closes the module; fail prompts the user to try again.

This is a **single-turn** evaluation in V1 — no back-and-forth dialogue. Multi-turn is on the roadmap below.

### Schema

On `modules`:

```ts
moduleType:           'ai_simulation',
aiInitialStatement:   text,    // the patient's opening line
aiResponseCriteria:   text,    // the instructor's rubric
```

On a new `module_ai_attempts` table — see [`03-schema.md`](./03-schema.md#module_ai_attempts-new--for-ai-simulation-modules).

### The procedure

`aiSimulation.evaluate` — see [`06-procedures/ai.md`](./06-procedures/ai.md) for the full spec.

### OpenAI call

- **Model**: pinned to `gpt-4.1-mini` in V1. Configurable via `env.OPENAI_MODEL` if we want to A/B later.
- **API**: Responses API (`openai.responses.create`) with a `response_format: { type: 'json_schema', json_schema: {...} }` to force a typed verdict.
- **System prompt** (in `lib/ai/prompts.ts`):

    ```text
    You are a clinical training evaluator for behavioral-health professionals.
    You will be given:
      - A scenario opening (what a patient or client said)
      - Evaluation criteria (what a competent clinician's response should do)
      - A user's response
    Decide whether the user's response satisfies the criteria.
    Respond ONLY with the JSON object specified by the response schema.
    Set `pass=true` only when the response substantially meets the criteria; partial
    credit is not allowed.
    Keep `rationale` under 800 characters; address the user directly in second person.
    ```

- **User content**: a single message containing JSON with `scenario_opening`, `evaluation_criteria`, `user_response`.
- **Cost cap**: rate-limited per-user (10 attempts/min) and per-org (deferred); each attempt is bounded by `userResponse` ≤ 5000 chars.

### Privacy

The user's response is sent to OpenAI. We do **not** send any PII (no name, no email, no user id). Stored attempts retain the response for audit but are never surfaced cross-tenant.

We will not enroll OpenAI training opt-out per request — we rely on the OpenAI API's default ToS (data is not used for training).

### Open questions (roadmap)

- **Multi-turn**: V2 could allow up to N back-and-forth turns and grade the whole conversation. Schema would gain a `module_ai_messages(attempt_id, role, content, order)` table.
- **Streaming**: not in V1; users can wait 1–3s for a verdict.
- **Cost reporting**: per-org token usage rollup once we have admin billing UI.
- **Model fallback**: if `gpt-4.1-mini` is unavailable, fall back to `gpt-4.1`. Not in V1.
- **Provider-agnostic**: we may eventually want to support Anthropic / Gemini for diversity. Designed for the abstraction in `lib/ai/provider.ts` (single function `evaluate(scenario, criteria, response): Promise<{ pass, rationale }>`); swap the implementation without touching the procedure.

### Why not LangChain or AI SDK?

We make one call per attempt with a strict JSON schema. The thin OpenAI client is enough. Don't introduce LangChain / Vercel AI SDK / instructor for this — it's overkill for the surface area we have. Revisit if multi-turn or RAG appears.

---

## Other "could-do" features (not yet specified)

These appear in the spec or in old code but are explicitly **not** scoped for V1:

- Payments / Stripe / premium-course entitlement table.
- Email delivery (SMTP) for invites and completion certificates.
- Push notifications.
- Mobile apps.
- Public webhook for third-party LMS interop.
- Audit log table (`audit_log`).
- Course versioning (snapshots).

Each will get its own ADR when promoted from "could-do" to "doing."
