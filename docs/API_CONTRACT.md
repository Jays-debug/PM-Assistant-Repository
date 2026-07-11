# FleetOS API Contract

## Status

- Status: Proposed
- Version: `v1`
- Scope: Phase 3.3 read-only integration from AutoPM to PM Assistant
- Decision owner: FleetOS Product Owner

This document specifies a proposed contract. It does not claim that authentication, PostgreSQL, Railway, or a production API is operational.

## Boundary and ownership

PM Assistant is authoritative for PM plans, `pm_workflow_status`, `completion_status`, PM history, `notification_status`, and controlled import and synchronization audit. AutoPM is a read-only consumer of approved maintenance information and remains responsible for dashboard presentation and KPI visualization.

Direct shared-database access and AutoPM writes to PM Assistant persistence are prohibited. The contract publishes read models rather than database tables or ORM objects.

`vehicle_no` is a transitional matching key only. `fleetos_vehicle_id` is reserved as a proposed future canonical identifier and does not currently exist.

## Base path and media type

- Base path: `/api/v1`
- Success and error media type: `application/json`
- Field and query parameter convention: `snake_case`
- Resource paths: lowercase plural kebab-case
- Resource identifiers: opaque strings at the API boundary

## Common success envelope

```json
{
  "data": {},
  "meta": {
    "api_version": "v1",
    "generated_at": "2026-07-12T08:15:30Z",
    "correlation_id": "01J00000000000000000000000",
    "source": "pm_assistant",
    "freshness": {
      "as_of": "2026-07-12T08:15:00Z",
      "is_stale": false
    }
  }
}
```

`data` is an object for detail and summary endpoints and an array for list endpoints. Paginated responses add this member to `meta`:

```json
{
  "pagination": {
    "page_size": 50,
    "next_cursor": null
  }
}
```

`correlation_id` is returned in `meta` and the `X-Correlation-ID` response header. A valid inbound `X-Correlation-ID` may be propagated; otherwise the service generates one. It is diagnostic only and is not authentication or idempotency evidence.

## Representation rules

### Dates and times

- Dates use ISO 8601 `YYYY-MM-DD`.
- Datetimes use RFC 3339 with an explicit offset; UTC `Z` is preferred.
- `as_of` identifies the represented data state; `generated_at` identifies response generation.
- The API must not infer a timezone from naive stored values.
- Buddhist Era and Gregorian source dates must be distinguished during ingestion. Ambiguous dates are rejected rather than guessed.

### Null and missing fields

- A defined v1 field remains present in its standard representation.
- `null` means the concept applies but its value is unknown or unavailable.
- Fields are omitted only when they are documented optional expansions or are not authorized for the caller.
- Collections use `[]`, not `null`.
- The API never fabricates `fleetos_vehicle_id`; until implemented it is `null` where included.
- Missing authoritative data is an explicit availability state or error, not a guessed value.

### Pagination, filtering, and sorting

- List endpoints use opaque cursor pagination.
- Default `page_size` is 50 and maximum is 200.
- A cursor is bound to its filters, sort, and snapshot semantics.
- Sorting uses `sort=field,-other_field` and an identifier tie-breaker.
- Unsupported filters or sort fields return `400`; they are not silently ignored.
- Valid list queries with no matches return `200` with `data: []` and `next_cursor: null`.

## Identity model

| Field | Meaning |
|---|---|
| `vehicle_id` | Opaque PM Assistant-local resource identifier; not an enterprise identity. |
| `vehicle_no` | Transitional comparison and display key only. |
| `fleetos_vehicle_id` | Proposed future canonical identifier; not implemented. |
| `pm_plan_id` | Opaque PM Assistant-local plan identifier pending an external identity decision. |
| `location_id` | Opaque PM Assistant-local identifier; not yet a shared FleetOS identity. |

Registration and vehicle code are attributes or aliases in distinct namespaces and must not be substituted implicitly for `vehicle_no`. Ambiguous or conflicting matches are not automatically selected or merged.

## Status model

The following concepts are independent and must never overwrite or infer one another:

