# FleetOS Resource and Endpoint Catalog

## Purpose and interpretation

This catalog assigns stable design identifiers to proposed FleetOS API resources and endpoints. It does not claim that any `/api/v1` endpoint is implemented or operational.

Maturity labels:

- **Core proposed v1**: aligns with the existing Proposed API Contract and is eligible for later implementation after its decisions pass.
- **Gated proposed v1**: intended for v1 only if its named prerequisite decisions are approved.
- **Directional candidate**: required visibility direction, but outside the current proposed contract inventory until the Product Owner approves contract expansion.

## Resource naming rules

1. Paths use lowercase plural kebab-case nouns.
2. Fields and query parameters use `snake_case`.
3. Paths describe resources or read models, not database tables, UI screens, actions, or provider names.
4. List and detail representations share field meaning but may use different `RSP-*` models.
5. A summary is an explicit aggregate read model and includes its population, filters, calculation version, and freshness where applicable.
6. Resource IDs are opaque strings. Exposing a local ID does not make it a canonical FleetOS identity.
7. Unversioned `/api/...` paths are legacy implementation evidence and are not aliases of `/api/v1`.

## Resource catalog

| ID | Resource | Authority | Maturity | Notes |
| --- | --- | --- | --- | --- |
| `RES-001` | Service health | PM Assistant runtime/read boundary | Core proposed v1 | Coarse liveness and readiness only. |
| `RES-002` | Vehicle | PM Assistant-published representation; enterprise master owner unresolved | Core proposed v1 | `vehicle_no` is transitional; canonical ID is not implemented. |
| `RES-003` | PM plan | PM Assistant | Core proposed v1 | Authoritative plan projection with separate status domains. |
| `RES-004` | PM history event | PM Assistant | Core proposed v1 | Safe event projection, not raw legacy JSON. |
| `RES-005` | Location | Transitional PM Assistant location master; enterprise owner unresolved | Core proposed v1 | Stable shared identity and safe address exposure are unresolved. |
| `RES-006` | Dashboard summary | PM Assistant for maintenance values; AutoPM for presentation | Core proposed v1 | KPI definitions and counted population require approval. |
| `RES-007` | Mileage-status summary | PM Assistant after mileage ownership and rule approval | Gated proposed v1 | Must not publish current browser thresholds as authoritative. |
| `RES-008` | Synchronization run | PM Assistant controlled synchronization audit | Core proposed v1 | Safe run-level metadata only. |
| `RES-009` | Notification-status summary | PM Assistant | Directional candidate | Aggregate status only; targets and content excluded. |
| `RES-010` | Import batch | PM Assistant controlled import audit | Directional candidate | Safe batch visibility; raw rows excluded. |
| `RES-011` | Audit event | PM Assistant | Directional candidate | Restricted projection subject to privacy, access, and retention decisions. |

## Endpoint summary

| ID | Method and path | Resource | Request | Response | Maturity |
| --- | --- | --- | --- | --- | --- |
| `EP-001` | `GET /api/v1/health/live` | `RES-001` | None | `RSP-001` | Core proposed v1 |
| `EP-002` | `GET /api/v1/health/ready` | `RES-001` | None | `RSP-002` | Core proposed v1 |
| `EP-003` | `GET /api/v1/vehicles/lookup` | `RES-002` | `REQ-001` | `RSP-003` | Core proposed v1 |
| `EP-004` | `GET /api/v1/vehicles` | `RES-002` | `REQ-002` | `RSP-004` | Core proposed v1 |
| `EP-005` | `GET /api/v1/pm-plans` | `RES-003` | `REQ-003` | `RSP-005` | Core proposed v1 |
| `EP-006` | `GET /api/v1/pm-plans/{pm_plan_id}` | `RES-003` | `REQ-004` | `RSP-006` | Core proposed v1 |
| `EP-007` | `GET /api/v1/pm-plans/{pm_plan_id}/history` | `RES-004` | `REQ-005` | `RSP-007` | Core proposed v1 |
| `EP-008` | `GET /api/v1/locations` | `RES-005` | `REQ-006` | `RSP-008` | Core proposed v1 |
| `EP-009` | `GET /api/v1/dashboard/summary` | `RES-006` | `REQ-007` | `RSP-009` | Core proposed v1 |
| `EP-010` | `GET /api/v1/pm-mileage-status/summary` | `RES-007` | `REQ-008` | `RSP-010` | Gated proposed v1 |
| `EP-011` | `GET /api/v1/synchronization` | `RES-008` | `REQ-009` | `RSP-011` | Core proposed v1 |
| `EP-012` | `GET /api/v1/notification-status/summary` | `RES-009` | `REQ-010` | `RSP-012` | Directional candidate |
| `EP-013` | `GET /api/v1/import-batches` | `RES-010` | `REQ-011` | `RSP-013` | Directional candidate |
| `EP-014` | `GET /api/v1/audit-events` | `RES-011` | `REQ-012` | `RSP-014` | Directional candidate |

