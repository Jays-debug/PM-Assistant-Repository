# FleetOS Database Migration Strategy

## Purpose and status

This document defines the gated strategy for moving from current SQLite implementation evidence toward an approved FleetOS v1.0 target database. It contains no executable migration, selects no engine or migration framework, and authorizes no data change, deployment, or cutover.

Database migration does not transfer maintenance authority. PM Assistant remains authoritative throughout, and AutoPM never becomes a migration writer or database consumer.

## Current SQLite implementation evidence

PM Assistant currently uses SQLAlchemy, a local SQLite file, startup-time table creation, and limited startup copying from selected legacy tables. Current models use local integer keys, textual and denormalized relationships, generic status values, and fields that may contain raw import, notification, webhook, or configuration content.

This evidence must be inventoried directly before any migration. Documentation does not prove the condition, size, completeness, consistency, encoding, sensitivity, or recoverability of a real database.

## Transitional migration direction

The transition is evidence-first and reversible. It must preserve current application compatibility until an approved cutover, retain raw/source evidence, quarantine uncertainty, and avoid enforcing target constraints before current data is proven compatible.

No target engine, tool, identifier type, ORM design, hosting platform, Railway service, Docker image, or production topology is selected in Phase 4.1.

## Migration governance

Separate Product Owner approvals are required for:

1. selected engine, physical schema, migration framework, and responsible owner;
2. access to each source environment and approved sanitized or isolated data;
3. backup and restore procedures and recovery thresholds;
4. transformation, normalization, mapping, and identity rules;
5. application compatibility changes;
6. each non-production rehearsal;
7. production migration, cutover window, stop/go thresholds, and communications;
8. rollback versus forward-recovery decision if a failure occurs;
9. deployment, credentials, external services, and post-cutover retirement actions.

Required architecture decisions must use the FleetOS ADR process before implementation.

## Migration phases

### Phase A — Source inventory

Create a read-only inventory of every approved source:

- SQLite database files and schema versions, if any;
- current and legacy tables, columns, declared indexes, uniqueness, defaults, and nullability;
- SQLAlchemy models and every application/background writer and reader;
- raw files or feeds participating in controlled import;
- local identifiers, text references, implicit joins, and denormalized snapshots;
- row counts, storage size, date range, growth, and update frequency;
- configuration, targets, payloads, messages, errors, and other potentially sensitive fields;
- current backup artifacts and evidence of restoration, without exposing paths or credentials in shared documentation.

Inventory is descriptive. It does not authorize copying production or sensitive data.

### Phase B — Data profiling

Using isolated approved data, profile:

- null, empty, placeholder, malformed, and out-of-range values;
- Unicode and source encoding, including Thai text and combining marks;
- leading zeros, punctuation, whitespace, and identifier namespace differences;
- Gregorian/Buddhist Era and day/month ambiguity;
- naive versus explicit-timezone timestamps;
- status vocabularies and values that do not map safely to one domain;
- vehicle, registration, vehicle-code, location, user, campaign, plan, import, notification, and scheduler cardinality;
- duplicate, orphan, ambiguous, conflicting, missing, rejected, and stale records;
- mileage ordering, duplicate readings, decreases, resets/replacements, units, and source times;
- sensitive content requiring minimization, protection, redaction, or exclusion.

Profiling outputs contain safe aggregates and controlled exception references, not exposed credentials or unnecessary raw sensitive data.

### Phase C — Normalization and mapping design

1. Preserve every original decoded value before transformation.
2. Apply only approved, versioned, field-specific normalization rules.
3. Keep normalized comparison values separate from display/source values.
4. Classify matches as exact, normalized, ambiguous, conflicting, missing, or rejected.
5. Treat `vehicle_no` as a transitional matching key only.
6. Do not create or assign `fleetos_vehicle_id` until its owner, type, generator, merge/split, and retirement rules are approved.
7. Keep registrations, vehicle codes, fleet labels, business-unit labels, locations, users, and responsibility names in distinct namespaces.
8. Preserve plan, campaign, completion, and history snapshots even after reviewed master links exist.
9. Version all crosswalks, mappings, status conversions, and calculation rules.

### Phase D — Orphan, duplicate, ambiguity, stale, and conflict handling