| Field | Proposed v1 values | Notes |
|---|---|---|
| `pm_mileage_status` | `overdue`, `call_in`, `prepare`, `ok`, `unknown` | Requires an approved mileage rule and rule version. |
| `pm_workflow_status` | `planned`, `in_progress`, `completed`, `cancelled` | Recommended workflow vocabulary. Whether legacy `Overdue` becomes a separate schedule condition remains a decision. |
| `completion_status` | `not_completed`, `completed`, `reopened`, `unknown` | Evidence and reopen rules require approval before implementation. |
| `notification_status` | `pending`, `success`, `failed`, `skipped`, `unknown` | `pending` applies only if notification intent is modeled. |

Current AutoPM mileage evidence maps provisionally as follows: `เกินระยะPM` to `overdue`, `ติดตามเรียกเข้า PM` to `call_in`, `เตรียมPM` to `prepare`, and `OK` to `ok`. Current thresholds are not approved merely by documenting them. Any published calculation includes `rule_version`, `calculated_at`, input freshness, and source.

## Endpoints

### Liveness

`GET /api/v1/health/live`

- Purpose: report process liveness only.
- Authority: PM Assistant service runtime.
- Parameters, pagination, filtering, sorting: none.
- Response fields: `status`, `service`, `api_version`, `checked_at`.
- Empty behavior: not applicable.
- Errors: `503 SERVICE_UNAVAILABLE` only when the process cannot safely serve the probe.
- Authorization: a minimal unauthenticated probe is proposed; approval is pending.
- Caching: `Cache-Control: no-store`.
- Unresolved: exposure and infrastructure probe requirements.

### Readiness

`GET /api/v1/health/ready`

- Purpose: report whether the authoritative read boundary can serve requests.
- Authority: PM Assistant runtime and essential read dependencies.
- Parameters, pagination, filtering, sorting: none.
- Response fields: `status`, `service`, `api_version`, `checked_at`, and coarse dependency states such as `maintenance_store: ready|unavailable`.
- Empty behavior: not applicable.
- Errors: `503 SERVICE_NOT_READY` or `DEPENDENCY_UNAVAILABLE`.
- Authorization: unresolved.
- Caching: `Cache-Control: no-store`.
- Unresolved: essential dependency set. Database engine, host, DSN, schema, and credentials must not be disclosed.

### Vehicle lookup

`GET /api/v1/vehicles/lookup?vehicle_no={value}`

- Purpose: transitional exact or approved-normalized vehicle lookup.
- Authority: PM Assistant-published vehicle representation; enterprise Vehicle Master ownership remains unresolved.
- Query: required `vehicle_no`; optional `normalization_rule_version`.
- Fields: `vehicle_id`, `fleetos_vehicle_id`, `vehicle_no`, approved vehicle code/model/type/fleet attributes, `match_classification`, `normalization_rule_version`, `source`, `updated_at`.
- Pagination, filtering, sorting: none beyond the lookup query.
- Empty behavior: `404 VEHICLE_NOT_FOUND`.
- Errors: `400 INVALID_REQUEST`, `404 VEHICLE_NOT_FOUND`, `409 IDENTITY_AMBIGUOUS` or `IDENTITY_CONFLICT`.
- Authorization: future read-only scope.
- Caching: private cache up to 60 seconds with `ETag`.
- Unresolved: normalization rules and approved attributes.

### Vehicle list

`GET /api/v1/vehicles`

- Purpose: list vehicle representations available to AutoPM.
- Authority: PM Assistant-published representation; enterprise master ownership remains unresolved.
- Filters: `vehicle_no`, `fleet`, `transport_type`, `vehicle_type`, `updated_since`.
- Sorts: `vehicle_no`, `updated_at`.
- Fields: lookup fields plus record freshness.
- Pagination: cursor pagination.
- Empty behavior: empty list.
- Errors: invalid cursor/filter/sort; identity exceptions are never silently merged.
- Authorization: future read-only scope.
- Caching: 30–60 seconds with `ETag`.
- Unresolved: grouping semantics and treatment of unresolved identities.

### PM plan list

`GET /api/v1/pm-plans`