## Endpoint specifications

### `EP-001` — Liveness

- Purpose: report whether the API process can run, without testing business dependencies.
- Parameters: none.
- Success: `RSP-001`.
- Errors: `ERR-016` only when a response can still be produced safely.
- Authorization: minimal unauthenticated exposure is proposed but unresolved by `DEC-009`.
- Cache: `Cache-Control: no-store`.
- Observability: count probe result and latency without logging callers' credentials or query data.

### `EP-002` — Readiness

- Purpose: report whether essential authoritative read dependencies can serve approved read models.
- Parameters: none.
- Success: `RSP-002` with coarse dependency states.
- Errors: `ERR-016`, `ERR-017`, or `ERR-018` as applicable.
- Authorization: unresolved by `DEC-009`.
- Cache: `Cache-Control: no-store`.
- Disclosure: never expose database engine, DSN, host, schema, file path, credentials, or provider topology.
- Gate: the essential dependency set is `DEC-015`.

### `EP-003` — Vehicle lookup

- Purpose: perform a transitional exact or approved-normalized lookup by `vehicle_no`.
- Request: `REQ-001` requires `vehicle_no`; optional normalization version is allowed only after `DEC-002`.
- Success: singular `RSP-003`.
- Errors: `ERR-001`, `ERR-009`, `ERR-012`, `ERR-013`.
- Identity: never auto-select among multiple candidates; never substitute registration or vehicle code implicitly.
- Cache: proposed private cache up to 60 seconds with `ETag`; final policy is `DEC-011`.

### `EP-004` — Vehicle list

- Purpose: list vehicle representations approved for AutoPM presentation and filtering.
- Request: `REQ-002` with allowlisted filters and cursor pagination.
- Success: `RSP-004`; a valid no-match query returns `data: []`.
- Errors: `ERR-001` through `ERR-004`, `ERR-012`, `ERR-013` where the query identifies an ambiguous transitional match.
- Sorts: `vehicle_no`, `updated_at`; default `vehicle_no,vehicle_id`.
- Cache: proposed private 30–60 seconds with `ETag`; final policy is `DEC-011`.
- Gate: approved vehicle attributes and unresolved identities are `DEC-001` and `DEC-002`.

### `EP-005` — PM plan list

- Purpose: publish the authoritative PM plan list projection.
- Request: `REQ-003` with identity, status, location, date-range, update, pagination, and sort inputs.
- Success: `RSP-005`; no matches return an empty list.
- Errors: `ERR-001` through `ERR-005`, `ERR-012`, `ERR-013`.
- Sorts: `planned_date`, `deadline_date`, `updated_at`, `pm_plan_id`; default `planned_date,pm_plan_id`.
- Status: all four domains are separately named; a generic `status` field is prohibited.
- Cache: proposed private 15–30 seconds with `ETag`; final policy is `DEC-011`.

### `EP-006` — PM plan detail

- Purpose: retrieve one authoritative plan projection.
- Request: `REQ-004` with opaque path `pm_plan_id` and allowlisted optional expansions.
- Success: `RSP-006`.
- Errors: `ERR-001`, `ERR-010` and authorization errors when implemented.
- Expansion direction: `latest_notification` and `sync_metadata` remain optional and gated by safe exposure.
- Cache: proposed private up to 15 seconds with `ETag`.
- Gate: deleted-plan tombstones and safe task-state fields are `DEC-018` and `DEC-012`.

### `EP-007` — PM history

- Purpose: publish safe auditable events for one plan.
- Request: `REQ-005` with action, time-range, cursor, and sort inputs.
- Success: `RSP-007`; an existing plan without events returns an empty list.
- Errors: `ERR-001` through `ERR-005`, `ERR-010`.
- Sorts: `occurred_at`, `history_event_id`; default ascending `occurred_at,history_event_id`.
- Projection: safe actor reference, note when authorized, status changes, correlation, batch reference, and redacted summaries; never raw legacy snapshots.
- Gate: actor visibility, retention, and redaction are `DEC-012` and `DEC-013`.

### `EP-008` — Location list

- Purpose: publish approved location representations used by PM plans and filters.
- Request: `REQ-006` with name, province, district, service type, update, cursor, and sort inputs.
- Success: `RSP-008`; no matches return an empty list.
- Errors: `ERR-001` through `ERR-004`.
- Sorts: `name`, `province`, `updated_at`; default `name,location_id`.
- Cache: proposed private up to five minutes with `ETag`.
- Gate: stable identity, ownership, aliases, address, and note exposure are `DEC-003` and `DEC-012`.

### `EP-009` — Dashboard summary

