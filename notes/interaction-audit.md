# Interaction Audit

| Element | Route | Type | Current state | Expected state | Fix needed | Tested lifecycle |
| --- | --- | --- | --- | --- | --- | --- |
| Brand link | All shell routes | Link | Navigates home with hover/active styling | Navigate to workspace and close mobile nav | None | Pending |
| New document | All shell routes | Link/modal trigger | Opens `/?new=1` create modal | Pointer, hover, active, create modal opens | Verify modal lifecycle | Pending |
| Workspace nav | `/` | Link/filter reset | Navigates to unfiltered workspace | Selected only on base workspace route | Harden active calculation | Pending |
| My documents nav | `/?filter=owned` | Link/filter | Routes to owned filter | Selected on owned filter, pointer when enabled | Harden active calculation | Pending |
| Shared with me nav | `/?filter=shared` | Link/filter | Routes to shared filter | Selected on shared filter, pointer when enabled | Harden active calculation | Pending |
| Mobile menu open/close | Small screens | Button/overlay | Opens sidebar overlay | Escape/outside close, focus/click states | Verify lifecycle | Pending |
| User switcher | All shell routes | Dropdown | Opens a custom popover | Click/outside/Escape behavior and selected member state | Add outside/Escape dismiss | Pending |
| Refresh workspace | `/` | Button | Refetches dashboard/list | Pointer, hover, active, loading spinner | Verify rapid click behavior | Pending |
| Blank document | `/` | Button/modal trigger | Opens create modal | Disabled only while pending, form submit on title | Verify lifecycle | Pending |
| Import file | `/` | Button/modal trigger | Opens import modal | File picker, disabled submit until file selected | Verify lifecycle | Pending |
| Search documents | `/` | Text input/filter | Filters list locally | Focus ring, empty state, no navigation side effect | Verify focus/blur | Pending |
| Document row | `/` | Link/card | Opens editor | Pointer, hover, active, keyboard navigation | Verify lifecycle | Pending |
| Back to workspace | `/document/:id` | Link | Navigates home | Pointer, hover, active | None | Pending |
| Document title | `/document/:id` | Text input | Marks dirty on every change | Dirty only when title differs from saved title | Fix dirty diffing | Pending |
| Share | `/document/:id` owner only | Button/modal trigger | Opens share dialog | Owner-only enabled, non-owner absent/disabled by design | Verify lifecycle | Pending |
| Save | `/document/:id` | Button | Enabled when dirty | Explicit saved/dirty/saving/error states | Fix save model | Pending |
| Editor kebab | `/document/:id` | Menu trigger | Button only sets status message | Open accessible menu with real/disabled actions | Wire dropdown menu | Pending |
| Bold | `/document/:id` | Toolbar button | Executes command, static inactive styling | Reflect current selection and change content only when needed | Fix selection-aware state | Pending |
| Italic | `/document/:id` | Toolbar button | Executes command, static inactive styling | Reflect current selection | Fix selection-aware state | Pending |
| Underline | `/document/:id` | Toolbar button | Executes command, static inactive styling | Reflect current selection | Fix selection-aware state | Pending |
| Strikethrough | `/document/:id` | Toolbar button | Executes command, static inactive styling | Reflect current selection | Fix selection-aware state | Pending |
| Heading | `/document/:id` | Toolbar button | Executes `formatBlock` as `h2` | Reflect block state and announce pressed/open state | Fix selection-aware state | Pending |
| Code style | `/document/:id` | Toolbar button | Executes `formatBlock` as `pre` | Reflect block state | Fix selection-aware state | Pending |
| Bulleted list | `/document/:id` | Toolbar button | Executes command, static inactive styling | Reflect list state | Fix selection-aware state | Pending |
| Numbered list | `/document/:id` | Toolbar button | Executes command, static inactive styling | Reflect list state | Fix selection-aware state | Pending |
| Add link | `/document/:id` | Toolbar button/prompt | Prompts for URL and creates link | Dirty only after real link mutation | Fix command diffing | Pending |
| Undo/Redo | `/document/:id` | Toolbar button | Executes command and marks dirty | Dirty based on actual content after command | Fix command diffing | Pending |
| Editor surface | `/document/:id` | Contenteditable | Input marks dirty | Dirty from actual title/content diff | Fix dirty diffing | Pending |
| Share dialog close | `/document/:id` | Button/modal close | Closes dialog | Outside/Escape dismiss and focus states | Verify lifecycle | Pending |
| Share user select | `/document/:id` | Select | Enables share submit when selected | Focus/hover, disabled submit until valid | Verify lifecycle | Pending |
| Share submit | `/document/:id` | Button/mutation | Grants access | Pending, success, error, rapid click disabled | Verify lifecycle | Pending |
| Document loading | `/document/:id` | Overlay/state | Skeleton | Noninteractive loading state | None | Pending |
| Document error | `/document/:id` | State/link | Shows fallback and back link | Actionable back link | Verify lifecycle | Pending |