- Purpose: publish the authoritative PM plan read model.
- Authority: PM Assistant.
- Filters: `vehicle_id`, transitional `vehicle_no`, `pm_workflow_status`, `completion_status`, `location_id`, `planned_from`, `planned_to`, `deadline_from`, `deadline_to`, `updated_since`.
- Sorts: `planned_date`, `deadline_date`, `updated_at`, `pm_plan_id`.
- Fields: `pm_plan_id`, vehicle reference, title, description when authorized, planned/deadline/actual dates, location reference and snapshot, all four separately named statuses, `created_at`, `updated_at`, source and freshness.
- Pagination: cursor pagination.
- Empty behavior: empty list.
- Errors: invalid dates/status/cursor/sort and ambiguous transitional identity.
- Authorization: future maintenance-read scope.
- Caching: 15–30 seconds with `ETag`.
- Unresolved: external plan identity, description exposure, and status vocabulary.

### PM plan detail

`GET /api/v1/pm-plans/{pm_plan_id}`

- Purpose: retrieve one authoritative plan representation.
- Authority: PM Assistant.
- Path: opaque `pm_plan_id`.
- Query: optional `include=latest_notification,sync_metadata`.
- Fields: plan-list fields plus approved task-state summary, calculation details, status timestamps, and history references.
- Pagination, filtering, sorting: none.
- Empty behavior: missing plan returns `404 PM_PLAN_NOT_FOUND`.
- Authorization: future maintenance-read scope.
- Caching: private cache up to 15 seconds with `ETag`.
- Unresolved: deleted-plan tombstones and safe task-state fields.

### PM history

`GET /api/v1/pm-plans/{pm_plan_id}/history`

- Purpose: publish auditable events associated with a plan.
- Authority: PM Assistant.
- Filters: `action`, `occurred_from`, `occurred_to`.
- Sorts: `occurred_at`, `history_event_id`; default ascending.
- Fields: `history_event_id`, `pm_plan_id`, `action`, `occurred_at`, safe actor representation, note, status changes, `correlation_id`, `import_batch_id`, and redacted before/after summaries.
- Pagination: cursor pagination.
- Empty behavior: an existing plan with no events returns an empty list; an unknown plan returns `404`.
- Authorization: potentially narrower history-read scope.
- Caching: 30–60 seconds for older pages; shorter for the newest page.
- Unresolved: retention, privacy, actor visibility, and safe projection of legacy JSON snapshots.

### Locations

`GET /api/v1/locations`

- Purpose: publish approved location representations used by plans and filters.
- Authority: transitional PM Assistant location master; enterprise ownership unresolved.
- Filters: `name`, `province`, `district`, `service_type`, `updated_since`.
- Sorts: `name`, `province`, `updated_at`.
- Fields: `location_id`, name and approved attributes, `identity_status`, `created_at`, `updated_at`.
- Pagination: cursor pagination.
- Empty behavior: empty list.
- Authorization: future maintenance-read scope.
- Caching: up to five minutes with `ETag`.
- Unresolved: stable FleetOS location identity, aliases, renames, and address/note exposure.

### Dashboard summary

`GET /api/v1/dashboard/summary`

- Purpose: provide authoritative counts without transferring visualization ownership from AutoPM.
- Authority: PM Assistant for maintenance values; AutoPM owns presentation.
- Filters: `as_of`, `fleet`, `transport_type`, `vehicle_type`, `location_id`.
- Fields: `as_of`, `generated_at`, `vehicle_count`, independent workflow/completion counts, optional mileage/notification summaries, filter echo, source freshness, and calculation versions.
- Pagination and sorting: none.
- Empty behavior: `200` with zero counts.
- Authorization: future maintenance-read scope.
- Caching: 30–60 seconds, keyed by all filters, with `ETag`.
- Unresolved: KPI definitions and counted population.

### Mileage status summary

`GET /api/v1/pm-mileage-status/summary`

- Purpose: aggregate the distinct mileage-status domain.
- Authority: PM Assistant only after accepted mileage ingestion and rule approval.
- Filters: `as_of`, `fleet`, `vehicle_type`, `measurement_freshness`, `rule_version`.
- Fields: counts by canonical status, `total`, `unknown_count`, `rule_version`, `calculated_at`, `latest_measurement_at`, and source freshness.
- Pagination and sorting: none.
- Empty behavior: zero counts only for a valid empty dataset. If authoritative mileage input is unavailable, return `503 READ_MODEL_UNAVAILABLE`.
- Authorization: future maintenance-read scope.
- Caching: 30–60 seconds, keyed by filters and rule version.
- Unresolved: thresholds, boundary behavior, odometer ownership, resets, corrections, and stale-measurement policy.

