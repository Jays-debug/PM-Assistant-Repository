# FleetOS Index Strategy

## Purpose and status

This document defines candidate indexing principles for the FleetOS v1.0 logical database design. It contains no executable index definitions and does not select a database engine or vendor-specific index type.

Indexes are justified only by documented integrity or access patterns. Phase 4.1 does not recommend indexing every column, copying every current SQLite index, or treating candidate indexes as approved physical design.

## Current SQLite implementation evidence

Current SQLAlchemy definitions mark selected primary keys, `vehicle_no`, dates, local relationship fields, campaign period fields, campaign item status/week, LINE source ID, and PM task plan references as indexed or unique. This is implementation evidence only.

The repository does not provide approved production query plans, representative volumes, service-level thresholds, write rates, selectivity measurements, or target-engine behavior. Current index declarations therefore cannot be promoted automatically into the target design.

## Transitional indexing direction

1. Inventory current routes, background jobs, imports, reports, exports, and maintenance queries.
2. Capture logical filter, join, sort, pagination, uniqueness, and update patterns without recording sensitive parameter values.
3. Profile row counts, growth, cardinality, null distribution, skew, duplicate rates, and write frequency using isolated approved data.
4. Establish representative critical queries and Product Owner-approved performance thresholds.
5. Compare baseline and candidate query plans on the selected engine only after that engine is approved.
6. Add, change, or remove indexes through the approved versioned migration process.
7. Re-measure write latency, storage, maintenance cost, lock behavior, and query regression after each index change.

## FleetOS v1.0 target principles

- Primary-key enforcement requires an index or equivalent selected-engine behavior.
- Approved uniqueness rules require a unique constraint or equivalent enforcement, not application-only checking.
- Foreign-key join paths are candidate indexes when parent deletion/update checks or common child lookups require them.
- Composite indexes follow the documented filter and order pattern; column order is selected from equality, range, sort, and selectivity evidence.
- Pagination indexes must support the approved deterministic order and cursor tie-breaker.
- Low-cardinality fields such as a Boolean or small status set are not indexed alone without measured benefit.
- Large text, raw payload, notes, messages, responses, and before/after evidence are not general index candidates.
- Redundant indexes are avoided when an existing key or composite index already serves the access pattern.
- Read optimization must not compromise authoritative write correctness or create unacceptable migration/maintenance cost.
- Physical indexes remain internal; API clients cannot depend on storage order or index presence.

## Documented access patterns and candidate index families

The table below records logical candidate families. Exact columns, order, included fields, predicates, and physical types require later query-plan evidence.

| Access pattern | Candidate index family | Reason and limits |
| --- | --- | --- |
| Fetch one PM plan by internal key | Primary-key index | Integrity and point lookup. The key is not automatically a public ID. |
| List plans for a reviewed vehicle over a date range in deterministic order | Vehicle reference plus approved plan date and tie-breaker | Supports vehicle history/calendar reads. Add only after the vehicle relationship and ordering contract are approved. |
| List plans by planned/deadline date and workflow filters | Date-led composite aligned to the exact filter/order pattern | Supports My Today, calendar, overdue, and bounded list reads. Separate variants require query-plan evidence; generic status alone is insufficient. |
| Fetch current task state for one plan | Unique plan relationship | Enforces the candidate one-current-state-per-plan invariant if approved. |
| List workflow or completion history for a plan by recorded time | Plan reference, recorded time, immutable tie-breaker | Supports ordered audit/history reads and cursor pagination. Workflow and completion remain separate access paths. |
| Retrieve accepted mileage for a vehicle by measured time | Vehicle reference, measured time, tie-breaker | Supports latest/history validation. Source and reset behavior must be resolved before uniqueness. |
| Retrieve current mileage calculation for a vehicle or plan context | Context reference, rule/current discriminator as approved | Supports current status projection without deleting historical calculations. Physical partial/current indexing is vendor-dependent and unresolved. |
| Find vehicle or location aliases within a namespace | Namespace plus approved normalized comparison value | Supports reconciliation only. It must return all candidates so ambiguity is not hidden by an unsafe uniqueness rule. |
| List campaign items by campaign/week/status | Campaign reference followed by actual filter/order fields | Supports weekly-control lists. Multiple broad variants are not assumed. |
| Fetch import rows by batch and source-row order | Batch reference plus stable row reference/tie-breaker | Supports batch review and deterministic pagination. Row order is not business identity. |
| List unresolved data-quality cases by classification and age | Resolution state, classification, recorded time/tie-breaker | Supports operational review. Low-cardinality fields require combination and measured selectivity. |
| Detect approved import replay identity | Unique approved replay scope | Enforces idempotency only after checksum/scope/retention rules are approved. |
| Fetch attempts for a notification intent | Intent reference plus attempt order | Supports retry analysis and final-outcome derivation. |
| Detect approved notification idempotency | Unique business-cause/idempotency scope | Prevents duplicate intent only after domain and retention rules are approved. |
| Fetch scheduler executions by job and scheduled time | Job reference, scheduled time, tie-breaker | Supports execution history and duplicate-prevention evidence. |
| Detect a deterministic scheduler occurrence | Unique job/occurrence scope | Candidate only after timezone, misfire, retry, and execution-ownership rules are approved. |
| Query audit events by domain resource and recorded time | Domain, safe resource reference, recorded time/tie-breaker | Supports authorized resource audit. Cross-domain operational analytics may require a separate approved projection. |
| Find read-projection state by name/version | Unique projection identity | Supports generation and readiness metadata. It does not expose the table to AutoPM. |

