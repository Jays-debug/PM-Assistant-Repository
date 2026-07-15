# FleetOS Security, Versioning, and Compatibility

## Purpose and operational-claim guardrail

This document defines target controls for the proposed read-only API. The repository does not prove that production authentication, authorization, TLS, restricted CORS, rate limiting, centralized monitoring, PostgreSQL, Railway, Docker, CI/CD, or production hosting is operational.

Every control below remains direction until separately implemented and validated.

## Trust boundary

PM Assistant is the provider and AutoPM is the read-only consumer. Production anonymous access is not approved. Direct shared-database access, browser access to privileged credentials, and AutoPM maintenance writes are prohibited.

The browser-direct versus trusted AutoPM server/proxy topology is unresolved by `DEC-009`. The selected topology must prevent long-lived privileged secrets from being embedded in HTML, JavaScript, static assets, URLs, browser storage, logs, screenshots, or documentation.

## Authentication direction

Before production exposure, the Product Owner must approve:

- caller identity and trust topology;
- service versus human authentication boundaries;
- credential issuance, storage, rotation, revocation, and incident procedures;
- challenge behavior and trusted proxy handling;
- TLS termination and internal transport requirements;
- development, test, staging, and production separation.

The target direction is service authentication appropriate to the approved topology. This Blueprint does not select credentials, token format, identity provider, signing algorithm, or vendor.

`ERR-006` and `ERR-007` reserve authentication failure behavior without exposing validation internals, user existence, expected secret structure, or credential contents.

## Authorization direction

Apply deny-by-default, least-privilege authorization per endpoint and projection.

- A candidate general scope is `fleetos.maintenance.read`; its exact name and semantics are not approved.
- PM history, synchronization, import, notification, and audit visibility may require narrower scopes.
- Field-level and row-level restrictions must be purpose-driven and contract-tested if selected.
- AutoPM read permission never grants create, update, delete, complete, import, schedule, notify, or administration permission.
- Resource-existence disclosure policy must be consistent: selected protected misses may return `404` rather than `403` after approval.
- Authorization-controlled field omission must be documented; it must not silently change a required field's meaning.

## Sensitive-data minimization

Default read models exclude:

- access tokens, secrets, passwords, API keys, signing material, cookies, and authorization headers;
- database DSNs, engine names in probes, hosts, schemas, filesystem paths, and deployment topology;
- raw webhook payloads and provider diagnostic payloads;
- notification target IDs, recipient identifiers, message bodies, and unrestricted provider responses;
- raw import rows, uploaded files, local filenames/paths, and unrestricted error text;
- unnecessary personal data and unrestricted actor names;
- raw legacy before/after JSON, stack traces, SQL, and exception details.

Any later field addition requires ownership, purpose, classification, authorization, redaction, retention, compatibility, and consumer review.

## Web and API security direction

- Use TLS at approved production boundaries.
- Restrict production CORS to approved origins, methods, and headers. Current permissive development CORS is not a policy.
- Validate path/query length, content type where relevant, header limits, page size, cursor size, date ranges, enum values, Unicode handling, and correlation IDs.
- Set explicit server and dependency timeouts; do not allow unbounded work.
- Use safe response headers appropriate to cache and content behavior.
- Prevent cache sharing across callers when authorization-sensitive content is possible.
- Never trust UI controls, browser cache, hidden fields, or client-calculated status as security controls.

## Rate-limiting direction

Rate limiting should be per authenticated client after an authentication design exists, with deliberate separate treatment for health probes and business reads.

- Exact identity key, sustained limit, burst, route weights, bypass policy, and environment differences are `DEC-016`.
- No numeric limit is approved by this Blueprint.
- Exceeded limits return `ERR-014` and `Retry-After`.
- Limit metadata is returned only when safe.
- AutoPM honors `Retry-After` and bounded jittered backoff.
- Rate limiting supplements capacity controls and authorization; it is not authentication or denial-of-service protection by itself.

## Caching and freshness direction

- Use private caching by default.
- Support `ETag` and `If-None-Match` where the projection can produce correct validators.
- Do not store authorization-sensitive responses in shared caches unless explicitly designed.
- Health responses use `Cache-Control: no-store`.
- Synchronization and operational visibility use `no-store` or a very short approved lifetime.
- Cache keys include endpoint, authorized projection, filters, sort, and applicable rule/contract version.
- A `304 Not Modified` preserves the freshness meaning of the validated representation and still participates in correlation/observability as defined by implementation.
- AutoPM may retain a bounded last-known-good representation for presentation only and must show its source, age, and stale/fallback state.
- Cache is never authoritative and is never reverse-synchronized.

Exact cache lifetimes, cursor lifetime, staleness thresholds, validator generation, and stale-if-error behavior are `DEC-010` and `DEC-011`.

## Idempotency direction

All v1 endpoints are safe `GET` reads. They do not require `Idempotency-Key`. Repeated requests may observe newer state and therefore need not return identical content.

