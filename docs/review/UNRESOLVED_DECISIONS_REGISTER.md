# FleetOS Unresolved Decisions Register

## Purpose

This register consolidates the existing numbered unresolved decisions that affect FleetOS implementation readiness.

It does not:

- resolve a decision;
- create a new decision;
- change decision ownership;
- merge distinct decisions merely because their subjects overlap;
- promote a Proposed document;
- authorize implementation.

Every entry retains its owning documentation scope. Reused `DEC-*` identifiers are qualified as `domain:`, `api:`, `frontend:`, or `backend:`.

## Summary

| Scope | Decision prefix | Count | Status |
| --- | --- | ---: | --- |
| Domain | `domain:DEC-*` | 16 | Unresolved |
| API | `api:DEC-*` | 18 | Unresolved |
| Frontend | `frontend:DEC-*` | 20 | Unresolved |
| Backend | `backend:DEC-*` | 18 | Unresolved |
| Infrastructure | `IDEC-*` | 12 | Unresolved |
| Security | `SDEC-*` | 24 | Unresolved |
| Operations | `ODEC-*` | 12 | Unresolved |
| **Total** |  | **120** |  |

## Approved limited dispositions

### Phase 5.2 — Original Vehicle Number

The Product Owner approved `VO-020` Original Vehicle Number as an immutable, raw source-preserved `vehicle_no` value for the first PM Assistant domain implementation. Null, non-text, empty, and whitespace-only input is rejected; accepted text preserves leading/trailing whitespace, Unicode text and digits, punctuation, and separators exactly and uses exact Python string equality.

This limited approval does not implement or resolve normalization, matching, aliases, reconciliation, `fleetos_vehicle_id`, Vehicle lifecycle, or a Vehicle Aggregate Root. `domain:DEC-001` remains deferred. `domain:DEC-002` remains unresolved for every subject listed in its source, but those subjects do not block raw-value-only `VO-020`. `domain:DEC-004` is not applicable. API and backend Vehicle-identity decisions remain unresolved. The unresolved-decision counts above are therefore unchanged.

### Phase 5.3 — Minimal Vehicle Aggregate

The Product Owner approved a minimal PM Assistant-local implementation of `ENT-001` Vehicle. It has immutable positive-integer `local_vehicle_id` identity, contains exactly one `VO-020` Original Vehicle Number, and uses only `local_vehicle_id` for entity equality. `local_vehicle_id` is storage-agnostic domain terminology and has no enterprise, cross-system, canonical, or public API identity meaning. The current implementation may be backed by the existing `vehicle_master.id`, but that storage detail does not enter the domain model or behavior.

This limited aggregate performs no mutation, normalization, matching, alias handling, grouping, reconciliation, lifecycle, event, repository, persistence, API, application-service, or AutoPM behavior. `domain:DEC-001` remains unresolved for enterprise ownership, canonical identity, `fleetos_vehicle_id`, creation authority, merge, split, retirement, and lifecycle. `domain:DEC-002` and `domain:DEC-004` remain fully unresolved and outside the approved subset. API and backend Vehicle-identity decisions remain unresolved. The unresolved-decision counts above are unchanged.

## Consolidated decision themes

The following table groups related source decisions for review only. A theme does not replace or collapse its source decisions.

