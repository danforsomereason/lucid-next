# aiSimulation.* procedures

In `lib/rpc/procedures/ai.ts`. Lives behind the same RPC contract as everything else but is the only family that calls an external paid API (OpenAI). All AI calls happen server-side; the `OPENAI_API_KEY` is never sent to the browser.

Conceptually: an instructor authors an `ai_simulation` module by writing **(a)** an opening statement (in character — e.g. "I've been feeling really hopeless lately and I don't know if I want to keep going to these sessions...") and **(b)** evaluation criteria (e.g. "The clinician should acknowledge the feeling, perform a safety assessment, and avoid prescribing solutions in the first turn."). At runtime the user posts a single response; we ask OpenAI to judge it against the criteria and return pass/fail with a rationale.

---

## aiSimulation.evaluate

**Roles:** any (owner of assignment).
**Touched tables:** `module_ai_attempts`, `module_progress` (set `end_module` on pass).
**Transactional:** yes when a passing attempt also ends the module.
**External calls:** OpenAI Responses API (one call per invocation).

### Input

```ts
z.object({
  assignedCourseId: z.string().uuid(),
  moduleId:         z.string().uuid(),
  userResponse:     z.string().min(1).max(5000),
})
```

### Output

```ts
z.object({
  verdict:        z.boolean(),         // true = pass
  rationale:      z.string(),          // for the UI to show
  attemptNumber:  z.number().int(),
  moduleEnded:    z.boolean(),         // true if this pass closed module_progress.endModule
})
```

### Behavior

1. Load assignment; verify owner.
2. Load module; verify `module.courseId = assignment.courseId AND module.moduleType = 'ai_simulation'`.
3. Verify `module_progress` exists for this assignment/module (user must have hit `modules.start` first); → `BAD_REQUEST: MODULE_NOT_STARTED`.
4. If `module_progress.endModule IS NOT NULL` → `CONFLICT: ALREADY_PASSED`.
5. Count prior `module_ai_attempts` for this `module_progress` → `attemptNumber = count + 1`.
6. Build the OpenAI request:

    ```ts
    // lib/ai/openai.ts
    const completion = await openai.responses.create({
      model: 'gpt-4.1-mini',                // pinned in env-validated config
      input: [
        { role: 'system', content: AI_SIM_EVALUATOR_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify({
            scenario_opening: module.aiInitialStatement,
            evaluation_criteria: module.aiResponseCriteria,
            user_response: input.userResponse,
        })},
      ],
      response_format: { type: 'json_schema', json_schema: AI_SIM_VERDICT_SCHEMA },
    });
    const { pass, rationale } = JSON.parse(completion.output_text);
    ```

    The `AI_SIM_EVALUATOR_SYSTEM_PROMPT` lives in `lib/ai/prompts.ts` and instructs the model to act as a behavioral-health training evaluator and to respond ONLY with the JSON schema. The JSON schema:

    ```ts
    {
      type: 'object',
      properties: {
        pass:      { type: 'boolean' },
        rationale: { type: 'string', maxLength: 1000 },
      },
      required: ['pass', 'rationale'],
      additionalProperties: false,
    }
    ```

7. Insert `module_ai_attempts` row with `evaluator_verdict`, `evaluator_rationale`, `model_name = 'gpt-4.1-mini'`.
8. If `pass = true`, in the **same transaction**, set `module_progress.endModule = NOW()`. Return `moduleEnded: true`.
9. Else return `moduleEnded: false`.

### Error codes

- `BAD_REQUEST`: `MODULE_NOT_STARTED`, `NOT_AI_MODULE`.
- `FORBIDDEN`: not assignment owner.
- `CONFLICT`: `ALREADY_PASSED`.
- `INTERNAL`: OpenAI call failed (log full error server-side; client message stays generic).

### Cost / rate-limit notes

- One call per attempt. We do not stream.
- If OpenAI returns malformed JSON despite the schema (rare), treat as `INTERNAL` and let the user retry.
- We do NOT cache results — each attempt is independent.

### Privacy

- The user's response is sent to OpenAI as input. We do not include any PII (no name, no email, no user id) — only the scenario, criteria, and free-text response.
- Stored `module_ai_attempts.userResponse` is retained for audit and to power "see prior attempts" UI.

### Playwright validation

- Pass an attempt → module advances.
- Fail an attempt → can try again, attempt counter increments.
- Attempts persist across page reload.
