# FleetOS Entity Catalog

## Purpose

This catalog defines conceptual entities and value objects for FleetOS v1.0. It does not define tables, ORM classes, API schemas, or identifier storage formats.

An **entity** has continuity that matters to the business even when its attributes change. A **value object** is identified by its meaning and values within an owning context. Current implementation classes with similar names remain evidence only.

## Entity catalog

### Identity and organization

| ID | Entity | Meaning and identity direction | Owner and state |
| --- | --- | --- | --- |
| `ENT-001` | Vehicle | The maintenance subject. Its Phase 5.3 minimum PM Assistant implementation has immutable `local_vehicle_id` identity and one `VO-020`; future cross-system transition remains through provenance-rich `VO-001`, and no canonical v1 enterprise identifier may be fabricated. | PM Assistant-local representation approved; enterprise owner remains unresolved (`DEC-001`). |
| `ENT-002` | Vehicle Alias/Registration Record | A historically meaningful, namespaced vehicle reference such as registration, vehicle code, or historical vehicle number. It preserves source and effective-period evidence. | Lifecycle and uniqueness depend on `DEC-001` and `DEC-002`. |
| `ENT-003` | Fleet or Business Grouping | A conceptual organizational grouping distinct from transport type, PM group, responsibility, or display label unless approved mappings say otherwise. | Owner, hierarchy, and stable identity unresolved (`DEC-004`). |
| `ENT-004` | Vehicle Grouping Assignment | The association of a vehicle to an approved grouping for an effective period, preserving prior assignments and mapping provenance. | Target direction; semantics depend on `DEC-004`. |
| `ENT-005` | Location | A maintenance place or service location. Its historical names and plan-time representations must be preserved. | PM Assistant transitional representation; stable owner/identity unresolved (`DEC-003`). |

### Planning, completion, and history

| ID | Entity | Meaning and identity direction | Owner and state |
| --- | --- | --- | --- |
| `ENT-006` | PM Plan | An authoritative intention to perform preventive-maintenance work for a vehicle under a schedule and workflow. Current local IDs may be exposed only as opaque local resource references. | PM Assistant. External identity and recurring semantics unresolved (`DEC-008`, `DEC-015`). |
| `ENT-007` | PM Completion | The preserved business record of an explicit completion, reopen, correction, or re-completion action. It is distinct from workflow and mileage state. | PM Assistant; evidence and lifecycle policy unresolved (`DEC-007`). |
| `ENT-008` | PM History Entry | One ordered, preserved account of a plan-related action or correction with safe actor/process, time, correlation, and change summary. | PM Assistant; access and retention unresolved (`DEC-014`). |

### Mileage

| ID | Entity | Meaning and identity direction | Owner and state |
| --- | --- | --- | --- |
| `ENT-009` | Mileage Reading | A received odometer or mileage observation with raw/parsed measurement, vehicle classification, measured/received time, timezone, source, and validation disposition. | Conditional target; producer and acceptance rules unresolved (`DEC-009`). |
| `ENT-010` | PM Mileage Assessment | A versioned result that relates one accepted reading to `pm_mileage_status`, calculation time, freshness, and the rule used. | PM Assistant only after `DEC-009` and `DEC-010`. |

### Notification and scheduler

| ID | Entity | Meaning and identity direction | Owner and state |
| --- | --- | --- | --- |
| `ENT-011` | Notification Intent | The business decision to send an approved notification for a reason, subject, recipient reference, and duplicate-suppression scope. | PM Assistant; recipient and idempotency rules unresolved (`DEC-011`). |
| `ENT-012` | Notification Attempt | One provider interaction linked to an intent, with attempt number, safe result classification, time, and terminal/retry direction. | PM Assistant; retry policy unresolved (`DEC-011`). |
| `ENT-013` | Scheduler Job | A deterministic definition of a recurring or one-time business job, referring only to safe configuration. | PM Assistant; runtime owner and execution rules unresolved (`DEC-012`). |
| `ENT-014` | Scheduler Execution | One trigger/acquisition/run outcome for a scheduler job, including safely skipped duplicates. | PM Assistant; exact locking/misfire/retry behavior unresolved (`DEC-012`). |

### Import, synchronization, and audit

