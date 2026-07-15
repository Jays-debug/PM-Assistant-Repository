# FleetOS Schema Design

## Purpose and status

This document defines the conceptual FleetOS v1.0 schema design. It does not provide executable SQL, select an engine, approve ORM models, or make the candidate table names a migration instruction.

Existing SQLite tables and SQLAlchemy models remain current implementation evidence. The target design is logical and must pass later ADR, implementation, migration, and Product Owner approval gates.

## Schema design principles

1. Keep PM Assistant as the authoritative maintenance persistence boundary.
2. Expose purpose-built API/read models, not tables or ORM entities.
3. Preserve module independence and prohibit AutoPM database access.
4. Represent authoritative state separately from history, audit, import evidence, and delivery attempts.
5. Preserve original source values and historical snapshots before normalization.
6. Keep the four status domains separate.
7. Use explicit relationships and candidate constraints only after legacy-data profiling.
8. Make ambiguous, conflicting, duplicate, orphaned, stale, missing, and rejected data visible.
9. Treat internal keys, business identifiers, aliases, and public resource identifiers as distinct concepts.
10. Tie physical optimization to measured access patterns and representative data.

## Current SQLite implementation evidence

Current PM Assistant persistence uses local integer primary keys for most tables, textual vehicle and location references in several records, generic status strings, denormalized plan snapshots, and startup-time schema creation. Explicit foreign keys and versioned schema evolution are not demonstrated in the current model definitions.

This evidence creates migration inputs, not automatic target decisions. Current data may contain legitimate history that does not conform to later candidate constraints.

## Transitional schema direction

During transition:

- inventory current keys and implicit relationships before adding enforcement;
- retain source table, source record reference, original value, normalization version, and classification;
- create exception records for unresolved relationships instead of silently inventing masters;
- maintain crosswalks between current local records and candidate target records;
- retain denormalized plan labels as historical snapshots even after a reviewed master relationship exists;
- map generic status values into candidate domains only through approved, reversible rules;
- keep source and target records available for shadow comparison until acceptance.

## FleetOS v1.0 target logical domains

### Reference and identity domain

Supports vehicles, vehicle aliases, locations, location aliases, and reviewed mappings. Enterprise ownership is not implied. Candidate records retain lifecycle state, effective dates where relevant, and source provenance.

### Maintenance domain

Supports PM plans, workflow state/history, explicit completion records, task state, accepted mileage evidence, and mileage calculations. Operational state and historical evidence are separate but traceable.

### Campaign domain

Supports weekly or other approved maintenance campaigns and their items. Campaign membership references maintenance/vehicle concepts without replacing plan authority.

### Import and reconciliation domain

Supports immutable batch identity, row outcomes, replay disposition, classifications, quarantine, reviewer decisions, normalization/mapping versions, and safe source references.

### Notification and scheduler domain

Supports notification intent separately from delivery attempts and scheduler definition separately from each execution. It enables idempotency and duplicate-execution evidence without selecting a scheduler technology.

### Audit domain

Supports durable domain events and corrections with actor/process, event time, recorded time, result, reason, correlation, causation, and safe before/after evidence. Operational logs are not substitutes for domain audit.

### Read-projection domain

Supports purpose-built query shapes with source and freshness metadata. A physical table, view, materialized view, cache, or application-computed projection is not selected in Phase 4.1.

## Identity and key model

### Internal primary keys

Every target record needs an immutable internal primary key. Its physical type and generation strategy are unresolved. Internal keys:

- must not be reassigned or reused;
- must not be inferred from row order;
- are not automatically valid public API identifiers;
- may remain local to PM Assistant unless a later contract approves broader meaning.

### Business and matching keys

- `vehicle_no` is transitional matching data, not a permanent primary key.
- Registration and vehicle code are namespaced aliases or attributes, not substitutes for `vehicle_no`.
- Human-readable location names and user display names are not stable relational identities.
- Idempotency and replay keys require domain, scope, issuer, uniqueness, and retention rules before implementation.

### Proposed future identity

`fleetos_vehicle_id` is reserved as a proposed future canonical identifier. It is not implemented or approved. Its owner, type, generation, uniqueness scope, API representation, effective dates, merge/split behavior, retirement, and reuse policy remain unresolved.

## Relationship model

Candidate relationships are logical until profiling proves enforcement safe:

- a PM plan references one reviewed vehicle identity when available while retaining its historical vehicle labels;
- a PM plan references one reviewed location identity when available while retaining its historical location label;
- workflow transitions, completion records, task state, and plan history reference the initiating PM plan;
- accepted mileage records reference a reviewed vehicle identity and their source evidence;
- a mileage calculation references the exact accepted inputs and rule version used;
- campaign items reference a campaign and may reference a vehicle and PM plan;
- import rows reference one import batch and may reference quarantine and reconciliation decisions;
- notification intents reference their business cause; attempts reference one intent;
- scheduler executions reference a logical job definition and their causation/correlation evidence;
- audit events reference domain resources through a controlled domain and resource-reference convention.

Required relationships should use referential enforcement after orphan remediation. Optional relationships must remain nullable rather than pointing to fabricated placeholder records.

## Status model

### `pm_workflow_status`

Represents plan workflow progression. Candidate values and transition rules remain a domain decision. Each transition records old value, new value, effective time, recorded time, actor/process, reason, and correlation.

### `completion_status`

Represents explicit completion, correction, reopen, and re-completion. It is not inferred from workflow status, planned/deadline date, mileage behavior, notification success, or AutoPM display state.

### `pm_mileage_status`

Represents a derived condition from accepted mileage evidence and an approved versioned rule. It records input reference, rule version, calculation time, source freshness, and result. Recalculation does not rewrite raw accepted mileage.

