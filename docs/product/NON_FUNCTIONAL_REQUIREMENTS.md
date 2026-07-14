# FleetOS v1.0 Non-Functional Requirements

## Purpose and interpretation

This document defines FleetOS v1.0 quality requirements. It establishes required outcomes and approval gates without selecting unapproved vendors, infrastructure, numerical service levels, or security mechanisms.

`MUST` indicates a release requirement. Values marked **Product Owner threshold required** must be approved and validated before production release.

## Security requirements

| ID | Requirement |
| --- | --- |
| NFR-SEC-001 | FleetOS MUST apply least privilege to human users, services, data, files, networks, and external integrations. |
| NFR-SEC-002 | Protected production boundaries MUST deny access by default and use an approved authentication and authorization design. |
| NFR-SEC-003 | AutoPM MUST remain read-only for maintenance workflow information, and direct shared-database access MUST remain prohibited. |
| NFR-SEC-004 | Privileged credentials MUST NOT be present in browser code, browser storage, source code, documentation, tests, fixtures, logs, screenshots, or exports. |
| NFR-SEC-005 | Required secrets MUST be supplied through an approved environment or secret-management boundary and validated without echoing their values. |
| NFR-SEC-006 | Development, test, staging, and production configuration MUST remain distinct; non-production MUST NOT silently target production data or recipients. |
| NFR-SEC-007 | Production transport MUST use an approved TLS boundary and trusted-proxy policy. |
| NFR-SEC-008 | Production CORS MUST be restricted to approved origins, methods, and headers. |
| NFR-SEC-009 | Input, query, cursor, date range, upload, filename, file type, file size, and body size MUST be validated at the trust boundary. |
| NFR-SEC-010 | Webhook signatures MUST be verified before processing when the approved provider mechanism supports signing. |
| NFR-SEC-011 | State-changing actions MUST use approved authorization, replay protection, concurrency behavior, and idempotency where applicable. |
| NFR-SEC-012 | Responses, logs, history, diagnostics, and audit MUST redact credentials, authorization data, cookies, tokens, connection strings, raw targets, raw webhook payloads, sensitive imports, and unnecessary personal data. |
| NFR-SEC-013 | Resource-existence disclosure and field-level exposure MUST follow an approved policy. |
| NFR-SEC-014 | Authentication, authorization, CORS, rate limiting, redaction, webhook, and misuse failure cases MUST pass before production release. |
| NFR-SEC-015 | Credential issuance, rotation, revocation, emergency access, and incident procedures MUST be approved and documented before production release. |

Current authentication and authorization are not proven operational. Reserved error codes or current UI controls do not satisfy these requirements.

## Reliability and availability requirements

| ID | Requirement |
| --- | --- |
| NFR-REL-001 | AutoPM and PM Assistant MUST remain independently deployable and reversible. |
| NFR-REL-002 | AutoPM failure MUST NOT corrupt PM Assistant data. |
| NFR-REL-003 | PM Assistant core maintenance workflows MUST remain independent of AutoPM availability. |
| NFR-REL-004 | AutoPM MUST present a clearly labeled last-known-good view during approved transient failure and MUST display its source and age. |
| NFR-REL-005 | A stale fallback MUST NOT be synchronized back to PM Assistant or represented as current authoritative data. |
| NFR-REL-006 | Imports, scheduled jobs, notifications, and future commands MUST prevent duplicate business outcomes under approved idempotency policies. |
| NFR-REL-007 | Dependency failure, timeout, restart, partial failure, retry, and recovery behavior MUST be explicit and tested. |
| NFR-REL-008 | Liveness MUST represent process execution; readiness MUST represent the availability of essential authoritative read dependencies. |
| NFR-REL-009 | Missing authoritative input MUST NOT be represented as a healthy zero result. |
| NFR-REL-010 | The selected datastore MUST provide approved durability, concurrency, backup, restore, recovery, and operational support. |
| NFR-REL-011 | Availability objective, recovery time objective, recovery point objective, and stabilization window require Product Owner thresholds and passing evidence. |

## Performance direction