| Theme | Principal source decisions | Phase 5 effect |
| --- | --- | --- |
| Vehicle and canonical identity | `domain:DEC-001`, `api:DEC-001`, `backend:DEC-001` | Blocks canonical vehicle registry and identity lifecycle. |
| Transitional identity and aliases | `domain:DEC-002`, `api:DEC-002`, `backend:DEC-002` | Blocks final reconciliation and lookup acceptance. |
| Location and organizational identity | `domain:DEC-003`–`005`, `api:DEC-003`, `backend:DEC-003`, `SDEC-001`–`008` | Blocks stable joins, authorization, responsibility, and protected actions. |
| Workflow and completion | `domain:DEC-006`–`008`, `api:DEC-005`, `backend:DEC-005`, `006`, `013` | Blocks target lifecycle, completion, tombstone, and recurrence implementation. |
| Mileage and odometer | `domain:DEC-009`, `010`, `api:DEC-004`, `005`, `backend:DEC-004`, `007` | Blocks authoritative mileage ingestion and calculation. |
| Notifications | `domain:DEC-011`, `api:DEC-008`, `backend:DEC-009`, `SDEC-018` | Blocks production notification intent, retry, and recipient handling. |
| Scheduler | `domain:DEC-012`, `backend:DEC-010`, `IDEC-006` | Blocks safe hosted or multi-process execution. |
| Import and synchronization | `domain:DEC-013`, `api:DEC-007`, `backend:DEC-008` | Blocks replay-safe controlled ingestion. |
| Audit, privacy, retention | `domain:DEC-014`, `api:DEC-012`, `013`, `backend:DEC-012`, `SDEC-016`, `017`, `021`, `ODEC-006` | Blocks safe history, audit, logs, and data lifecycle. |
| Commands, concurrency, idempotency | `domain:DEC-015`, `backend:DEC-014`, `SDEC-014` | Blocks future write contracts and duplicate-sensitive commands. |
| KPI and reporting | `domain:DEC-016`, `api:DEC-006`, `frontend:DEC-008`, `backend:DEC-011` | Blocks authoritative dashboard comparisons and acceptance. |
| API operations and compatibility | `api:DEC-010`–`018` | Blocks production contract behavior, readiness, cutover, and retirement. |
| Frontend experience and rollout | `frontend:DEC-001`–`020` | Blocks final shell, navigation, UX, accessibility, performance, and cutover. |
| Runtime and persistence | `backend:DEC-016`, `IDEC-001`–`012`, `SDEC-019` | Blocks environment, datastore, delivery, backup, and recovery implementation. |
| Security architecture | `SDEC-001`–`024` | Blocks protected production exposure. |
| Operational model | `ODEC-001`–`012` | Blocks production operations, objectives, ownership, and response. |

## Domain decisions

Source: `docs/domain/DOMAIN_RULES_AND_INVARIANTS.md`

| Qualified ID | Existing unresolved subject | Affected implementation |
| --- | --- | --- |
| `domain:DEC-001` | Enterprise Vehicle Master owner and `fleetos_vehicle_id` type, generation, uniqueness, storage, API representation, merge, split, retirement, and creation authority; Phases 5.2 and 5.3 leave these subjects unresolved while Phase 5.3 permits only PM Assistant-local `local_vehicle_id` | Canonical vehicle identity; does not block raw-value-only `VO-020` or the limited minimal Vehicle Aggregate |
| `domain:DEC-002` | `vehicle_no` change/reuse, normalization corpus, digit/punctuation handling, registration uniqueness/reuse, and alias approval; all remain unresolved after Phases 5.2 and 5.3 | Transitional reconciliation; excluded from the limited minimal Vehicle Aggregate |
| `domain:DEC-003` | Location owner, stable identity, create/rename/merge/alias/retire/delete, and historical-name policy | Location lifecycle |
| `domain:DEC-004` | Fleet, business-unit, transport-type, PM-group semantics, ownership, hierarchy, mapping, identity, and effective dating | Grouping and KPI filters |
| `domain:DEC-005` | Identity provider, human/service identity, roles, permissions, responsibility, provisioning, review, revocation, and emergency access | Protected actions and actor meaning |
| `domain:DEC-006` | PM workflow vocabulary, schedule condition, transitions, reasons, authorization, cancellation, pause/follow-up, and weekly-control placement | Workflow lifecycle and API |
| `domain:DEC-007` | Completion vocabulary, evidence, effective/recorded time, backdating, correction, reopen, re-completion, linked effects, deletion/tombstone, and authorization | Completion lifecycle |
| `domain:DEC-008` | Recurring PM plan definition, identity, recurrence boundaries, versioning, and forecast/occurrence relationship | Recurring-plan model |
| `domain:DEC-009` | Odometer producer/owner, priority, units, timezone, measured/received times, freshness, duplicates, decreases, resets, replacement, correction, and acceptance | Mileage reading acceptance |
| `domain:DEC-010` | Mileage inputs, thresholds, boundaries, imported remaining distance versus recalculation, rule versioning, recalculation, and unknown/unavailable behavior | Mileage status |
| `domain:DEC-011` | Notification recipient authorization, intent identity, duplicate suppression, provider mapping, retries, expiry, redaction, diagnostics, and retention | Notification lifecycle |
| `domain:DEC-012` | Scheduler job identity, owner/topology, timezone, lock/lease, overlap, concurrency, misfire, retry, restart, recovery, and stop behavior | Background execution |
| `domain:DEC-013` | Import/sync identity, checksum, replay scope, atomicity, confirmation, partial outcome, resume, thresholds, cancellation, and retention | Controlled ingestion |
| `domain:DEC-014` | History/audit/log access, actor visibility, privacy, correction, deletion, retention, immutability, and legacy projection | Audit and privacy |
| `domain:DEC-015` | External plan/event/import IDs, write contract, optimistic concurrency, idempotency identity/scope/expiry, and replay response | Future commands |
| `domain:DEC-016` | KPI definitions, populations, filters, calculation versions, freshness, configuration ownership, and change audit | Reporting acceptance |

