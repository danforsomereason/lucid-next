# certificates.* procedures

In `lib/rpc/procedures/certificates.ts`. Generates a PDF certificate on demand using `pdf-lib` and the helper `utils/generateCertificate.ts` that already exists in the repo (but is not yet wired up anywhere).

---

## certificates.download

**Roles:** any (owner of assignment).
**Touched tables:** `assigned_courses`, `courses`, `users` (joined, read-only).

### Input

```ts
z.object({
  assignedCourseId: z.string().uuid(),
})
```

### Output

**Special case.** This procedure does NOT return JSON — it streams an `application/pdf` body. The dispatcher recognizes a `Response`-returning handler and passes it through verbatim. (This is the one allowed escape hatch from the `{ ok, data }` envelope; it is documented here and in `lib/rpc/server/dispatch.ts`.)

### Behavior

1. Load assignment WHERE `id = input.assignedCourseId`. → `NOT_FOUND` if missing.
2. Verify owner.
3. Verify "complete": `assignment.quizPassedAt != null AND assignment.completedAt != null AND assignment.completedAt > NOW() - 365d`. → `FORBIDDEN: NOT_COMPLETE` otherwise.
4. Load `courses` and `users` (for instructor + recipient names).
5. Compute `score` from `quiz_answers` for this assignment (count correct / total).
6. Call `generateCertificatePdf({ userName, courseName, ceHours, completionDate, score })`.
7. Return new `Response(pdfBytes, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="lucid-certificate-${course.id}.pdf"` } })`.

### Notes

- The certificate is NOT persisted; we regenerate it on each request. If a customer later wants archival, we'll add a `certificates` table holding the SHA-256 of the rendered PDF + the inputs, and serve from there.
- Don't include the approval body number on the PDF until `course_approvals` is reliably populated (see `03-schema.md`). The current helper at `utils/generateCertificate.ts` doesn't include it yet — that's intentional.

### Playwright validation

- Complete a course end-to-end → click "Download certificate" → browser downloads a PDF with the right name and CEU hours.
- Try to download a certificate for an in-progress course → 403.
