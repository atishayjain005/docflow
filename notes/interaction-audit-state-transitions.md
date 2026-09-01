# Interaction Audit State Transitions

Validate each interactive element through the lifecycles that apply to its role.

| Lifecycle case | What to validate |
| --- | --- |
| Default | Element is visible, named accessibly, and uses the correct cursor for its availability. |
| Hover | Actionable elements show hover feedback; disabled elements do not look actionable. |
| Click / pointer active | Clickable controls show active feedback and execute exactly one intended action. |
| Keyboard activation | Links/buttons/selects work with keyboard navigation and activation where native semantics support it. |
| Focus | Focus ring or focus styling is visible and does not conflict with selected/open styling. |
| Blur | Focus-only styling clears without losing persistent selected/open state. |
| Selected / active | Route, toolbar, menu, and user selection states remain visible until the underlying state changes. |
| Disabled | Disabled controls cannot be activated, expose disabled semantics, and use non-actionable cursor/styling. |
| Loading / pending | Pending operations disable repeat submits and expose clear loading status. |
| Success | Successful actions update visible state and clear temporary messages after the intended timeout. |
| Error | Failed operations leave recovery controls available and do not claim success. |
| Outside click | Menus/modals that should dismiss on outside click do so without triggering background actions. |
| Escape | Menus/modals dismiss on Escape where expected. |
| Navigate away/back | Route-backed state is restored correctly; unsaved local edits are not silently represented as saved. |
| Rapid repeated click | Pending mutations and command buttons do not enqueue duplicate unintended actions. |
| Editor collapsed cursor | Toolbar active state reflects marks/block at the caret. |
| Editor multi-selection | Toolbar active state reflects the selected content and commands apply to the selection. |
| Editor selection change | Toolbar states update on click, keyboard movement, mouse selection, and focus changes. |
| Save state | Saved -> dirty -> saving -> saved/error transitions are driven by actual content/title diffs. |