## Status indexing rules

The four status domains are never combined into one generic status column or index:

- `pm_workflow_status` indexes serve workflow access patterns only.
- `completion_status` indexes serve explicit completion access patterns only.
- `pm_mileage_status` indexes serve derived mileage-condition projections only.
- `notification_status` indexes serve notification intent/delivery access patterns only.

A cross-domain report should use an approved projection or carefully validated joins. Similar labels or values do not justify combining status storage or indexes.

## Identity and normalization indexes

- `vehicle_no` may support transitional reconciliation searches, but it must not become a permanent target primary key by indexing convention.
- Original values remain retrievable evidence; normalized comparison fields may be indexed with their namespace and rule/version scope where required.
- An index must not force uniqueness when collisions are valid, unresolved, or part of the review workflow.
- `fleetos_vehicle_id` has no index recommendation until its existence, owner, type, lifecycle, and storage are approved.
- Location, fleet, business-unit, user, registration, and vehicle-code uniqueness remain unresolved.

## Read-model and API considerations

Index design should support approved API behavior:

- bounded list filters and sorts;
- deterministic cursor pagination;
- explicit date-range limits;
- freshness and projection generation;
- distinction between empty, missing, ambiguous, stale, and unavailable data.

Database indexes do not define the API contract. Unsupported API filters must fail explicitly rather than becoming accidental full scans, and internal index changes must not alter response ordering or semantics.

## Write, storage, and operational cost

Every candidate index must be assessed for:

- authoritative transaction latency;
- import and reconciliation throughput;
- scheduler and notification write volume;
- history/audit append cost;
- index size and growth;
- creation/rebuild duration and locking;
- backup, restore, migration, and recovery impact;
- data-distribution changes and ongoing maintenance.

Append-heavy evidence tables may need a different strategy from small operational master tables, but partitioning or vendor-specific index selection is outside Phase 4.1.

## Index validation plan

For each future physical index:

1. Link it to a named query/access pattern and owner.
2. Record baseline plan, latency distribution, rows examined, data volume, and write cost using isolated representative data.
3. Apply the candidate through an approved non-production migration.
4. Re-run positive, empty, high-cardinality, low-cardinality, stale, and worst-case ranges.
5. Confirm deterministic pagination and result correctness are unchanged.
6. Measure import, mutation, backup, restore, and maintenance effects.
7. Reject unused, redundant, regressive, or unjustified indexes.
8. Retain reviewed evidence and define a safe removal/rollback path.

Exact metrics and thresholds require Product Owner approval.

## Future decisions outside Phase 4.1

- selected database engine and physical index capabilities;
- representative data volumes, growth forecasts, and service levels;
- query-plan tooling and monitoring;
- online/offline build behavior and maintenance windows;
- partial, covering, expression, full-text, spatial, clustered, or partition-local indexes;
- projection materialization and refresh strategy;
- physical index naming, storage, ownership, and lifecycle automation.

## Related documents

- [Schema Design](SCHEMA_DESIGN.md)
- [Table Specification](TABLE_SPECIFICATION.md)
- [Migration Strategy](MIGRATION_STRATEGY.md)
- [FleetOS API Contract](../API_CONTRACT.md)
- [FleetOS Non-Functional Requirements](../product/NON_FUNCTIONAL_REQUIREMENTS.md)