## API decisions

Source: `docs/api/API_VALIDATION_AND_ROLLOUT.md`

| Qualified ID | Existing unresolved subject | Affected implementation |
| --- | --- | --- |
| `api:DEC-001` | Enterprise Vehicle Master owner and `fleetos_vehicle_id` representation, generation, merge/split, and retirement | Vehicle resources |
| `api:DEC-002` | `vehicle_no` normalization version, match rules, ambiguity/conflict, aliases, and lookup exposure | Vehicle lookup and filters |
| `api:DEC-003` | Location, fleet, business-unit, and responsibility ownership, identity, aliases, renames, and safe attributes | Locations and grouping |
| `api:DEC-004` | Odometer owner, source priority, timing, reset/replacement, correction, monotonicity, and freshness | Mileage endpoints |
| `api:DEC-005` | Final status vocabularies, mileage rules, schedule condition, and completion evidence/reopen/backdating | Status serialization |
| `api:DEC-006` | KPI definitions, populations, exclusions, grouping, historical `as_of`, and calculation versions | Dashboard summary |
| `api:DEC-007` | Import/sync identity, checksum, idempotency, replay, atomicity, partial success, resume, confirmation, and source retention | Sync/import projections |
| `api:DEC-008` | Notification intent/attempt, recipient authorization, duplicate suppression, retry classes, channel grouping, and status derivation | Notification projections |
| `api:DEC-009` | Authentication/proxy topology, identities, scopes, credential lifecycle, TLS, CORS, probe exposure, and disclosure policy | Production exposure |
| `api:DEC-010` | Freshness/staleness by resource, stale reasons, timestamp precedence, and unavailable threshold | All business responses |
| `api:DEC-011` | Cache lifetime, `ETag`, cursor lifetime/snapshot, timeout, retry, and stale-if-error behavior | Performance and compatibility |
| `api:DEC-012` | Public/sensitive fields, actor visibility, descriptive fields, redaction, and field authorization | Projection safety |
| `api:DEC-013` | API/log/audit/import/history retention, access, privacy, correction/deletion, and operational review | Data lifecycle |
| `api:DEC-014` | Correlation-ID format, limits, trusted proxy behavior, invalid input, and propagation | Observability |
| `api:DEC-015` | Essential readiness dependencies, coarse names, ownership, alerts, and escalation | Readiness endpoint |
| `api:DEC-016` | Rate-limit identity, sustained/burst limits, route weights, probe policy, metadata, and environment differences | Load and abuse protection |
| `api:DEC-017` | Deprecation metadata, migration window, sunset authority, overlap, and legacy retirement | Version lifecycle |
| `api:DEC-018` | Tombstones, history after deletion, correction semantics, and quantitative reconciliation/cutover thresholds | Detail/history and cutover |

## Frontend decisions

Source: `docs/frontend/FRONTEND_VALIDATION_AND_ROLLOUT.md`

