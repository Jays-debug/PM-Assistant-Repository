# FleetOS v1.0 Scope and Release Criteria

## Purpose

This document defines the FleetOS v1.0 release boundary, required evidence, known limitations, unresolved decisions, and the meaning of product-complete and release-ready.

It does not authorize implementation, deployment, migration, credential changes, external-service changes, or production release.

## Scope model

### Current capabilities

Current repository evidence includes:

- AutoPM dashboard, KPI, summary, tracking, calendar, filter, export, copy, Apps Script/CSV ingestion, browser cache, local CSV fallback, and browser-derived mileage status;
- PM Assistant planning, My Today, completion, pause/resume, follow-up, weekly control, history, vehicle/location behavior, import/export, LINE integration, reports, scheduler settings, notification/import logs, SQLite persistence, and unversioned FastAPI routes;
- repository governance, architecture, ownership, identity, API, error, engineering, Blueprint, and ADR documentation at their stated approval statuses.

Current capability does not by itself establish a v1 requirement, public contract, production control, or operational readiness.

### Transitional capabilities

The following may remain during controlled transition:

- legacy AutoPM Google Sheets, Apps Script, and CSV reads;
- labeled browser last-known-good cache and `data.csv` fallback;
- Google Sheets, CSV/XLSX, and `Data Car.csv` as controlled upstream evidence;
- `vehicle_no` matching with approved normalization and exception quarantine;
- current PM Assistant routes for existing workflows while dedicated v1 projections are built;
- shadow `/api/v1` read models and legacy/target comparison;
- an approved reversible AutoPM read-route configuration;
- isolated security, runtime, persistence, scheduler, notification, and migration validation.

Transitional behavior may be retired only after acceptance, stabilization, and rollback evidence pass and the Product Owner approves retirement.

### FleetOS v1.0 release scope

The v1 release boundary includes:

- separate AutoPM and PM Assistant bounded modules and rollback units;
- PM Assistant authority for maintenance workflow information;
- AutoPM read-only consumption of approved maintenance projections;
- an approved versioned read-only integration boundary;
- explicit source, freshness, stale, ambiguity, conflict, unknown, and unavailable behavior;
- separate `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` domains;
- controlled PM planning, vehicle lookup, location, mileage, completion, history, notification, scheduler, import, synchronization, dashboard/reporting, and audit workflows;
- approved authentication, authorization, CORS, TLS, redaction, rate limit, and sensitive-field controls;
- approved datastore, migration, backup, restore, recovery, and reconciliation behavior;
- safe scheduler single-execution and notification duplicate/retry behavior;
- contract, security, data-quality, accessibility, reliability, performance, operational, recovery, and user-acceptance evidence;
- staged cutover, last-known-good fallback, stabilization, and component rollback.

### Future capabilities outside v1.0

- operational `fleetos_vehicle_id` and an enterprise vehicle registry;
- stable FleetOS identities for locations, fleets, business units, people, teams, and responsibilities;
- general AutoPM write commands or a cross-module write API;
- domain-event or webhook distribution beyond approved transitional ingestion;
- telematics, predictive maintenance, or enterprise odometer integration;
- ERP or enterprise integration-platform connection;
- additional notification providers;
- mobile applications;
- multi-tenant operation;
- distributed workflow orchestration;
- multi-region, sharded, or enterprise analytics persistence;
- mandatory CI/CD adoption unless separately approved;
- consolidation of AutoPM and PM Assistant;
- automatic retirement of all legacy feeds or current routes.

## Explicit v1 exclusions

FleetOS v1.0 MUST NOT include:

- direct AutoPM writes to PM Assistant persistence;
- shared-database reads or writes between modules;
- browser cache as authoritative or synchronization input;
- completion inferred from mileage, sheet labels, elapsed time, workflow state, dashboard state, or notification result;
- `vehicle_no` represented as a permanent enterprise key;
- `fleetos_vehicle_id` represented as implemented without a separately approved identity program;
- automatic identity merge by row order, registration, vehicle code, or timestamp;
- current unversioned routes promoted wholesale into the v1 contract;
- credentials in source, static assets, browser storage, documentation, logs, fixtures, or audit;
- unapproved renaming of modules, folders, API paths, database tables, URLs, projects, or screens;
- unapproved production deployment, migration, external-service, or credential action.

## Product limitations at specification baseline

