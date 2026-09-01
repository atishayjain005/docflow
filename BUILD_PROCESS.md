# How DocFlow Was Built

DocFlow is a lightweight collaborative document workspace built for a short take-home style submission. The final product lets a reviewer switch between seeded teammates, create documents, edit rich content, import Markdown or text files, share documents, and verify access from another user.

## 1. First Draft In Replit

The first working draft was generated in Replit. Replit produced the initial monorepo shape, the web artifact, a video/story artifact, the Express API, shared API client packages, and the Drizzle/PostgreSQL data model.

That first draft established the core product direction:

- A focused document workspace rather than a full Google Docs clone.
- Seeded users instead of production authentication so access control could be demonstrated quickly.
- A React/Vite frontend for fast UI iteration.
- An Express API with OpenAPI/Zod contracts.
- PostgreSQL persistence through Drizzle.
- A smoke-test script to exercise the main API workflow.

The Replit draft was useful because it gave the project a running skeleton, but it still needed naming cleanup, API hardening, deployment work, and interaction polish before it was ready to submit.

## 2. Product Plan

The implementation plan defined the target user journey:

1. Open the workspace as Maya.
2. See owned and shared documents.
3. Create a new document.
4. Open and edit a document.
5. Save title and content changes.
6. Import `.txt`, `.md`, or `.markdown` files.
7. Share a document with Sam or Noor.
8. Switch users and confirm shared access works.
9. Provide clear setup, architecture, AI workflow, validation, and submission notes.

The plan also called out deliberate scope cuts. Real authentication, live multiplayer editing, comments, version history, document deletion, revoke access, and `.docx` parsing were kept out of scope so the core document/share loop could be completed reliably.

## 3. Cursor Cleanup And Renaming

Cursor was then used to turn the Replit draft into the final DocFlow project.

The first cleanup pass renamed the project from the generated Ajaia naming to DocFlow:

- `artifacts/ajaia-docs` became `artifacts/docflow`.
- `artifacts/ajaia-docs-video` became `artifacts/docflow-video`.
- `scripts/src/ajaia-docs-smoke.ts` became `scripts/src/docflow-smoke.ts`.
- Workspace package names changed from `@workspace/ajaia-docs` to `@workspace/docflow`.
- Database table names changed from `ajaia_*` to `docflow_*`.
- CSS animation classes, screenshot names, seed data, copy, and docs were updated to use DocFlow.

This made the repository, artifacts, docs, and deployed product consistent.

## 4. API Fixes From The Review Plan

The supplied API fix plan was implemented in Cursor.

### Auth Middleware

The repeated `X-User-Id` parsing logic in document routes was extracted into `artifacts/api-server/src/middlewares/auth.ts`.

Each document route now reads the normalized user id from `res.locals.userId`, which keeps the route handlers focused on business logic.

### JSON Error Handling

Every async document route was wrapped in `try/catch`. Database failures and unexpected exceptions now return JSON:

```json
{ "error": "Internal server error" }
```

This avoids Express returning HTML error pages to API clients.

### Query Performance

`getWorkspaceRows` no longer loads all documents and shares before filtering in JavaScript. It now:

1. Loads share rows for the current user.
2. Loads owned documents and shared documents with targeted database queries.
3. Deduplicates visible documents.
4. Loads only share rows for visible documents.
5. Resolves only the users needed for those visible rows.

That reduces the request cost as the database grows.

### Import Route Simplification

The import route had a dead ternary where both branches called `markdownToHtml`. It was replaced with a single call and a comment explaining that plain text is intentionally treated as Markdown.

## 5. Deployment On Vercel

The GitHub repository was renamed to `docflow`, and the repo About section was updated with:

- Homepage: `https://docflow-xi-eight.vercel.app`
- Description: `DocFlow — a lightweight collaborative document workspace for creating, editing, importing, and sharing documents with a small team.`
- Topics: `docflow`, `collaborative-editor`, `vite`, `express`, `postgresql`

Vercel deployment required a few production-specific changes:

- `api/index.mjs` exports the serverless Express app.
- `artifacts/api-server/src/serverless.ts` exposes the Express app without starting a port listener.
- `artifacts/api-server/build.mjs` builds both the local server entry and serverless entry.
- `vercel.json` routes `/api/*` to the serverless API and all app routes to the Vite output.
- `scripts/vercel-build.mjs` checks `DATABASE_URL` before syncing the Drizzle schema.
- Neon/PostgreSQL environment variables were configured in Vercel.

The live app is:

https://docflow-xi-eight.vercel.app

## 6. Git Identity Fix

Early commits used a local machine fallback email. The global and repository-local Git identity were corrected to:

- Name: `Atishay Jain`
- Email: `atishay005@gmail.com`

New commits now use the verified email, which also unblocked Vercel deployment checks.

## 7. Interaction And Feature Polish

Cursor was also used to fix deployed feature behavior and interaction states.

The polished UI focuses on:

- Working seeded user switching.
- User-scoped data refresh and caching.
- Document creation and opening.
- Editing and saving document content.
- Importing text and Markdown.
- Sharing documents with seeded teammates.
- Clear hover states on clickable controls.
- Clear active states for selected navigation and toolbar controls.
- Correct pointer and disabled cursor behavior.
- Loading, empty, and error states that are visible to reviewers.

## 8. Walkthrough Artifact

The walkthrough artifact is now a dedicated video page backed by a longer MP4 product tour. It is deployed under the same production domain at:

https://docflow-xi-eight.vercel.app/walkthrough/

This walkthrough page opens the video directly and covers the workspace, blank document creation, import flow, editor typography, sharing, member switching, route filters, and submission handoff.

## 9. Validation

Validation covered the most important delivery paths:

- TypeScript library build with `pnpm run typecheck:libs`.
- API server typecheck.
- Web app typecheck.
- Scripts typecheck.
- Vercel production build.
- Vercel production deployment.
- API health check at `/api/healthz`.
- Manual deployed-app review of the main document workflow.

The smoke test can be run with:

```bash
pnpm --filter @workspace/scripts run smoke
```

For a deployed target, set:

```bash
DOCFLOW_API_BASE_URL=https://docflow-xi-eight.vercel.app/api
```

## 10. Final Submission Links

- Live app: https://docflow-xi-eight.vercel.app
- Walkthrough: https://docflow-xi-eight.vercel.app/walkthrough/
- Repository: https://github.com/atishayjain005/docflow

