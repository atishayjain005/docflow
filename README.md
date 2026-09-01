# Ajaia Docs

A focused collaborative document workspace for small teams. Create and rename documents, edit rich HTML content in the browser, import `.txt` and `.md` files, and share documents with seeded teammates.

## Reviewer quick start

1. Start the API and web services in two terminals:

   ```bash
   pnpm --filter @workspace/api-server run dev
   pnpm --filter @workspace/ajaia-docs run dev
   ```

2. Open the web preview.
3. Use the member switcher in the lower-left corner to demonstrate access:
   - **Maya Chen** (`maya`) owns the seeded welcome document.
   - **Sam Rivera** (`sam`) owns “Q3 planning notes”.
   - **Noor Patel** (`noor`) is available as another share target.
4. As Maya, open “Welcome to Ajaia Docs”, edit the title or content, click **Save**, then use **Share** to grant Sam access.
5. Switch to Sam and confirm the document appears under **Shared with me**.

The import flow intentionally supports `.txt`, `.md`, and `.markdown` only. Markdown headings and ordered/unordered lists are converted into editable rich content. `.docx` and binary attachments are intentionally out of scope for this timeboxed slice.

## Local setup

Requirements: Node.js 24 and pnpm.

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

The project uses the preconfigured PostgreSQL database via `DATABASE_URL`. The API seeds three demo users and two starter documents on first request.

## Automated validation

With the API service running:

```bash
pnpm --filter @workspace/scripts run test:ajaia-docs
```

The smoke test creates a temporary document, saves formatted HTML content, shares it with Sam, and verifies that Sam can see it as a shared document. To target another API URL, set `AJAIA_API_BASE_URL` to the `/api` base.

## Scope and next steps

Working: document creation, rename/save/reopen, rich formatting (bold, italic, underline, headings, code blocks, links, bulleted and numbered lists), text/Markdown import, PostgreSQL persistence, seeded user switching, owner/shared visibility, owner-only sharing, loading/empty/error/success states, and responsive layout.

Intentionally incomplete: real authentication, concurrent real-time editing, comments, version history, revoking access, `.docx` parsing, binary attachment storage, and document deletion. With another 2–4 hours, I would add real auth and role-aware permissions first, then presence/version history and a safe revoke-access flow.

## Delivery notes

- Architecture rationale: `ARCHITECTURE.md`
- AI workflow note: `AI_WORKFLOW.md`
- Submission checklist: `SUBMISSION.md`
- Walkthrough handoff: `WALKTHROUGH_VIDEO_URL.txt`
