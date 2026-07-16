# FleetOS Responsive, Accessibility, and UX Direction

## Purpose and status

This document defines responsive behavior, accessibility requirements, and common UX rules for the FleetOS frontend direction.

It establishes required design intent but does not claim current WCAG conformance, approve a final conformance level, select supported browsers or assistive technologies, or certify the current applications.

## UX rule registry

| ID | UX rule |
|---|---|
| `UX-001` | Every page identifies FleetOS, the current module, and the page task without implying merged module ownership. |
| `UX-002` | Current implementation evidence, transitional behavior, v1 target behavior, and future capability remain visibly distinguishable in documentation and release communication. |
| `UX-003` | Primary task content and critical data state appear before secondary analytics, help, or diagnostics. |
| `UX-004` | Loading, empty, missing, ambiguous, stale, fallback, offline, unauthorized, unavailable, and unexpected error are distinct experiences. |
| `UX-005` | Source, `as_of`, generated time, stale reason, and fallback state remain discoverable wherever maintenance read data is presented. |
| `UX-006` | AutoPM interactions remain read-only for maintenance workflow information. |
| `UX-007` | PM Assistant commands show consequence, pending state, authoritative result, and safe recovery. |
| `UX-008` | Search and filters show applied values, support reset, and do not imply a full population when only a server page is loaded. |
| `UX-009` | Destructive or history-affecting actions require explicit confirmation proportional to risk. |
| `UX-010` | Status communication uses the exact domain context and never relies on color alone. |
| `UX-011` | Responsive layouts prioritize tasks and meaning rather than scaling desktop density unchanged. |
| `UX-012` | Essential information and actions never depend on hover. |
| `UX-013` | Feedback remains near the affected region; transient toast feedback is supplemental. |
| `UX-014` | Dates, times, and numbers are formatted consistently and retain unambiguous source meaning. |
| `UX-015` | Thai and mixed Thai/English content wraps, aligns, and truncates without damaging source values. |
| `UX-016` | Long operations provide progress or stage context and safe cancellation direction only when supported by the owning boundary. |
| `UX-017` | Copy/export identifies the selected scope and preserves required source/freshness context. |
| `UX-018` | Diagnostics and settings use plain-language safe summaries; raw technical detail is restricted and redacted. |
| `UX-019` | Feature-disabled, unauthorized, unavailable, and not-implemented states are not interchangeable. |
| `UX-020` | Recovery actions are specific, bounded, and do not encourage reverse synchronization or unsafe repeated mutation. |

## Accessibility requirement registry

| ID | Accessibility requirement |
|---|---|
| `A11Y-001` | Pages use semantic landmarks and one clear primary heading. |
| `A11Y-002` | All functionality is operable by keyboard without a pointer-only or hover-only path. |
| `A11Y-003` | Keyboard focus is visible, ordered logically, and not obscured by sticky or overlay content. |
| `A11Y-004` | Modal dialogs and navigation drawers contain focus while open and restore focus when closed. |
| `A11Y-005` | Links, buttons, tabs, menu controls, and disclosure controls use correct semantics, names, states, and relationships. |
| `A11Y-006` | Form fields have persistent labels, instructions, required-state cues, and programmatically associated errors. |
| `A11Y-007` | Validation includes a discoverable summary and moves or guides focus without trapping the user. |
| `A11Y-008` | Tables have accessible names, headers, sorting state, selection state, and a usable narrow-screen alternative where required. |
| `A11Y-009` | Status, chart, alert, and selection meaning is available without color alone. |
| `A11Y-010` | Text, controls, focus indicators, charts, and state cues meet the Product Owner-approved contrast target. |
| `A11Y-011` | Body text, labels, metrics, and controls remain readable at supported zoom and text-spacing settings. |
| `A11Y-012` | Content reflows without loss of information or two-dimensional scrolling except where intrinsically necessary, such as approved wide tables. |
| `A11Y-013` | Important asynchronous results use restrained live-region or equivalent announcement behavior and remain available visually. |
| `A11Y-014` | Motion respects reduced-motion preference and avoids unnecessary flashing, parallax, or disorienting transitions. |
| `A11Y-015` | Thai Unicode, combining marks, line height, word wrapping, and mixed-language reading order remain intact. |
| `A11Y-016` | Calendar content has a keyboard-operable and screen-reader-oriented list/table alternative. |
| `A11Y-017` | Touch targets, spacing, and gesture alternatives meet the approved mobile accessibility target. |
| `A11Y-018` | Accessibility acceptance includes automated checks and human keyboard, screen-reader-oriented, zoom/reflow, Thai, and failure-state review. |

