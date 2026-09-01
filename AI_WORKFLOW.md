# AI workflow note

I used AI in two ways:

1. **Product shaping:** turn the broad assignment into a narrow, reviewable slice with an explicit feature boundary, seeded reviewer identities, and a short end-to-end walkthrough.
2. **Implementation acceleration:** generate the initial API contract and frontend structure, then use the generated types and compiler feedback to connect the real screens to the real API.

AI materially sped up the first-pass layout and repetitive API wiring. I did not accept the first pass blindly:

- I changed the generated API contract after the workspace's Zod version rejected integer validators.
- I fixed the initial default user mismatch so the seeded workspace opens as Maya rather than an unknown member.
- I added the missing bulleted and numbered list commands after reviewing the assignment against the editor toolbar.
- I kept `.docx`, real authentication, realtime editing, comments, and version history out of the first release instead of accepting speculative scaffolding.

Correctness was checked with the workspace typecheck, database schema push, API route validation, and an automated smoke test that exercises create → save → share → shared access. UX quality was checked by reviewing loading, empty, error, success, responsive, and owner/shared states in the implemented screens.