- The proposed ADR and API direction is not yet marked accepted in its source documents.
- Production authentication and authorization are not proven operational.
- A production `/api/v1` boundary is not proven operational.
- The selected production datastore and migration mechanism are unresolved.
- Current in-process scheduling is not proven safe for multiple processes or replicas.
- Odometer ownership, mileage rules, and accepted-reading behavior are unresolved.
- Vehicle, location, grouping, person, team, and responsibility identities remain unresolved.
- Exact workflow, completion, notification, and mileage vocabularies require approval.
- KPI definitions and counted populations require approval.
- Numerical availability, performance, recovery, and stabilization targets require approval.
- Audit, privacy, diagnostic, notification, and operational retention require approval.
- Repository evidence does not demonstrate an established automated test suite or CI workflow.

## Product Owner decision gates

| Gate | Required decision | Blocks |
| --- | --- | --- |
| Product and architecture | Accept or revise module, ownership, status, API, error, and compatibility direction. | All v1 implementation and release |
| Vehicle identity | Enterprise owner, normalization, reuse, ambiguity, and future ID governance. | Vehicle integration and reconciliation acceptance |
| Location and organization | Owners, stable identity direction, aliases, hierarchy, and history. | Location/grouping integration |
| User and permissions | Identity provider, role vocabulary, permission matrix, provisioning, revocation, and audit. | Protected production access |
| Mileage | Producer, priority, resets, corrections, duplicates, time, freshness, thresholds, and calculation rule. | Authoritative mileage status |
| Workflow and completion | Vocabulary, schedule condition, transitions, evidence, backdating, reopen, correction, and deletion. | Workflow/completion acceptance |
| KPI and reporting | Metric definitions, counted population, filters, calculation versions, and freshness. | Dashboard summary acceptance |
| Security | Trust topology, authentication, scopes, CORS, TLS, rate limits, disclosure, and redaction. | Production exposure |
| Runtime and persistence | Hosting/process topology, datastore, migration, backup, recovery, and support. | Production readiness |
| Scheduler | Execution owner, locking, identity, overlap, misfire, retry, timezone, and recovery. | Scheduled operation |
| Notification | Recipients, authorization, idempotency, retry, redaction, diagnostics, and retention. | Production notification |
| Import/sync | Atomicity, checksum, replay identity, resume, retention, and exception thresholds. | Controlled ingestion acceptance |
| Audit and privacy | Actor exposure, access, correction, deletion, and retention. | Production audit acceptance |
| Service levels | Availability, latency, load, recovery, alert, and stabilization thresholds. | Release acceptance |

## Release criteria

### RC-01 — Product and decision baseline

- Product Owner has accepted the v1 product scope and exclusions.
- Applicable ADRs and contracts have accepted or superseding decisions.
- No contradiction remains among product, architecture, ownership, identity, API, and error sources.
- Every unresolved item is either resolved or explicitly approved as non-blocking with owner and follow-up.

### RC-02 — Module and ownership boundaries

- AutoPM and PM Assistant remain separate deployment and rollback units.
- PM Assistant authority is enforced for maintenance workflow data.
- AutoPM maintenance behavior is read-only.
- No direct shared-database access or duplicated authoritative business rule exists.
- PM Assistant core workflows pass while AutoPM is unavailable.

### RC-03 — Identity and data readiness

- Approved normalization and Thai/Unicode/date test corpus passes.
- Exact, normalized, ambiguous, conflicting, missing, and rejected classifications pass.
- No guessed or destructive identity match exists.
- Crosswalk, provenance, alias, mapping version, exception owner, and reconciliation thresholds are approved.
- Counts, statuses, dates, freshness, and KPI populations reconcile within approved thresholds.

### RC-04 — Functional workflow acceptance

- Every applicable workflow and acceptance criterion in [User Workflows and Acceptance](USER_WORKFLOWS_AND_ACCEPTANCE.md) passes.
- All four status domains are separately persisted or projected, serialized, displayed, and tested.
- Plan, completion, history, import, scheduler, notification, and audit failures are visible and safe.
- Unknown, empty, stale, fallback, ambiguous, conflicting, missing, and unavailable behavior tests pass.

### RC-05 — API and consumer acceptance

- Approved provider and consumer contract tests pass.
- Authentication, authorization, field projection, redaction, correlation, pagination, filtering, sorting, caching, timeout, retry, and compatibility behavior passes.
- Existing unversioned routes remain outside the v1 guarantee unless separately approved.
- AutoPM target reads are behind an approved reversible configuration.
- Legacy and target shadow differences meet approved thresholds.

### RC-06 — Security and privacy

- Threat, trust, authentication, authorization, CORS, TLS, webhook, upload, rate-limit, and misuse reviews pass.
- Secret-pattern and sensitive-data checks pass.
- No privileged credential is present in browser assets or storage.
- Logs, errors, history, diagnostics, imports, notifications, and audit pass redaction tests.
- Identity lifecycle, access review, incident, credential rotation/revocation, privacy, and retention procedures are approved.

### RC-07 — Reliability, performance, and operations