### Synchronization metadata

`GET /api/v1/synchronization`

- Purpose: publish safe controlled-import and reconciliation freshness metadata.
- Authority: PM Assistant synchronization audit.
- Filters: `domain`, `status`, `started_from`, `started_to`.
- Sorts: `started_at`, `completed_at`, `sync_run_id`; default newest first.
- Fields: `sync_run_id`, `domain`, `source_type`, `status`, received/accepted/rejected/ambiguous counts, contract and rule versions, `started_at`, `completed_at`, `last_success_at`, `is_stale`, `correlation_id`, and safe error summary.
- Pagination: cursor pagination.
- Empty behavior: empty list and `last_success_at: null`.
- Authorization: future synchronization-read scope.
- Caching: `no-store` or at most 15 seconds.
- Unresolved: staleness thresholds, retention, import atomicity, and safe diagnostic detail.

## Authorization assumptions

No authentication or authorization control is claimed to be operational. The target direction is least-privilege service authentication with a read-only scope such as `fleetos.maintenance.read`, and narrower history or synchronization scopes if required. Anonymous production access is not approved.

The browser-to-API versus trusted AutoPM proxy topology, credential rotation, allowed origins, TLS boundary, and row/field authorization remain Product Owner decisions. Current development CORS behavior is not a production contract.

## Caching, timeout, and retry direction

- Support `ETag` and `If-None-Match`.
- Do not place authorization-sensitive responses in shared caches unless explicitly designed.
- AutoPM may display a clearly labeled last-known-good cache; it never becomes a synchronization source.
- Proposed connection timeout: 2 seconds.
- Proposed overall timeout: 5 seconds for detail/summary and up to 10 seconds for large lists.
- Retry connection failures and `429`, `502`, `503`, or `504` at most twice with exponential backoff and jitter.
- Honor `Retry-After`; do not retry `400`, `401`, `403`, `404`, or `409`.

All Phase 3.3 operations are `GET`, safe, and idempotent. An `Idempotency-Key` is not required. Future commands require a separately approved write contract.

## Rate-limit direction

Rate limiting should be applied per authenticated client when authentication exists, with separate handling for probes and business reads. A starting point of 120 requests per minute per AutoPM client with a burst of 30 is proposed for load testing. Exceeded limits return `429 RATE_LIMITED` and `Retry-After`. No current rate limiter is claimed.

## Versioning and compatibility

- The major version is in the path.
- Adding endpoints, optional fields, optional filters, or error metadata is normally compatible.
- Removing or renaming fields; changing type, nullability, identity meaning, enum semantics, or default sorting; or changing status ownership is breaking and requires `/api/v2`.
- Enum evolution must be documented. Consumers must preserve domain separation and safely render an unknown future value.
- Existing unversioned `/api/...` routes are not automatically v1-compatible.
- V1 uses dedicated response models and must not expose ORM entities directly.

Deprecation requires documentation, replacement guidance, response deprecation metadata, an approved sunset date, and a consumer migration window. A minimum 90-day window is proposed but not approved. V1 must not be retired while an approved AutoPM deployment depends on it without tested fallback and rollback evidence.

## Rollback considerations

A future rollout must be switchable through an approved consumer feature flag or configuration. AutoPM retains a labeled last-known-good path until cutover acceptance. Disabling the consumer path must not change PM Assistant authority or reverse-synchronize cached values. Issued identifiers, raw audit records, mapping versions, and history remain retained. Calculation or mapping versions are rolled back without rewriting source evidence.

## Unresolved Product Owner decisions

- Enterprise Vehicle Master and location ownership.
- `fleetos_vehicle_id` representation, generation, merge/split, and retirement.
- `vehicle_no` normalization and ambiguity policy.
- Workflow, completion, notification, and mileage vocabularies and rules.
- Odometer ownership, resets, corrections, and freshness.
- KPI definitions and summary population.
- Authentication topology, scopes, CORS, TLS, and rate limits.
- Sensitive-field exposure and audit retention.
- Cursor and cache limits, deletion/tombstone behavior, and deprecation window.