Future writes, imports, notification commands, or event submissions require a separate contract covering business idempotency keys, replay windows, concurrency, duplicate outcomes, storage, authorization, and audit. Correlation IDs are never used as idempotency keys.

## Versioning

- Major version appears in the path: `/api/v1`.
- Media type is `application/json` unless a future endpoint separately specifies a safe export representation.
- Existing unversioned `/api/...` routes are not v1 aliases and receive no v1 compatibility guarantee.
- Provider implementation, ORM, table, database engine, runtime, and hosting versions are not exposed as API versions.
- Calculation, normalization, mapping, and projection versions are returned only where needed to interpret data.

## Compatibility rule registry

| ID | Rule |
| --- | --- |
| `COMP-001` | The major API version remains in the path; a breaking contract requires a new major version or an explicitly approved compatibility mechanism. |
| `COMP-002` | Adding a new endpoint is normally additive when it does not change existing endpoint behavior or authorization exposure. |
| `COMP-003` | Adding an optional field or optional metadata is normally additive; consumers must ignore unknown fields. |
| `COMP-004` | Removing or renaming a field, or changing its type, requiredness, nullability, or semantic meaning, is breaking. |
| `COMP-005` | Identity meaning is immutable within v1; a local resource ID cannot silently become an enterprise ID, and `vehicle_no` cannot become canonical by implication. |
| `COMP-006` | Changing default sort, tie-breaker, null placement, filter semantics, cursor binding, or pagination snapshot behavior is breaking unless an approved compatibility path exists. |
| `COMP-007` | The four status domains remain separate; moving a value between domains or changing established enum meaning is breaking. |
| `COMP-008` | Adding an enum value is additive only when consumers safely handle unknown values; reusing or removing an established value is breaking. |
| `COMP-009` | Error codes retain meaning for v1; new optional details are additive, but removing required envelope fields or reusing a code is breaking. |
| `COMP-010` | Fields may be added to a projection only after ownership, sensitivity, authorization, and retention review; additive syntax does not make unsafe exposure acceptable. |
| `COMP-011` | Existing unversioned routes, ORM entities, and tables are not compatibility baselines and may not be exposed as v1 merely by renaming a path. |
| `COMP-012` | A v1 version remains available while an approved AutoPM deployment depends on it unless tested fallback, migration, sunset, and rollback evidence are accepted. |

## Backward compatibility and consumer behavior

AutoPM must:

- ignore unknown response fields;
- use HTTP status and stable error `code`, never message text;
- render unknown enum values safely without mapping across status domains;
- tolerate documented nullable and optional fields;
- follow server-issued cursors without inspection;
- avoid depending on field order, error-detail order, JSON object order, or internal IDs' format;
- surface stale and unavailable states rather than substituting misleading zeroes;
- use an approved feature/configuration switch to select target versus last-known-good reads during rollout.

Provider contract tests and consumer tests are required by `VAL-009` and `VAL-010`.

## Deprecation and sunset

Deprecation requires all of the following:

1. A documented replacement and reason.
2. A compatibility and affected-consumer assessment.
3. Response deprecation metadata or headers selected by the approved contract.
4. An approved sunset date and migration window.
5. AutoPM migration guidance and tested fallback.
6. Provider/consumer overlap and operational monitoring.
7. Product Owner cutover and retirement approval.

A 90-day minimum window appears in existing proposed documentation but remains unapproved under `DEC-017`. V1 must not be retired while an approved AutoPM deployment depends on it without accepted fallback and rollback evidence.

## Observability requirements

When implemented, record safe structured signals for:

- request count, method, route template, result class, and duration;
- dependency timeouts and unavailability without exposing topology;
- correlation propagation across the API and approved read dependencies;
- authentication and authorization failures using safe classification;
- rate-limit decisions;
- cursor/filter/sort validation failures;
- identity ambiguity and conflict counts;
- read-model age, stale state, unavailable state, and calculation version;
- synchronization/import outcomes and reconciliation differences;
- provider/consumer contract version and shadow comparison results.

Logs use explicit-timezone timestamps, severity, service/module, event name, safe resource reference, correlation ID, result, duration, and safe error classification. They exclude request/response bodies by default and obey `DEC-013` retention.

Metrics, logs, traces, alerting provider, storage, access, retention, and operational ownership remain unselected. The requirements are not evidence of production observability.

## Security rollback

If unsafe exposure is detected:

1. Disable the affected consumer/endpoint exposure through an approved reversible control.
2. Preserve safe evidence and correlation references.
3. Notify the Product Owner through the approved channel.
4. Revoke or rotate affected credentials without recording values; do not roll them back to compromised values.
5. Keep PM Assistant authoritative and never restore from AutoPM cache.
6. Reconcile access, read-model, and audit impact before re-enablement.

Rollback must not blindly reopen a vulnerability or remove required audit evidence.