- Purpose: provide authoritative maintenance counts while AutoPM retains visualization ownership.
- Request: `REQ-007` with `as_of` and approved grouping filters.
- Success: `RSP-009`; a valid empty population returns explicit zero counts.
- Errors: `ERR-001`, `ERR-002`, `ERR-005`, `ERR-018`.
- Cache: proposed private 30–60 seconds, keyed by all filters and calculation version, with `ETag`.
- Gate: metric definitions, population, and grouping semantics are `DEC-006`.

### `EP-010` — Mileage-status summary

- Purpose: aggregate the distinct `pm_mileage_status` domain.
- Request: `REQ-008` with `as_of`, grouping, measurement freshness, and rule version filters.
- Success: `RSP-010` only when authoritative accepted inputs and an approved rule are available.
- Errors: `ERR-001`, `ERR-002`, `ERR-005`, `ERR-018`.
- Empty behavior: zeroes represent only a valid empty authoritative population; unavailable input returns `ERR-018`.
- Cache: proposed private 30–60 seconds keyed by all filters and rule version.
- Gates: `DEC-004` and `DEC-005`.

### `EP-011` — Synchronization list

- Purpose: publish safe run-level synchronization, reconciliation, and freshness evidence.
- Request: `REQ-009` with domain, status, start time range, cursor, and sort inputs.
- Success: `RSP-011`; no runs return an empty list and `last_success_at: null` in applicable summary metadata.
- Errors: `ERR-001` through `ERR-005`.
- Sorts: `started_at`, `completed_at`, `sync_run_id`; default newest first with `-started_at,sync_run_id`.
- Cache: `no-store` or at most 15 seconds; final policy is `DEC-011`.
- Projection: counts, versions, safe timing, stale state, correlation, replay disposition, and redacted error summary.

### `EP-012` — Notification-status summary

- Purpose: provide aggregate `notification_status` visibility without exposing message or recipient data.
- Request: `REQ-010` with time range, status, channel class when approved, and grouping filters.
- Success: `RSP-012`.
- Errors: `ERR-001`, `ERR-002`, `ERR-005`, `ERR-018`.
- Cache: proposed private up to 30 seconds.
- Exclusions: target IDs, display names, message content, provider payloads/responses, tokens, and credentials.
- Maturity: directional candidate requiring `DEC-008`, `DEC-012`, and a separately approved expansion of the proposed API contract.

### `EP-013` — Import-batch list

- Purpose: provide safe batch-level import visibility and partial-outcome evidence.
- Request: `REQ-011` with import type, status, received time range, cursor, and sort inputs.
- Success: `RSP-013`.
- Errors: `ERR-001` through `ERR-005`.
- Sorts: `received_at`, `completed_at`, `import_batch_id`; default newest first.
- Exclusions: raw rows, unrestricted filenames or paths, uploaded content, credentials, and unredacted row values.
- Maturity: directional candidate requiring `DEC-007`, `DEC-012`, `DEC-013`, and contract expansion approval.

### `EP-014` — Audit-event list

- Purpose: provide a restricted, redacted operational/domain audit projection when an approved review use case exists.
- Request: `REQ-012` with domain, event type, safe resource reference, actor type, time range, correlation, cursor, and sort inputs.
- Success: `RSP-014`.
- Errors: `ERR-001` through `ERR-005` plus authorization errors when implemented.
- Sorts: `occurred_at`, `audit_event_id`; default newest first.
- Exclusions: secrets, raw authentication material, raw webhooks, notification targets, unnecessary personal data, SQL, paths, and unrestricted before/after records.
- Maturity: directional candidate requiring `DEC-009`, `DEC-012`, `DEC-013`, and contract expansion approval.

## Current-to-target evidence map

| Current evidence | Target interpretation |
| --- | --- |
| `/api/system/health` | Evidence only; split into minimal `EP-001` and `EP-002`. |
| `/api/vehicles` and `/api/cars` | Inputs to analyze for `RES-002`; neither current shape is the v1 contract. |
| `/api/plans` and plan CRUD routes | Evidence for `RES-003`; only proposed read endpoints enter v1. |
| `/api/plans/{plan_id}/history` | Evidence for `RES-004`; raw ORM/history strings are not public fields. |
| `/api/locations` plus location CRUD | Evidence for `RES-005`; only the safe list projection enters v1. |
| `/api/summary` | Evidence for `RES-006`; current calculations are not automatically approved KPI definitions. |
| AutoPM browser mileage calculation | Evidence for `RES-007`; thresholds remain unapproved. |
| `/api/import-logs` | Partial evidence for `RES-008` and `RES-010`; current schema is not the public contract. |
| `/api/notification-logs` | Partial evidence for `RES-009`; current messages, targets, and responses are excluded. |
| History, file logs, webhook records | Partial evidence for `RES-011`; no unified audit API is currently approved. |
