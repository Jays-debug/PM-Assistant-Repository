# FleetOS Testing and Quality Standard

Version 1.0

## Principle

Every change requires validation proportional to its risk. Passing tests support review but do not replace Product Owner approval, architecture compliance, security review, or human judgment.

The repository does not currently demonstrate an established automated test suite, formatter/linter configuration, or CI workflow. The levels below are required direction for future approved implementation, not a claim that automation already exists.

## Test levels

### Static and structural checks

Use applicable syntax, type, formatting, lint, Markdown, link, configuration, and schema checks. Tooling must be approved before it becomes a mandatory repository dependency.

### Unit tests

Unit-test deterministic domain rules, normalization, validation, status transitions, date handling, calculations, serialization, and error mapping. Tests must cover normal, boundary, invalid, missing, ambiguous, and conflicting inputs.

### Component and service tests

Test FastAPI routes, services, persistence adapters, schedulers, importers, notification adapters, and frontend components at their owned boundary. Isolate external services and verify safe failure behavior.

### Integration tests

Verify approved interactions among application services, persistence, files, schedulers, webhooks, and other dependencies. Use isolated non-production resources and safe test credentials supplied outside the repository.

### Contract tests

For cross-module APIs or read models, verify:

- versioned paths, methods, media types, and envelopes;
- fields, types, nullability, enums, and default ordering;
- identity ambiguity and freshness behavior;
- separation of all four status domains;
- error codes, HTTP status, redaction, and correlation IDs;
- pagination, filters, sorts, cache, timeout, and compatibility behavior;
- AutoPM's safe handling of unknown enum values and stale data.

### End-to-end and user validation

Exercise critical user workflows through the real UI and approved local or isolated environment. Include Thai text, keyboard access, responsive layouts, failure states, stale-source labels, imports, and recovery where applicable.

### Migration and reconciliation tests

Before an approved migration, test backup restoration, schema conversion, counts, constraints, identity crosswalks, status distributions, timestamps, Unicode, partial failures, application compatibility, and rollback or forward recovery.

### Security tests

Test input validation, authorization boundaries when implemented, CORS, sensitive-response redaction, log redaction, webhook verification, file upload handling, dependency risks, and misuse cases appropriate to the change.

### Operational tests

Test liveness, readiness, structured logging, correlation propagation, scheduler single-execution behavior, notification retry behavior, dependency failure, recovery, and alert visibility when those capabilities are implemented.

## Quality gates

A change is review-ready only when:

- scope matches Product Owner approval;
- required tests and checks pass;
- failures and warnings are understood and reported;
- new or changed behavior has coverage appropriate to its risk;
- architecture, ownership, identity, and status boundaries are preserved;
- documentation and ADRs are updated when required;
- secret and sensitive-data checks pass;
- user-visible changes have rendered or manual evidence;
- rollback is credible and tested when required;
- remaining risks and exceptions are explicit.

## Change-specific minimum validation

| Change | Minimum evidence |
| --- | --- |
| Documentation | Markdown structure, local relative links, terminology, operational-claim review, secret-pattern scan |
| Python/FastAPI | Syntax/import check, focused unit/service tests, endpoint/schema/error tests where affected |
| HTML/CSS/JavaScript | Syntax/tool checks if available, browser behavior, responsive and accessibility review, error/stale states |
| API contract | Provider and consumer contract tests, compatibility review, error and correlation behavior |
| Data model or migration | Migration rehearsal, backup/restore, reconciliation, application compatibility, rollback evidence |
| Security/configuration | Secret scan, safe-default review, redaction tests, isolated configuration validation |
| Scheduler/notification | duplicate-execution, retry/idempotency, failure, audit, and safe-target tests |

## Test data rules

- Use synthetic or approved sanitized data where practical.
- Never commit production credentials, access tokens, private keys, raw webhook payloads, notification targets, or unapproved personal data.
- Preserve relevant Thai Unicode and date-format cases in safe fixtures.
- Do not copy a production database into a test environment without explicit approval and an approved protection process.
- Make generated fixtures deterministic when possible.

## Failures and exceptions

- Do not hide, delete, or reclassify a failing test merely to pass a gate.
- Fix the cause, update an obsolete test with evidence, or request an explicit exception.
- Record checks not run, the reason, risk, and recommended follow-up.
- A tool being unavailable is a validation limitation, not a successful result.
- Flaky tests must be treated as defects and isolated only with an owner and follow-up plan.

## Validation report

Report:

- commands and manual checks performed;
- pass, fail, warning, or not-run result;
- environment or tool limitations;
- coverage of the approved outcome and regression risk;
- secret-safety and sensitive-data result;
- unresolved defects, risks, and approved exceptions.

Use [Review and release checklists](REVIEW_RELEASE_CHECKLISTS.md) for the final quality decision.