### `notification_status`

Represents notification intent and delivery outcome. An intent can have multiple attempts; provider attempt results must not overwrite plan workflow or completion.

Generic source status values remain original evidence until an approved mapping assigns them to one domain. Unknown or unmapped values are not guessed.

## Field and value conventions

- Candidate logical names use `snake_case` to align with approved API/data terminology. Existing names are preserved as evidence during migration.
- Text retains Unicode, including Thai characters and combining marks.
- Original values and normalized values occupy separate fields or controlled evidence structures.
- Normalized values include a rule version and cannot replace display/source values.
- Identifier-like strings retain leading zeros and punctuation unless an approved normalization rule says otherwise.
- Dates and timestamps distinguish raw source value, parsed value, measured/effective time, received time, and recorded time where applicable.
- Target timestamps require explicit timezone semantics; physical types and timezone policy require later approval.
- Boolean-like, enum-like, and numeric source values are validated rather than coerced silently.
- Monetary, mileage, duration, and counter precision must be selected from profiled ranges and approved business rules.
- Free-form structured evidence requires a documented shape, redaction policy, and compatibility strategy before implementation.

## Historical snapshots and provenance

Historical maintenance records preserve values known when the business event occurred. A later master correction must not rewrite prior plan, completion, campaign, notification, or audit context.

Relevant provenance includes:

- source type and safe source reference;
- source record and batch reference;
- original decoded value;
- normalized value and rule version;
- mapping/reconciliation decision and reviewer;
- measured, effective, received, and recorded times;
- actor or process and correlation/causation references;
- prior record or superseded decision for corrections.

Provenance must exclude credentials, raw authorization material, unnecessary personal data, and unredacted sensitive payloads.

## Integrity and candidate constraints

Candidate constraints include:

- non-null internal primary keys and required domain fields;
- uniqueness scoped to the actual business rule, source namespace, or active effective period;
- foreign keys for required reviewed relationships after orphan remediation;
- domain checks for allowed classification and outcome values after vocabularies are approved;
- ordered date/effective-period checks where business rules are unambiguous;
- non-negative count and mileage checks, with explicit handling for odometer reset/replacement;
- one current task-state record per plan where that remains an approved invariant;
- idempotency uniqueness within an approved domain and retention window;
- optimistic concurrency token or equivalent behavior for authoritative updates.

Constraints must not encode unresolved policy. A source conflict is quarantined rather than forced through a lossy constraint.

## Data-quality exception handling

| Condition | Required treatment |
| --- | --- |
| Orphan | Preserve the business record, record the missing relationship, quarantine where required, and prohibit fabricated parent records. |
| Duplicate | Group candidates by approved key/rule, preserve every source record, and require replay or merge disposition. Do not keep only the latest. |
| Ambiguous | Quarantine all candidates and require reviewed resolution. Never choose by row order, timestamp, or fuzzy similarity alone. |
| Conflicting | Preserve competing values and ownership/provenance, then apply only an approved domain-owner or reviewed mapping decision. |
| Stale | Retain source and age metadata; prevent stale values from overwriting authoritative current state. |
| Missing | Distinguish absent required data from a valid empty or zero value; reject or quarantine according to the approved boundary. |
| Rejected | Retain a safe reason and source reference without mutating authoritative records. |
| Corrected | Retain prior evidence and link the compensating or superseding record. |

## Audit, sensitivity, and retention

Each table specification assigns a conceptual sensitivity class:

- **Operational internal** — maintenance operational data with limited authorized access.
- **Sensitive internal** — identity, user, target, source, or payload information requiring stronger minimization and redaction.
- **Audit controlled** — durable evidence with restricted mutation and access.
- **Projection safe** — explicitly approved fields suitable for a defined consumer; not equivalent to public data.

Retention remains unresolved unless an approved document states otherwise. Target tables identify whether retention must be approved, whether records are expected to be append-oriented, and whether deletion requires a compensating or tombstone strategy. No retention period is selected in Phase 4.1.

## Deletion and correction direction

- Authoritative history and audit should be corrected through compensating evidence where feasible.
- Master retirement should preserve historical references and aliases.
- Plan deletion behavior must distinguish user-visible cancellation, archival, and physical deletion.
- Privacy deletion, legal hold, archival, and purge policies remain unresolved.
- Cascading physical deletion is not a default; each relationship requires impact and retention analysis.

## Read projections

Read projections must:

- contain only fields approved for the consumer;
- expose source, `as_of`, generated time, freshness, and stale state;
- keep the four status domains separate;
- preserve API identity and nullability contracts independently of storage design;
- distinguish valid empty results from missing, ambiguous, stale, or unavailable authoritative input;
- avoid exposing internal keys, table names, raw audit, secrets, or sensitive payloads unless explicitly approved.

AutoPM accesses these projections only through an approved versioned API.

## Future decisions outside Phase 4.1

- physical engine and type mapping;
- identifier type and generator;
- physical schema namespaces and naming migration;
- migration and ORM tooling;
- constraint activation sequence;
- partitioning, views, materialization, triggers, or stored procedures;
- concurrency implementation and transaction isolation;
- encryption and field-level protection;
- retention, archival, deletion, and legal hold;
- enterprise identities and master-data ownership.

## Related documents

- [Database Blueprint](DATABASE_BLUEPRINT.md)
- [Table Specification](TABLE_SPECIFICATION.md)
- [Index Strategy](INDEX_STRATEGY.md)
- [Migration Strategy](MIGRATION_STRATEGY.md)
- [FleetOS Identity Contract](../IDENTITY_CONTRACT.md)
- [FleetOS Data Ownership](../DATA_OWNERSHIP.md)