| Qualified ID | Existing unresolved subject | Affected implementation |
| --- | --- | --- |
| `frontend:DEC-001` | Final name and scope of the FleetOS platform navigation/shell surface | Platform scope |
| `frontend:DEC-002` | Cross-module handoff mechanism | Navigation, security, deployment |
| `frontend:DEC-003` | Default landing page, module availability, and direct entry | Routing and failure isolation |
| `frontend:DEC-004` | Routes, breadcrumbs, titles, and opaque resource URLs | Deep links |
| `frontend:DEC-005` | Filters, sorting, pagination, dates, and tabs in URL versus local state | Shareability and privacy |
| `frontend:DEC-006` | Page grouping, labels, defaults, and current-screen retention/rename | Information architecture |
| `frontend:DEC-007` | Approved fields and expansion behavior for all frontend resource views | Data exposure |
| `frontend:DEC-008` | KPI definitions, populations, exclusions, grouping, historical behavior, and versions | Dashboard correctness |
| `frontend:DEC-009` | Cache mechanism, size, privacy, authorization isolation, invalidation, and retention | Browser state safety |
| `frontend:DEC-010` | Freshness thresholds, fallback age, retry, timeout, and stale-if-error | Failure and stale UX |
| `frontend:DEC-011` | Branding, tokens, typography, fonts, icons, density, and motion | Design system |
| `frontend:DEC-012` | Accessibility standard, browser/assistive technology/viewport matrix, touch, contrast, and exceptions | Accessibility acceptance |
| `frontend:DEC-013` | Thai locale, calendar era, timezone labels, relative time, numbers, precision, and units | Formatting |
| `frontend:DEC-014` | Authentication/proxy topology, identities, session, CORS, scopes, and browser credentials | Protected frontend |
| `frontend:DEC-015` | Mobile scope and priority by feature area | Responsive scope |
| `frontend:DEC-016` | Page, interaction, API, render, asset, memory, and large-data budgets | Performance acceptance |
| `frontend:DEC-017` | Telemetry/analytics provider, classification, sampling, retention, notice, and ownership | Frontend observability/privacy |
| `frontend:DEC-018` | Feature-switch mechanism, owner, cohorts, audit, and emergency disable | Rollout and rollback |
| `frontend:DEC-019` | Shadow thresholds, review owner, accepted differences, and stabilization | Cutover evidence |
| `frontend:DEC-020` | Access, redaction, retention, and correction for sensitive operational views | Protected pages |

## Backend decisions

Source: `docs/backend/BACKEND_VALIDATION_AND_ROLLOUT.md`

| Qualified ID | Existing unresolved subject | Affected implementation |
| --- | --- | --- |
| `backend:DEC-001` | Enterprise Vehicle Master and `fleetos_vehicle_id` lifecycle | Canonical identity |
| `backend:DEC-002` | `vehicle_no` normalization, ambiguity, aliases, digit handling, and reuse/change | Lookup/reconciliation |
| `backend:DEC-003` | Location, organization, person/team/responsibility identity and history | Commands, projections, filters |
| `backend:DEC-004` | Odometer producer, priority, units, timing, reset, correction, duplicates, monotonicity, timezone, and freshness | Mileage use cases |
| `backend:DEC-005` | Workflow vocabulary, transition graph, schedule condition, task control, cancellation, and authority | Plan use cases |
| `backend:DEC-006` | Completion vocabulary, evidence, time, backdating, correction, reopen, linked effects, and authorization | Completion use cases |
| `backend:DEC-007` | Mileage inputs, thresholds, boundaries, unknown/stale states, rule versioning, and recalculation | Mileage assessment |
| `backend:DEC-008` | Import/replay identity, checksum, atomicity, partial success, confirmation, resume, source retention, row identity, and thresholds | Import use cases |
| `backend:DEC-009` | Notification recipients, intent identity, idempotency, templates, provider classes, timeout, retry, redaction, and retention | Notification use cases |
| `backend:DEC-010` | Scheduler topology, job/occurrence identity, timezone, overlap, misfire, lock/lease, retry, recovery, and shutdown | Scheduler runtime |
| `backend:DEC-011` | KPI/report definitions, populations, filters, grouping, historical behavior, versions, and exports | Reporting |
| `backend:DEC-012` | Audit/history/import/notification/log/error/diagnostic access, privacy, correction, deletion, and retention | Evidence and storage |
| `backend:DEC-013` | Plan/location deletion, cancellation versus tombstone, references, history continuity, archive, and privacy | Resource lifecycle |
| `backend:DEC-014` | Command concurrency, expected version, isolation, idempotency, uncertain outcomes, and safe retry | Transactions |
| `backend:DEC-015` | Authentication/proxy topology, identities, roles/scopes, authorization, CORS, TLS, correlation, disclosure, and write/UI errors | Protected boundaries |
| `backend:DEC-016` | Hosting/process topology, datastore/migration, composition, readiness, shutdown, backup, restore, and recovery objectives | Runtime |
| `backend:DEC-017` | Availability, latency, throughput, load, file limits, timeout, alerts, freshness, recovery, stabilization, and retention targets | Performance/operations |
| `backend:DEC-018` | Shadow thresholds, exception ownership, cohorts, fallback age, stabilization, stop/go, and acceptance | Rollout |