- Product Owner-approved availability, latency, load, timeout, recovery, and stabilization thresholds pass.
- Liveness, readiness, structured logs, correlation, metrics, alerts, freshness, scheduler, notification, import, and security visibility are demonstrated.
- Scheduler overlap, restart, misfire, duplicate, timezone, failure, retry, and recovery tests pass.
- Notification intent, delivery, retry, duplicate, provider failure, and safe-audit tests pass.
- Operational ownership, support, incident, stop/go, and escalation procedures are active.

### RC-08 — Persistence, migration, and recovery

- Selected datastore and migration mechanism are approved.
- Backup, restore, migration, failure injection, reconciliation, and application compatibility tests pass using isolated approved data.
- Recovery objectives, freeze conditions, rollback or forward-recovery choice, and ownership are approved.
- Post-recovery identity, plan, status, history, import, scheduler, notification, and audit reconciliation passes.

### RC-09 — Usability and accessibility

- Critical workflows pass user acceptance with representative authorized users.
- Thai text, keyboard access, focus, labels, contrast, non-color status cues, zoom/reflow, responsive layouts, errors, stale state, and unavailable state are reviewed against the approved accessibility target.
- Product terminology and status-domain language are consistent.
- Known usability or accessibility limitations are accepted only through explicit Product Owner exception.

### RC-10 — Rollout and rollback

- Provider-compatible behavior is available before consumer enablement.
- The target read path is enabled through controlled promotion.
- Stop/go thresholds and rollback owners are known.
- AutoPM fallback, provider compatibility, scheduler stop, notification stop, persistence recovery, and configuration rollback are rehearsed.
- Rollback preserves PM Assistant authority, history, audit, accepted identifiers, and raw evidence.
- AutoPM cache is never reverse-synchronized.

### RC-11 — Release approval

- Exact release scope and included change sets are known.
- All required evidence and approved exceptions are available without secrets.
- Known limitations and remaining non-blocking work are documented.
- No production-blocking incident or reconciliation gap remains.
- The Product Owner separately approves release.
- Deployment, migration, credentials, and external-service actions receive separate explicit approval.

## Stop-release conditions

Release MUST stop for:

- unresolved maintenance ownership or status semantics;
- identity ambiguity above the approved threshold or any guessed match;
- inaccurate completion, history, or notification outcome;
- unauthorized write path or direct database coupling;
- unsafe authentication, authorization, CORS, TLS, webhook, or sensitive-data exposure;
- credentials in source, browser assets, logs, documentation, tests, or audit;
- duplicate scheduled, imported, or notification business outcomes outside approved policy;
- inability to distinguish unavailable authoritative data from valid zero/empty data;
- failed backup restore, migration reconciliation, rollback, or recovery evidence;
- unacceptable error, latency, availability, data-quality, accessibility, or user-acceptance result;
- lack of an accountable operational owner or credible rollback;
- unsupported claim that proposed infrastructure is operational.

## Rollback boundaries

### AutoPM

- Disable the target read route through approved configuration.
- Restore the labeled last-known-good read path.
- Preserve source and staleness display.
- Do not write fallback or cache values to PM Assistant.

### PM Assistant and API

- Preserve compatible provider behavior during consumer rollback.
- Disable unsafe exposure without deleting authoritative records.
- Preserve accepted workflow changes, identifiers, history, and audit.

### Scheduler and notifications

- Stop unsafe execution without deleting intent or outcome evidence.
- Prevent duplicate retry during topology or version changes.
- Never report an undelivered notification as successful.

### Imports and mappings

- Stop unsafe mutation, retain preview and batch evidence, and revert to a prior mapping/rule version.
- Preserve raw source and accepted evidence.
- Do not hide partial outcomes.

### Persistence

- Follow the approved backup/restore or forward-recovery procedure.
- Freeze unsafe writes when required and reconcile after recovery.
- Do not treat engine rollback as an ownership transfer.
- Do not restore revoked credentials.

## Definition of FleetOS v1.0 product complete

FleetOS v1.0 is product-complete when:

1. All required functional and non-functional requirements are accepted.
2. All applicable workflows and acceptance criteria pass.
3. All release criteria RC-01 through RC-11 pass.
4. No unresolved decision affecting safe production operation remains open.
5. Known limitations are documented and accepted.
6. Independent module operation and rollback are demonstrated.
7. The Product Owner records product acceptance and separately approves release.

## Definition of FleetOS v1.0 release complete

A release is complete only after the product-complete criteria pass, authorized rollout finishes, stabilization exit thresholds remain satisfied, support and recovery ownership are active, and the Product Owner records release acceptance.

Product documentation, implementation completion, deployment, and release are separate states. Completion of this specification establishes the product baseline only.