| ID | Entity | Meaning and identity direction | Owner and state |
| --- | --- | --- | --- |
| `ENT-015` | Import Batch | One controlled ingestion request from receipt through preview, confirmation/cancellation, mutation outcome, and replay disposition. | PM Assistant; replay and atomicity policy unresolved (`DEC-013`). |
| `ENT-016` | Import Row Result | One row's received source reference, validation classifications, proposed action, final disposition, and safe errors. | PM Assistant; belongs to `ENT-015`. |
| `ENT-017` | Synchronization Record | Evidence of one controlled reconciliation/publication run, its source/target domains, counts, versions, freshness, and terminal outcome. | PM Assistant for maintenance synchronization audit. |
| `ENT-018` | Audit Record | Domain-appropriate, secret-safe evidence of an action or outcome. It may reference but does not replace specialized history, attempt, execution, or row evidence. | Created by the authoritative domain; access/retention unresolved (`DEC-014`). |
| `ENT-019` | Reconciliation Decision | A reviewed disposition for an exact, normalized, ambiguous, conflicting, missing, or rejected identity/mapping case, including supersession lineage. | Controlled FleetOS reconciliation process; decision authority unresolved where master ownership is unresolved. |

## Value-object catalog

The canonical meanings of `VO-*` identifiers are defined in the [Canonical Domain Model](DOMAIN_MODEL.md). This catalog repeats selected labels only to show entity relationships and ownership; it does not create a second controlling definition.

| ID | Value object | Required meaning or content |
| --- | --- | --- |
| `VO-001` | Transitional Vehicle Key | Original `vehicle_no`, normalized comparison value, normalization-rule version, source, and match classification. It is not a permanent identity. |
| `VO-002` | Alias Namespace and Value | Alias type/namespace, original value, comparison value if approved, provenance, and optional effective period. |
| `VO-003` | Identity Match Classification | Exactly one of exact, normalized, ambiguous, conflicting, missing, or rejected, with a safe reason. |
| `VO-004` | Source Provenance | Source type, safe source reference, received/observed time, and applicable contract or mapping version. |
| `VO-005` | Effective Period | Explicit start and optional end under an approved time policy; absence of an end does not prove permanence. |
| `VO-006` | Location Snapshot | Plan-time location name and approved attributes required to preserve historical meaning after rename or remapping. |
| `VO-007` | Plan Schedule | Planned date, deadline date, optional actual/effective time references, timezone interpretation where applicable, and separate schedule condition. |
| `VO-008` | PM Workflow Status | `pm_workflow_status`; vocabulary and allowed transitions require `DEC-006`. |
| `VO-009` | Completion Status | `completion_status`; distinct from workflow and governed by explicit completion/reopen policy (`DEC-007`). |
| `VO-010` | PM Mileage Status | `pm_mileage_status`; calculated only from accepted input under an approved rule (`DEC-010`). |
| `VO-011` | Notification Status | `notification_status`; pending, success, failed, skipped, and unknown remain distinct where approved. |
| `VO-012` | Mileage Measurement | Raw value, parsed value, unit, measured time, received time, explicit timezone, and validation information. |
| `VO-013` | Actor Reference | Safe user/process reference and actor type. It does not contain credentials and does not prove authorization. |
| `VO-014` | Configuration Reference | Safe configuration name, version, or revision used by a job/rule. It never contains token, secret, raw target, or connection value. |
| `VO-015` | Correlation Reference | Validated diagnostic reference propagated across approved actions. It is not authentication, authorization, causation, ordering, or idempotency evidence. |
| `VO-016` | Idempotency Reference | Business operation/replay identity and scope under an approved policy; format remains unresolved (`DEC-011`, `DEC-013`, `DEC-015`). |
| `VO-017` | Rule/Contract/Mapping Version | Immutable safe identifier for the exact rule, interface contract, normalization, or mapping applied. |
| `VO-018` | Freshness | Source, `as_of`, generated/received time, stale classification, and fallback/unavailable state where applicable. |
| `VO-019` | Batch Outcome Counts | Received, accepted, rejected, ambiguous, conflicting, skipped, and other approved counts without concealing partial success. |
| `VO-020` | Original Vehicle Number | Immutable, raw source-preserved `vehicle_no` text with exact value equality. Null, empty, and whitespace-only values are rejected; all accepted text is preserved without transformation. It is not Vehicle identity or normalization and may later provide only the original-value component of unimplemented `VO-001`. |

## Identity rules by entity