## Infrastructure decisions

Source: `docs/infrastructure/INFRASTRUCTURE_BLUEPRINT.md`

| ID | Existing unresolved subject | Affected implementation |
| --- | --- | --- |
| `IDEC-001` | Hosting provider, accounts, locations, and logical topology | Environment and deployment |
| `IDEC-002` | Public ingress, DNS, TLS termination, proxy, and trust topology | Network exposure |
| `IDEC-003` | Authentication mechanism, authorization scopes, and service identities | Protected access |
| `IDEC-004` | Production datastore, topology, migration mechanism, and owner | Persistence |
| `IDEC-005` | Secret storage, issuance, rotation, revocation, and emergency access | Runtime security |
| `IDEC-006` | Scheduler execution owner, locking, occurrence identity, and retry | Job safety |
| `IDEC-007` | CI/CD product, artifacts, branch integration, approvals, and promotion | Delivery automation |
| `IDEC-008` | Logging, metrics, tracing, alerting, incident, and retention platforms | Observability |
| `IDEC-009` | Availability, capacity, performance thresholds, and stabilization | Scaling/release |
| `IDEC-010` | Backup frequency, retention, immutability, encryption, owner, RPO, and RTO | Recovery |
| `IDEC-011` | Classification, privacy, deletion, archival, and legal hold | Data lifecycle |
| `IDEC-012` | Deployment strategy, compatibility window, rollback trigger, and forward recovery | Release/recovery |

## Security decisions

Source: `docs/security/SECURITY_VALIDATION_AND_ROLLOUT.md`

| ID | Existing unresolved subject | Affected implementation |
| --- | --- | --- |
| `SDEC-001` | Human identity authority, source, uniqueness, and enterprise mapping | Human access |
| `SDEC-002` | Provisioning, approval, suspension, termination, reactivation, propagation, and retention | Identity lifecycle |
| `SDEC-003` | Human authentication, credentials, recovery, MFA/password direction, and failures | Authentication |
| `SDEC-004` | Session topology, storage, binding, renewal, lifetime, logout, revocation, concurrency, and reauthentication | Sessions |
| `SDEC-005` | Authorization model, default deny, unavailable-policy behavior, and administration | Authorization |
| `SDEC-006` | Roles, permissions, resource/field rules, separation of duties, emergency access, and disclosure | Least privilege |
| `SDEC-007` | Browser-direct versus proxy topology, trust termination, and caller identity | AutoPM API access |
| `SDEC-008` | Service identities for applications, jobs, providers, imports, delivery, monitoring, backup, and recovery | Non-human access |
| `SDEC-009` | Browser storage, cache lifetime, authorization invalidation, offline, stale, and fallback limits | Frontend data safety |
| `SDEC-010` | Secret/configuration storage, delivery, settings UX, precedence, reload, rotation, revocation, and break glass | Secret lifecycle |
| `SDEC-011` | Production origins, CORS, CSRF, trusted proxy, and state-changing browser protection | Web exposure |
| `SDEC-012` | CSP directives, reporting, inline compatibility, frames, and external resources | XSS defense |
| `SDEC-013` | Rate-limit identity, sustained/burst behavior, weights, bypass, metadata, abuse, and environments | Abuse protection |
| `SDEC-014` | Idempotency/replay identities, storage, windows, conflicts, and recovery | Duplicate prevention |
| `SDEC-015` | Encryption in transit/at rest, key management, certificates, TLS, internal transport, and trust | Encryption/network |
| `SDEC-016` | Retention and archival for operational data, logs, audit, security, imports, notifications, webhooks, diagnostics, exports, cache, and backups | Data lifecycle |
| `SDEC-017` | Privacy purpose, personal/responsibility data, correction, deletion, anonymization, legal hold, copies, and requests | Privacy |
| `SDEC-018` | LINE/provider credentials, webhook verification, recipients, minimization, retry, idempotency, diagnostics, and retention | Provider security |
| `SDEC-019` | Environment, hosting, runtime, network, operator, diagnostics, logging, backup, restore, and recovery topology | Infrastructure security |
| `SDEC-020` | Dependency constraints, reproducibility, scanning, remediation, SBOM, integrity, signing/attestation, and exceptions | Supply chain |
| `SDEC-021` | Audit/security-event schemas, access, immutability/correction, retention, access review, reviewers, exceptions, and evidence | Audit/access review |
| `SDEC-022` | Monitoring signals, storage, redaction, thresholds, routing, ownership, acknowledgement, escalation, and tuning | Detection |
| `SDEC-023` | Incident classes, severity, authority, communications, evidence, notification, targets, disclosure, and review | Incident response |
| `SDEC-024` | Security rollout cohorts, thresholds, stop/go, stabilization, rollback deadlines, retirement, evidence, and exceptions | Security release |

