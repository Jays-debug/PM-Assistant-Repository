# FleetOS Coding Standard

Version 1.0

## Scope

This standard applies when source-code changes are separately analyzed and approved. It does not authorize source changes by itself.

Prefer clear, maintainable code that follows the existing module structure while improving behavior within an approved scope. Existing code is evidence of current implementation, not automatic approval for new cross-module coupling or insecure patterns.

## Repository and module boundaries

- `autopm/` remains the AutoPM module.
- `pm-assistant/` remains the PM Assistant module.
- `docs/` contains shared FleetOS documentation and architecture records.
- Do not rename module folders, Python modules, API paths, database tables, URLs, deployment projects, or screens without explicit approval.
- AutoPM must not import PM Assistant source, access PM Assistant tables, or write to PM Assistant persistence.
- PM Assistant must not depend on AutoPM frontend implementation for its core workflows.
- Shared behavior crosses a module boundary only through an approved contract or read model.
- Do not place new source code in repository-root convenience files when it belongs to a bounded module.

## General coding rules

- Make the smallest coherent change that satisfies the approved outcome.
- Use descriptive domain names and avoid a generic `status` where the domain has a specific status name.
- Keep business rules separate from transport, presentation, and persistence concerns.
- Avoid duplication of authoritative business rules across modules.
- Validate input at trust boundaries and return safe, actionable failures.
- Make time, timezone, encoding, and null behavior explicit.
- Preserve Unicode source values; never damage Thai text through implicit encoding conversion.
- Do not silently guess ambiguous identity, date, or data mappings.
- Keep functions and components focused; extract behavior when it improves testability or ownership clarity.
- Comment decisions and non-obvious constraints, not line-by-line mechanics.
- Remove dead code only when it is in the approved scope and verified unused.
- Add dependencies only when necessary, reviewed, version-constrained appropriately, and license/security implications are understood.

## Python rules

- Follow PEP 8 naming and formatting conventions unless repository tooling later establishes a stricter approved rule.
- Use type hints for new or materially changed public functions, service boundaries, and data structures.
- Prefer timezone-aware datetime handling; do not infer a timezone from naive external values.
- Use `pathlib` for new filesystem path handling where practical.
- Use context managers for files and resources.
- Catch only exceptions that can be handled meaningfully. Log safe context and preserve the original cause when raising a domain-specific failure.
- Do not use empty exception handlers for business-critical, persistence, security, or integration failures.
- Do not log secrets, credentials, raw authentication material, or sensitive payloads.
- Keep configuration outside source code and read it through an approved configuration boundary.
- Separate domain logic from framework routes and database models as code is refactored under approved tasks.
- New behavior requires tests at the appropriate level.

## FastAPI rules

- Organize new endpoints through routers and explicit request/response models when an approved refactor or API implementation permits it.
- Validate path, query, header, and body inputs with typed schemas.
- Use dedicated public response models; never expose ORM objects or persistence tables as a cross-module contract.
- Use dependency injection for database sessions, authorization, configuration, and service dependencies.
- Keep route handlers thin: validate, authorize, invoke a service, and translate the result to the approved response.
- Use HTTP methods according to their semantics and define idempotency for future write operations.
- Apply the approved API envelope, error model, version, and correlation-ID behavior at a public FleetOS boundary.
- Do not expose stack traces, SQL, filesystem paths, topology, credentials, or raw webhook data in responses.
- Restrict production CORS to approved origins. Existing permissive development CORS is not a production standard.
- Do not claim authentication or authorization exists merely because schema or error codes reserve future behavior.
- Liveness and readiness endpoints must reveal only approved coarse state.

## HTML rules

- Use semantic elements and a logical heading hierarchy.
- Provide labels for controls, alternative text for meaningful images, and keyboard-accessible interactions.
- Keep structure separate from styling and behavior where practical.
- Avoid inline event handlers and repeated inline style rules in new code.
- Escape or safely render untrusted content; do not construct unsafe HTML from external data.
- Preserve Thai and English content using UTF-8.
- Include source, freshness, and stale-state presentation when displaying transitional or cached maintenance data.

## CSS rules

- Reuse existing design tokens and component patterns before adding variants.
- Use clear, component-oriented class names and avoid selectors coupled to fragile DOM depth.
- Ensure responsive behavior and visible keyboard focus.
- Maintain readable contrast and do not encode status by color alone.
- Avoid `!important` unless a documented compatibility constraint requires it.
- Keep layout behavior predictable across supported viewport sizes.

## JavaScript rules

- Prefer `const`; use `let` only for reassignment and do not introduce `var` in new code.
- Use strict equality and explicit null or missing-value handling.
- Keep data access, normalization, business interpretation, cache handling, and UI rendering in distinct functions or components.
- Use `async`/`await` with deliberate timeout, error, retry, and stale-data behavior.
- Check HTTP status and validate response shape before use.
- Never place credentials or privileged API secrets in browser code or browser storage.
- Treat `localStorage` and cached payloads as untrusted, temporary presentation data.
- AutoPM cache must never become an authoritative synchronization source.
- Safely render unknown future enum values without collapsing distinct status domains.
- Clean up timers, listeners, and generated DOM when their lifecycle ends.

## Configuration and generated artifacts

- Runtime-specific values belong in approved environment variables or configuration, not hard-coded secrets.
- `.env.example` contains names and safe placeholders only.
- Local databases, logs, caches, exports, and generated files must remain ignored unless explicitly approved as repository artifacts.
- Generated output must be reproducible and must not obscure the source of truth.

## Compatibility and deprecation

- Preserve documented API and data behavior within an active version.
- Treat field meaning, type, nullability, identity semantics, enum semantics, status ownership, and default ordering changes as potentially breaking.
- Do not remove legacy behavior until consumers, fallback, migration, and rollback have been reviewed.
- Use an ADR when compatibility policy or module boundaries materially change.