| Condition | Migration action |
| --- | --- |
| Orphan | Retain the source/business record; record the missing parent; quarantine or allow a nullable reviewed reference according to approved domain rules. Never fabricate a parent. |
| Duplicate | Preserve every source record; distinguish import replay from legitimate repeated business events; require reviewed merge or coexistence disposition. |
| Ambiguous | Stop automatic mapping for all candidates; quarantine and require an authorized decision. |
| Conflicting | Preserve both values and provenance; resolve by authoritative domain ownership or reviewed mapping, not latest timestamp. |
| Stale | Preserve source time and freshness; prevent stale values from overwriting current authoritative state. |
| Missing/rejected | Record safe reason and row outcome; do not convert missing authoritative input into zero or empty success. |
| Corrected | Link compensating/superseding evidence and retain the prior accepted record. |

Exception counts and dispositions become migration acceptance evidence.

### Phase E — Target mapping and compatibility design

Before mutation, define and review:

- source-to-target table and field mapping;
- physical type and precision mapping after the engine is approved;
- nullability, uniqueness, referential, and check-constraint activation order;
- current application read/write compatibility for every migration stage;
- separation of `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status`;
- internal/public identifier mapping without exposing persistence keys;
- history, audit, import, scheduler, notification, and sensitive-field handling;
- transaction boundaries, idempotency, concurrency, and failure behavior;
- read-projection rebuild and freshness behavior;
- schema-version ownership and deployment sequencing.

No generic current status is mapped automatically into multiple target domains.

### Phase F — Backup and restore rehearsal

Before any migration rehearsal that mutates data:

1. Produce an approved, access-controlled backup of every in-scope source.
2. Verify backup completeness and integrity through an approved mechanism.
3. Restore into an isolated environment using the documented owner and procedure.
4. Validate schema, row counts, relationships, representative records, Unicode, dates, status distributions, and application compatibility.
5. Measure restore duration and compare it with approved recovery objectives once those objectives exist.
6. Record safe evidence, tool/version information, failures, and corrective actions.
7. Repeat until restoration is demonstrated; backup creation alone is not recovery evidence.

Backup location, encryption, key management, retention, and recovery objectives remain unresolved and must not be documented with secret values.

### Phase G — Staged migration rehearsal

Use isolated approved data and a repeatable versioned mechanism after tooling approval:

1. Recreate the source baseline from a verified restore.
2. Run a read-only preflight and stop on unmet prerequisites.
3. Create target structures in the approved sequence.
4. Load reference and identity evidence without guessing unresolved links.
5. Load operational maintenance records and preserve historical snapshots.
6. Load history/audit, campaign, import/reconciliation, scheduler, and notification evidence in dependency order.
7. Apply reviewed transformations with recorded rule versions.
8. Record row-level and batch-level outcomes.
9. Activate candidate constraints only after orphan/duplicate reconciliation proves them safe.
10. Build only approved indexes tied to validated access patterns.
11. Rebuild target read projections and record freshness.
12. Re-run the entire migration to prove deterministic replay or the approved resume behavior.

The exact load order may change after physical design approval. Every change requires reviewed compatibility and rollback impact.

### Phase H — Reconciliation

Reconciliation must compare source, target, and approved projections across:

- total and per-table/domain counts;
- accepted, rejected, orphan, duplicate, ambiguous, conflicting, stale, and corrected counts;
- null/empty and distinct-value distributions;
- vehicle, location, plan, campaign, history, task, import, scheduler, notification, and audit relationships;
- each of the four independent status domains;
- planned, deadline, actual, effective, measured, received, and recorded dates/times;
- original and normalized Unicode/source values;
- mileage totals/ranges and reset/correction cases after rule approval;
- target constraint and uniqueness violations;
- API/read-model counts, ordering, pagination, freshness, and approved KPI populations;
- safe hashes or equivalent evidence where approved, without exposing sensitive values.

Every discrepancy receives an approved disposition. A matching total row count alone is not sufficient evidence.

### Phase I — Shadow validation

Before cutover:

- keep the current PM Assistant path authoritative;
- run the target database and read projections in an isolated or non-authoritative shadow mode;
- compare current and target results for representative workflows and edge cases;
- test valid empty, missing, ambiguous, conflicting, stale, unavailable, and failure states;
- test Thai text, dates, status separation, pagination, imports, scheduler duplicate prevention, notification retry, and audit evidence;
- test target write behavior without using AutoPM as a writer;
- verify AutoPM contract compatibility through the API boundary only;
- observe freshness, latency, error, lock, storage, backup, and restore behavior against approved thresholds.

Shadow differences are evidence for review, not permission to overwrite current authoritative data.

### Phase J — Cutover gates

Cutover cannot begin until all applicable gates are satisfied:

- required ADRs and ownership/identity/status decisions are accepted;
- engine, migration tooling, topology, security, and operational ownership are approved;
- all rehearsals start from verified restore and complete reproducibly;
- reconciliation meets Product Owner-approved thresholds with no undisposed critical exception;
- source and target application compatibility is demonstrated for the planned sequence;
- backup restoration and recovery timing meet approved objectives;
- read projections and API contract tests pass;
- no AutoPM database access or direct shared-schema coupling exists;
- monitoring and stop/go signals are available without leaking sensitive details;
- rollback and forward-recovery procedures are rehearsed;
- deployment, migration, cutover, credentials, and communications receive explicit Product Owner approval.

### Phase K — Controlled cutover direction

The later approved runbook must identify:

- decision owner, operators, observers, communication channel, and maintenance window;
- last-known-good source/database/application state;
- writer pause or compatibility strategy and how concurrent writes are handled;
- final backup, incremental capture if applicable, migration sequence, and checks;
- target readiness, application switching, projection rebuild, and consumer enablement order;
- exact stop/go thresholds and evidence checkpoints;
- rollback or forward-recovery trigger and decision deadline;
- post-cutover monitoring and stabilization window.

This blueprint does not authorize or prescribe a production topology or a specific cutover mechanism.

## Rollback versus forward recovery

The approved runbook must choose based on the failure stage and compatibility evidence.

### Rollback candidate

Rollback may be appropriate when:

- authoritative writes have not begun on the target, or a verified reversible compatibility window exists;
- the last-known-good source can be restored without losing accepted business events;
- application/schema compatibility for the rollback path is proven;
- the failure is faster and safer to isolate by returning to the prior route.

Rollback must preserve PM Assistant authority, raw source records, accepted history/audit, issued identifiers, mapping versions, and reconciliation evidence. It must never reverse-synchronize AutoPM cache or presentation data.

### Forward-recovery candidate

Forward recovery may be safer when:

- target authoritative writes have occurred and reversing would lose or duplicate accepted events;
- a corrective migration is smaller and better understood than restoring the prior state;
- security actions such as credential revocation cannot safely be undone;
- the approved compatibility window has closed.

Forward recovery requires explicit Product Owner decision, tested corrective steps, preserved evidence, reconciliation, and user/operator communication.

### Decision evidence

The decision must record failure stage, affected data, last consistent point, write activity, backup/restore status, compatibility, estimated loss/duplication risk, recovery duration, owner, approval, and post-recovery reconciliation result.

## Post-cutover validation and stabilization

Later implementation must validate:

- authoritative workflows and all four status domains;
- imports, quarantine, replay, and partial outcomes;
- scheduler single execution and recovery;
- notification intent, attempts, redaction, and retry;
- history, audit, identity, snapshots, and original source values;
- API schemas, ordering, pagination, freshness, error behavior, and AutoPM read-only consumption;
- backup, restore readiness, persistence health, query behavior, and capacity;
- no direct database access from AutoPM and no unexpected legacy writer.

The legacy path is retired only after the stabilization window and separate Product Owner approval. Retention or disposal of old database artifacts requires an approved policy.

## Evidence package

Each rehearsal or future migration should retain a safe evidence package containing:

- approved scope and decision references;
- source/target schema versions and migration-tool version after selection;
- preflight results and source inventory revision;
- backup and restore verification;
- start/end times, operator/process, environment class, and correlation;
- batch/row outcomes and reconciliation reports;
- exception dispositions and approval records;
- performance and operational observations;
- rollback/forward-recovery result;
- post-recovery or post-cutover validation;
- known limitations and residual risks.

Evidence excludes credentials, connection strings, production hosts, raw authorization data, unnecessary personal data, and unredacted sensitive payloads.

## Future decisions outside Phase 4.1

- target engine and topology;
- migration framework and schema-version repository;
- identifier and ORM strategy;
- transformation implementation and execution owner;
- backup/restore technology, encryption, retention, RPO, and RTO;
- cutover method and maintenance window;
- dual-write or change-capture feasibility, if considered;
- acceptance thresholds, stabilization period, rollback deadline, and communications;
- legacy artifact archival or disposal.

## Documentation-only rollback

Phase 4.1 changes can be rolled back by reverting only the isolated database documentation change set and the minimal development-guide navigation links. No database or application rollback is needed because this phase performs no runtime or data mutation.

## Related documents

- [Database Blueprint](DATABASE_BLUEPRINT.md)
- [Schema Design](SCHEMA_DESIGN.md)
- [Table Specification](TABLE_SPECIFICATION.md)
- [Index Strategy](INDEX_STRATEGY.md)
- [FleetOS Development Lifecycle](../engineering/DEVELOPMENT_LIFECYCLE.md)
- [FleetOS Review and Release Checklists](../engineering/REVIEW_RELEASE_CHECKLISTS.md)