## Operations decisions

Source: `docs/operations/OPERATIONS_AND_OBSERVABILITY_BLUEPRINT.md`

| ID | Existing unresolved subject | Affected implementation |
| --- | --- | --- |
| `ODEC-001` | Operational tooling, telemetry transport/storage, access, tenancy, and environment separation | Monitoring platform |
| `ODEC-002` | Named owners, delegates, support model, coverage, handoff, emergency access, and escalation | Operational accountability |
| `ODEC-003` | Service catalog, criticality, essential dependencies, degradation, and probe exposure | Health/readiness |
| `ODEC-004` | Metric definitions, populations, units, labels, cardinality, and measurement sources | Metrics |
| `ODEC-005` | Service objectives, alerts, severities, suppression, acknowledgement, recovery, and stabilization | SLO/alerting |
| `ODEC-006` | Log, metric, trace, audit, security-event, incident, and evidence retention/deletion | Data lifecycle |
| `ODEC-007` | Correlation, causation, tracing, sampling, and cross-boundary trust | Diagnostics |
| `ODEC-008` | Incident classifications, authority, communications, notification, review, and exceptions | Incident operations |
| `ODEC-009` | Maintenance windows, freezes, notice, approval, user impact, and emergency changes | Change operations |
| `ODEC-010` | Backup scope, mechanism, frequency, retention, immutability, encryption, owner, RPO, and RTO | Continuity/recovery |
| `ODEC-011` | Rollout cohorts, evidence, stop/go, fallback, stabilization, rollback, and legacy retirement | Operational rollout |
| `ODEC-012` | Runbook storage, access, review, rehearsal, update, and retirement | Runbook governance |

## Unnumbered decision sources

The following documents also contain unresolved gates that overlap with the numbered register:

- `docs/IDENTITY_CONTRACT.md`;
- `docs/DATA_OWNERSHIP.md`;
- `docs/API_CONTRACT.md`;
- `docs/API_ERROR_MODEL.md`;
- `docs/product/FLEETOS_PRODUCT_SPECIFICATION.md`;
- `docs/product/USER_ROLES_AND_PERSONAS.md`;
- `docs/product/V1_SCOPE_AND_RELEASE_CRITERIA.md`;
- `docs/database/README.md` and table-level unresolved decisions;
- `docs/application/FLEETOS_APPLICATION_BLUEPRINT.md`;
- `docs/application/BACKGROUND_JOBS.md`;
- `docs/blueprint/FLEETOS_V1_BLUEPRINT.md`;
- `docs/blueprint/SYSTEM_CONTEXT_AND_MODULE_MAP.md`;
- `docs/blueprint/DATA_AND_INTEGRATION_FLOW.md`;
- `docs/blueprint/DEPLOYMENT_AND_RUNTIME_BLUEPRINT.md`;
- `docs/blueprint/IMPLEMENTATION_ROADMAP.md`.

They are not counted as additional numbered decisions because their subjects substantially overlap with the 120 source decisions above. They remain governing evidence and must be consulted for the selected implementation scope.

## Decision-entry rule for Phase 5

Before an implementation workstream begins:

1. identify its exact affected source decisions;
2. qualify reused IDs by scope;
3. record each decision as approved, explicitly deferred, or blocking;
4. preserve the original source and owner;
5. stop if a required decision has no approved disposition;
6. do not implement a default that silently settles unresolved business, identity, security, infrastructure, or operational policy.

The Product Owner remains the decision owner unless an existing source explicitly assigns another authority.