The exact WCAG version/level, browsers, assistive technologies, viewport matrix, and exception process remain `DEC-012`.

## Responsive strategy

Responsive behavior is content-driven. Example breakpoint values in current CSS are evidence only; final breakpoints are selected from layout failure points and tested devices.

### Desktop direction

- Persistent module navigation may be visible.
- Dashboards may use multiple columns.
- Tables may retain more columns.
- Filters may share a horizontal toolbar.
- Vehicle/plan detail may use a side panel if focus and available width remain acceptable.
- Source/freshness remains visible without requiring a settings page.
- Dense operational layouts still maintain readable text and focus spacing.

### Tablet direction

- Navigation may collapse into a drawer or compact rail.
- Dashboard grids reduce columns.
- Filter groups wrap or move to a controlled panel.
- Detail panels may become full-width regions.
- Tables prioritize columns and provide horizontal overflow or record alternatives.
- Page actions wrap in logical order.
- Calendar side summaries move below the primary calendar/list.

### Mobile direction

- Use one primary content column.
- Keep the page heading, module, critical state, and primary task visible.
- Navigation uses an accessible drawer or equivalent.
- Summary metrics use a short prioritized set with access to details.
- Wide tables use a stacked record or deliberate overflow pattern.
- Forms stack labels and controls; actions remain reachable without horizontal scrolling.
- Modals normally use viewport-safe full-width/full-height treatment where appropriate.
- Calendars provide list-first or easy list switching.
- Secondary diagnostics and dense analytics may be deferred, summarized, or explicitly unsupported pending `DEC-015`; primary maintenance tasks must not disappear silently.

## Keyboard navigation direction

Keyboard users must be able to:

- skip repeated navigation;
- open and close module navigation;
- traverse primary and secondary links in visual order;
- operate tabs and disclosures with expected keys;
- submit and clear search;
- operate filters and date controls;
- sort tables and move through row actions;
- open and close details and dialogs;
- complete PM Assistant forms and confirmations;
- use calendar navigation or its accessible alternative;
- reach recovery actions.

Custom keyboard shortcuts are future-only unless documented, discoverable, conflict-reviewed, and disableable.

## Focus management direction

- Navigation changes move focus to the new page heading or main content under an approved routing pattern.
- Background refresh does not steal focus.
- Validation guides focus to the summary or first invalid field.
- Opening a dialog moves focus inside it.
- Closing a dialog restores focus.
- Removing a row or item moves focus to a logical adjacent control or result message.
- Pagination or filtering moves focus to the updated results heading/region only when that improves context and does not surprise users.
- Stale/offline banners do not repeatedly take focus.
- Feature-switch or rollback changes do not strand focus on removed content.

## Text contrast and readable sizing

Direction:

- semantic token pairs are tested in each state and interaction;
- muted text must remain readable and not carry essential information at insufficient contrast;
- placeholder text is not a replacement for labels;
- very small current captions are implementation evidence, not target approval;
- line height accommodates Thai marks;
- metrics retain label and unit at zoom;
- focus indication remains distinct from selection, error, and hover;
- charts provide labels, values, or a data table.

No final ratio, minimum font size, or density is approved until `DEC-012`.

## Thai and Unicode presentation

- Use UTF-8 end to end.
- Preserve original display values.
- Apply normalization only for approved comparison, never destructive display rewriting.
- Do not transliterate Thai automatically.
- Do not remove combining marks or alter spelling.
- Test line breaking, truncation, copy, export, search, and form validation with Thai values.
- Avoid excessive letter spacing on Thai text.
- Choose line height and vertical padding that prevent clipping.
- Ensure ellipsis preserves access to the full label through an accessible mechanism.
- Keep vehicle number, registration, vehicle code, location, and responsibility namespaces visibly distinct.
- Treat Thai and Arabic digit conversion as unresolved identity behavior, not a display assumption.