| Entity | Current evidence | Transitional reference | Target direction | Prohibited interpretation |
| --- | --- | --- | --- | --- |
| `ENT-001` Vehicle | Sheet index/fields and local `vehicle_master.id`; the latter currently backs storage-agnostic `local_vehicle_id`. | Phase 5.3 aggregate identity is PM Assistant-local only; future cross-system references use `VO-001` under approved normalization. | Provenance-rich v1 representation; future canonical registry outside v1. | `local_vehicle_id`, local backing ID, row index, registration, code, vehicle number, or timestamp as automatic shared identity. |
| `ENT-005` Location | Local integer ID and unique name; plan text. | Exact canonical name or approved alias plus preserved snapshot. | Stable representation after `DEC-003`. | Similar/translated name as automatic equality. |
| `ENT-006` PM Plan | PM Assistant local integer ID. | Opaque local resource reference. | Stable external identity only after `DEC-015`; recurring identity after `DEC-008`. | Database key format as domain or API commitment. |
| `ENT-009` Mileage Reading | No observed PM Assistant entity. | Safe source reference plus vehicle/time evidence; collision policy unresolved. | Stable accepted-record reference after `DEC-009`. | Vehicle plus timestamp assumed unique without approval. |
| `ENT-011` Notification Intent | No canonical separate current record. | Correlation to initiating action, not an idempotency guarantee. | Business idempotency identity after `DEC-011`. | Provider response or correlation ID as intent identity. |
| `ENT-013` Scheduler Job | APScheduler string job IDs. | Current IDs are runtime evidence only. | Deterministic business identity after `DEC-012`. | Process-local scheduler ID as universal identity. |
| `ENT-015` Import Batch | Local import-log ID and filename. | Traceable batch reference; filename alone is insufficient. | Replay identity after `DEC-013`. | Filename, timestamp, or correlation ID alone as approved replay identity. |

## Concept relationships

| Source | Relationship | Target | Rule |
| --- | --- | --- | --- |
| `ENT-001` | owns a history of | `ENT-002` | Alias records preserve namespace, provenance, and approved effective periods. |
| `ENT-001` | has assignments to | `ENT-003` through `ENT-004` | Original labels and mapping versions remain traceable. |
| `ENT-006` | refers to | `ENT-001` | An unresolved identity creates an exception; it does not silently create or merge a vehicle. |
| `ENT-006` | uses a snapshot of | `ENT-005` | Historical location label remains available after lifecycle changes. |
| `ENT-006` | has completion evidence | `ENT-007` | Completion is explicit and correction preserves prior evidence. |
| `ENT-006` | has ordered history | `ENT-008` | Empty history differs from unknown or unauthorized plan. |
| `ENT-009` | refers to | `ENT-001` | Invalid or ambiguous identity prevents acceptance under the approved policy. |
| `ENT-010` | assesses | `ENT-009` | Accepted raw measurement is immutable under recalculation/rollback direction. |
| `ENT-011` | may concern | `ENT-006` | The intent's business subject and reason remain explicit. |
| `ENT-012` | belongs to | `ENT-011` | Attempt number and provider outcome cannot replace intent identity. |
| `ENT-014` | belongs to | `ENT-013` | Non-acquired duplicate execution is preserved as skipped evidence. |
| `ENT-015` | contains | `ENT-016` | Every received row has one traceable final disposition, including cancellation. |
| `ENT-016` | may create or reference | `ENT-019` | Ambiguity/conflict remains quarantined until reviewed. |
| `ENT-017` | summarizes | `ENT-019` | Synchronization does not erase individual decisions or source evidence. |
| Domain entities | produce safe evidence in | `ENT-018` | Specialized domain records remain authoritative for their detailed meaning. |

## Current implementation mapping caution

The following similarities are evidence only:

- `VehicleMaster` resembles parts of `ENT-001` but does not establish enterprise ownership or identity.
- Phase 5.3 permits its existing local identifier to back `local_vehicle_id` only inside PM Assistant; this does not promote its storage name or representation into domain terminology.
- `Location` resembles parts of `ENT-005` but its integer ID is not a FleetOS identity.
- `PMPlan` resembles `ENT-006` but its generic `status` combines or derives meanings the target model separates.
- `PMHistory` resembles `ENT-008`, but safe projection, retention, and correction policy remain unresolved.
- `NotificationLog` resembles `ENT-012`; it does not establish `ENT-011` intent or approved retry/idempotency behavior.
- `ImportLog` resembles `ENT-015`; it does not establish row-level `ENT-016` or replay safety.
- `PMTaskState`, weekly-control models, settings, LINE targets, and webhook events are current capability evidence. Their target domain placement and lifecycle must not be inferred without an approved decision.