| ID | Requirement |
| --- | --- |
| NFR-PERF-001 | API connection, overall request, dependency, scheduler, notification, and import timeouts MUST be explicit and bounded. |
| NFR-PERF-002 | Retry MUST be bounded, use approved backoff and jitter, and honor provider or API retry guidance. |
| NFR-PERF-003 | List endpoints MUST use bounded pagination and approved page-size limits. |
| NFR-PERF-004 | Cache policy MUST distinguish public, private, no-store, stale, and authorization-sensitive responses. |
| NFR-PERF-005 | Summary and list calculations MUST declare their population, filter inputs, calculation version, and freshness. |
| NFR-PERF-006 | Rate limits and burst behavior MUST be approved and tested for authenticated clients and operational probes. |
| NFR-PERF-007 | API latency, dashboard rendering, import volume, scheduler duration, notification throughput, error rate, and concurrent-user targets require Product Owner thresholds. |
| NFR-PERF-008 | Performance testing MUST use representative synthetic or approved sanitized data and MUST include degraded dependency behavior. |

The numerical timeouts, cache durations, rate limits, and deprecation windows in proposed architecture documents are starting directions, not approved product service levels.

## Data-quality requirements

| ID | Requirement |
| --- | --- |
| NFR-DQ-001 | Original source values MUST be preserved before normalization or parsing. |
| NFR-DQ-002 | Unicode, including Thai text and combining marks, MUST be preserved without destructive transliteration or implicit encoding conversion. |
| NFR-DQ-003 | Normalized comparison values MUST retain a rule version and MUST NOT replace original evidence. |
| NFR-DQ-004 | Ambiguous, conflicting, missing, rejected, duplicate, and stale records MUST be represented explicitly and MUST NOT be guessed. |
| NFR-DQ-005 | Identity and domain ownership MUST take precedence over last-write timestamps when resolving conflicts. |
| NFR-DQ-006 | Dates and times MUST distinguish raw and parsed values, include explicit timezone where required, and reject ambiguous Buddhist Era/Gregorian or day/month interpretation. |
| NFR-DQ-007 | Mileage MUST preserve measured and received times, source, validation result, correction chain, and reset/replacement evidence under approved rules. |
| NFR-DQ-008 | Controlled imports MUST retain batch and row outcomes and MUST NOT hide partial success. |
| NFR-DQ-009 | Reconciliation MUST compare identities, counts, status distributions, dates, freshness, and KPI populations against approved thresholds. |
| NFR-DQ-010 | Accepted raw evidence MUST remain intact when a mapping or calculation rule is rolled back. |

## Usability requirements

| ID | Requirement |
| --- | --- |
| NFR-USA-001 | Users MUST be able to identify the active module, current view, data source, and data freshness. |
| NFR-USA-002 | The product MUST use domain-specific status labels and MUST NOT present unrelated concepts as a generic status. |
| NFR-USA-003 | Validation feedback MUST identify the public field and safe corrective action without exposing internals. |
| NFR-USA-004 | Empty, loading, stale, fallback, ambiguous, conflicting, unauthorized, and unavailable states MUST be understandable and visually distinct. |
| NFR-USA-005 | High-risk actions such as completion correction, destructive plan action, import confirmation, schedule enablement, and notification send MUST use an approved confirmation and feedback pattern. |
| NFR-USA-006 | Critical maintenance workflows MUST be usable in Thai text and on supported responsive layouts. |
| NFR-USA-007 | Filters, sorts, pagination, exports, and copy actions MUST reflect the visible authorized dataset and retain understandable context. |
| NFR-USA-008 | PM Assistant priority presentation SHOULD make required daily work understandable without requiring AutoPM. |
| NFR-USA-009 | Product terminology MUST consistently use FleetOS, AutoPM, PM Assistant, and the four exact status field names. |

## Accessibility direction

| ID | Requirement |
| --- | --- |
| NFR-ACC-001 | User interfaces MUST use semantic structure and a logical heading hierarchy. |
| NFR-ACC-002 | Interactive controls MUST be operable by keyboard with visible focus. |
| NFR-ACC-003 | Controls MUST have programmatic or visible labels, and meaningful images MUST have text alternatives. |
| NFR-ACC-004 | Status, risk, success, failure, and freshness MUST NOT be communicated by color alone. |
| NFR-ACC-005 | Text, controls, focus indicators, and status presentation MUST meet an approved contrast standard. |
| NFR-ACC-006 | Responsive layouts MUST preserve task completion, reading order, and control access at approved viewport sizes. |
| NFR-ACC-007 | Error and validation messages MUST be discoverable and associated with the affected control where applicable. |
| NFR-ACC-008 | Accessibility acceptance MUST include keyboard, screen-reader-oriented semantics, zoom/reflow, Thai text, and failure-state review. |

The exact conformance standard, level, supported assistive technologies, browsers, and viewport matrix remain Product Owner decisions. This document does not claim current conformance.