## Date, time, and number formatting

API and audit values remain unambiguous; display formatting is locale-aware and labeled.

Direction:

- identify timezone when a time affects scheduling, freshness, history, notification, or audit;
- distinguish event time, recorded time, generated time, and `as_of`;
- use consistent date ordering;
- do not mix Gregorian and Buddhist Era years without an explicit label;
- use localized month/day names only when they remain unambiguous;
- show machine/API values only in restricted diagnostics when useful;
- use locale-aware grouping for counts and distances;
- retain unit labels such as kilometres;
- distinguish zero, null/unknown, not applicable, and unavailable;
- never use a dash as an identity or silently interpret it as zero.

Final locale, calendar era, timezone display, and precision rules remain `DEC-013`.

## Loading UX

- Initial loading uses `UISTATE-001`.
- Background refresh uses `UISTATE-002` and retains prior content.
- Loading indicators identify their region.
- Skeletons contain no believable fabricated numbers or statuses.
- Long import or report actions expose stage/progress only when the backend supplies reliable state.
- Navigation and safe cancellation remain available where supported.

## Empty UX

`UISTATE-004`:

- names the valid scope that has no results;
- reflects applied filters;
- provides reset or an owned create/import action where authorized;
- does not blame the user;
- does not appear for unavailable or failed data;
- remains distinguishable from a dashboard with legitimate zero metrics.

## Error and recovery UX

- Use stable safe error classification, not string matching.
- Give a specific recovery action: correct input, reset filter, retry read, return to list, request access, or contact the approved operator.
- Do not recommend retry for validation, authorization, identity conflict, or unsafe mutations.
- Preserve safe context after recoverable errors.
- Display correlation references only when supplied and safe.
- Keep technical detail out of general UI.
- Ensure errors are visible, programmatically associated, and not color-only.

## Stale-data and offline UX

Stale/fallback presentation includes:

- source;
- authoritative `as_of` when available;
- cache or fallback time;
- age or relative description;
- stale/fallback reason;
- read-only limitation;
- refresh/reconnect direction.

Offline with cache (`UISTATE-008`) differs from stale authoritative data (`UISTATE-006`) and transitional fallback (`UISTATE-007`). Offline without cache (`UISTATE-009`) does not show empty results.

## Modal and confirmation UX

- Use a page for long workflows.
- Confirm destructive or history-affecting actions with the exact resource and consequence.
- Avoid generic “Are you sure?” wording.
- Keep cancel as a real exit.
- Prevent duplicate submission.
- On failure, keep the dialog open only when the user can act there.
- Do not place secret values in a confirmation summary.

## Notification and feedback UX

- Inline result state is authoritative for the user task.
- Toasts supplement inline feedback.
- Notification-domain status is labeled separately from UI toast success.
- Copy-to-clipboard feedback states what was copied without exposing restricted content.
- Import and notification partial success remains visible and is not reduced to a green success message.
- Background failures do not disappear when a toast times out.

## Accessibility validation direction

Later implementation review should include:

- semantic and accessible-name inspection;
- keyboard-only task completion;
- focus order, focus visibility, trap, and restoration;
- automated accessibility scanning;
- screen-reader-oriented review of navigation, tables, forms, dialogs, state announcements, and calendars;
- zoom, reflow, text spacing, and high-contrast review;
- reduced-motion review;
- Thai and mixed-language review;
- loading, empty, error, stale, offline, ambiguity, unauthorized, and unavailable states;
- desktop, tablet, and mobile viewports approved by `DEC-012`.

Automated results alone do not establish conformance.

## UX and accessibility acceptance direction

The frontend is acceptable only when:

1. every applicable `UX-*` and `A11Y-*` requirement is mapped to pages/components;
2. no critical workflow requires hover, color, or pointer precision alone;
3. focus is predictable through navigation, updates, dialogs, and errors;
4. Thai content and formatting remain intact;
5. dates/times/numbers are unambiguous;
6. responsive layouts retain primary tasks and state information;
7. accessibility limitations have an owner and explicit Product Owner disposition;
8. the approved conformance and test matrix passes.
