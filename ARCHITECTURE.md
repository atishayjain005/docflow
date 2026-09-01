# Architecture note

## Product slice

Ajaia Docs is intentionally a small shared workspace rather than a Google Docs clone. The core loop is: choose a seeded member, create or import a document, edit it in a familiar browser surface, save it, and share it with another teammate.

## Decisions

- **React + Vite frontend, shared Express API:** keeps the editor fast to iterate on while preserving a clear full-stack boundary.
- **PostgreSQL + Drizzle:** documents and share grants survive refreshes and can be inspected or extended without hiding state in the browser.
- **HTML as the editor payload:** `contentEditable` plus browser editing commands provide useful rich text without spending the timebox integrating a large editor framework. The server stores the resulting structure as text and derives a word count.
- **Seeded user switcher instead of auth:** this makes the access model demonstrable without introducing local password handling or an auth provider. Every request carries the selected demo user in `X-User-Id`; the API still enforces owner/shared access.
- **Text/Markdown import instead of binary parsing:** it is product-relevant, easy to verify end to end, and keeps unsupported file behavior explicit.

## Data model

`ajaia_users` stores the reviewer identities. `ajaia_documents` stores title, HTML content, owner, timestamps, and derived word count. `ajaia_document_shares` is a unique `(document_id, user_id)` grant table with cascade deletion from documents.

The API contract lives in `lib/api-spec/openapi.yaml`; generated React Query hooks and Zod schemas are the shared interface between the frontend and API.

## Deliberate tradeoffs

There is no real-time collaboration channel or conflict-resolution protocol. Saves are explicit and last-write-wins. This is a conscious cut: the assignment rewards a working document/share loop more than a partial multiplayer editor. The next infrastructure addition would be authenticated sessions plus optimistic version checks before adding presence or live cursors.