## Validation and error behavior

| ID | Requirement |
| --- | --- |
| NFR-VAL-001 | Validation MUST occur at each untrusted boundary and MUST use consistent public field names. |
| NFR-VAL-002 | Multiple safe independent validation failures MAY be returned together; their order MUST NOT be treated as a compatibility guarantee. |
| NFR-VAL-003 | Invalid, missing, empty, ambiguous, conflicting, stale, unavailable, unauthenticated, unauthorized, rate-limited, and internal failures MUST remain distinguishable. |
| NFR-VAL-004 | Human-readable error messages MUST NOT be used for program logic. |
| NFR-VAL-005 | Error codes MUST retain their meaning within an active API major version. |
| NFR-VAL-006 | Unexpected failures MUST produce a safe generic error and a traceable correlation reference without leaking internals. |
| NFR-VAL-007 | Clients MUST NOT automatically retry validation, authentication, authorization, not-found, or identity-conflict failures. |

## Observability and audit requirements

| ID | Requirement |
| --- | --- |
| NFR-OBS-001 | Operational logs MUST be structured where supported and include explicit timestamp/timezone, severity, module/service, event, result, duration, safe resource reference, version, and validated correlation ID as applicable. |
| NFR-OBS-002 | Correlation IDs MUST be length/character validated and MUST contain no free text, secret, or personal data. |
| NFR-OBS-003 | FleetOS MUST provide visibility into API results and latency, read-model freshness, identity exceptions, imports, scheduler execution, notification attempts, persistence readiness, and security-relevant failures. |
| NFR-OBS-004 | Probes MUST expose only coarse state and MUST NOT disclose engine, host, schema, credentials, paths, or internal topology. |
| NFR-OBS-005 | Alert thresholds, recipients, ownership, escalation, retention, and incident procedures require Product Owner approval. |
| NFR-OBS-006 | Audit and logs MUST remain separate where their purpose, access, immutability, or retention differs. |

No production logging, monitoring, or alerting capability is claimed to be operational.

## Compatibility requirements

| ID | Requirement |
| --- | --- |
| NFR-COM-001 | Active API versions MUST preserve documented field meaning, type, nullability, identity semantics, status ownership, enum meaning, and default ordering. |
| NFR-COM-002 | Breaking changes MUST use an approved new major version or a tested compatibility plan. |
| NFR-COM-003 | Deprecation MUST include replacement guidance, an approved sunset, consumer migration evidence, and a tested fallback. |
| NFR-COM-004 | Provider-compatible behavior MUST be available before AutoPM target consumption is enabled. |
| NFR-COM-005 | The target AutoPM consumer MUST be reversible through approved configuration without changing PM Assistant authority. |
| NFR-COM-006 | Issued identities, raw source evidence, history, and audit MUST be preserved across compatible rollback. |

## Maintainability and support requirements

| ID | Requirement |
| --- | --- |
| NFR-MNT-001 | Business rules MUST remain in their authoritative module and MUST NOT be duplicated in presentation code. |
| NFR-MNT-002 | Public contracts MUST use dedicated models and MUST NOT expose ORM entities or table structure. |
| NFR-MNT-003 | Configuration MUST be explicit, environment-specific, safely validated, and documented without secret values. |
| NFR-MNT-004 | Changes MUST remain small, reviewable, testable, traceable, and reversible under FleetOS governance. |
| NFR-MNT-005 | Operational runbooks MUST identify owners, detection, response, stop/go, recovery, rollback, and post-recovery reconciliation. |
| NFR-MNT-006 | Significant changes to ownership, identity, integration, security, persistence, or deployment direction MUST use an approved ADR process. |

## Verification requirements

FleetOS v1.0 quality evidence MUST include, as applicable:

- static, syntax, format, Markdown, link, and schema checks;
- domain unit tests for identity, dates, statuses, mileage, and validation;
- component tests for routes, services, persistence, imports, scheduler, and notification adapters;
- provider and consumer contract tests;
- security, misuse, redaction, and secret-safety tests;
- integration, migration, backup, restore, reconciliation, and recovery tests;
- accessibility, responsive, Thai-text, stale, failure, and user-acceptance testing;
- performance and operational tests against Product Owner-approved thresholds;
- component rollback and full release-recovery rehearsal.

Checks not run, tooling limitations, warnings, exceptions, and residual risk MUST be reported. A missing tool is a validation limitation, not a passing result.

