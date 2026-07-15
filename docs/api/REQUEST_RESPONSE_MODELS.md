# FleetOS Request and Response Models

## Purpose and model boundary

This document defines proposed public read models. They are logical contracts, not Pydantic classes, ORM entities, table specifications, or proof of implementation.

All endpoints are `GET`. Request models describe path and query parameters; v1 has no command body. Response models are purpose-built and must be populated only from authoritative or explicitly labeled transitional information.

## Common representation rules

### Success envelope

```json
{
  "data": {},
  "meta": {
    "api_version": "v1",
    "generated_at": "2026-07-16T08:15:30Z",
    "correlation_id": "01J00000000000000000000000",
    "source": "pm_assistant",
    "freshness": {
      "as_of": "2026-07-16T08:15:00Z",
      "is_stale": false,
      "stale_reason": null
    }
  }
}
```

Lists use an array in `data` and add:

```json
{
  "pagination": {
    "page_size": 50,
    "next_cursor": null
  }
}
```

### Required metadata semantics

| Field | Type | Meaning |
| --- | --- | --- |
| `api_version` | string | Contract major version, always `v1` for this namespace. |
| `generated_at` | RFC 3339 datetime | Response generation instant. |
| `correlation_id` | string | Diagnostic request correlation; not identity, authorization, ordering, or idempotency proof. |
| `source` | string | Safe logical source such as `pm_assistant`; never a host, DSN, path, or credential. |
| `freshness.as_of` | RFC 3339 datetime or `null` | Newest authoritative state represented. |
| `freshness.is_stale` | boolean | Result of the approved staleness policy. |
| `freshness.stale_reason` | string or `null` | Safe allowlisted reason; rules remain `DEC-010`. |

Endpoint-specific metadata may add calculation, contract, normalization, mapping, or projection versions. Versions identify behavior; they must not expose build secrets or internal topology.

### Null, omission, and collections

- A defined v1 field remains present in its standard representation.
- `null` means the concept applies but the value is unknown or unavailable.
- Omission is reserved for documented optional expansions or authorization-controlled fields.
- Collections use `[]`, not `null`.
- `fleetos_vehicle_id` is `null` until implemented under a separately approved identity design.
- Missing authoritative data is represented explicitly or by an error; it is never guessed.

## Request models

Shared list inputs are `page_size`, `cursor`, and `sort` where listed. Default `page_size` is 50 and maximum is 200. All filters are allowlisted; an unlisted parameter is invalid.

### `REQ-001` — Vehicle lookup query

| Parameter | Type | Required | Rule |
| --- | --- | --- | --- |
| `vehicle_no` | string | Yes | Preserve original Unicode; compare only with the approved normalization rule. |
| `normalization_rule_version` | string | No | Accepted only after `DEC-002`; unsupported versions fail explicitly. |

### `REQ-002` — Vehicle list query

Filters: `vehicle_no`, `fleet`, `transport_type`, `vehicle_type`, `updated_since`. Sort allowlist: `vehicle_no`, `updated_at`. Includes shared list inputs.

### `REQ-003` — PM plan list query

Filters: `vehicle_id`, transitional `vehicle_no`, `pm_workflow_status`, `completion_status`, `location_id`, `planned_from`, `planned_to`, `deadline_from`, `deadline_to`, `updated_since`. Sort allowlist: `planned_date`, `deadline_date`, `updated_at`, `pm_plan_id`. Includes shared list inputs.

Status filters accept only the independently defined domain vocabulary. A generic `status` filter is prohibited.

### `REQ-004` — PM plan detail request

| Input | Type | Required | Rule |
| --- | --- | --- | --- |
| `pm_plan_id` | opaque string path value | Yes | PM Assistant-local resource reference; not an enterprise identifier. |
| `include` | comma-separated allowlist | No | Candidate values: `latest_notification`, `sync_metadata`; safe exposure remains gated. |

### `REQ-005` — PM history list query

Path: required opaque `pm_plan_id`. Filters: `action`, `occurred_from`, `occurred_to`. Sort allowlist: `occurred_at`, `history_event_id`. Includes shared list inputs.

### `REQ-006` — Location list query

Filters: `name`, `province`, `district`, `service_type`, `updated_since`. Sort allowlist: `name`, `province`, `updated_at`. Includes shared list inputs.

### `REQ-007` — Dashboard summary query

Filters: `as_of`, `fleet`, `transport_type`, `vehicle_type`, `location_id`. Pagination and sorting do not apply. `as_of` cannot request a historical view unless the provider can reproduce that snapshot under an approved rule.

### `REQ-008` — Mileage-status summary query

Filters: `as_of`, `fleet`, `vehicle_type`, `measurement_freshness`, `rule_version`. Pagination and sorting do not apply. `measurement_freshness` is an allowlisted category, not a free-form duration.

### `REQ-009` — Synchronization list query

Filters: `domain`, `status`, `started_from`, `started_to`. Sort allowlist: `started_at`, `completed_at`, `sync_run_id`. Includes shared list inputs.

### `REQ-010` — Notification-status summary query

Filters: `occurred_from`, `occurred_to`, `notification_status`, optional approved `channel`, `fleet`, and `location_id`. Pagination and sorting do not apply. This request is directional and gated by `DEC-008` and `DEC-012`.

### `REQ-011` — Import-batch list query

Filters: `import_type`, `status`, `received_from`, `received_to`, `replay_disposition`. Sort allowlist: `received_at`, `completed_at`, `import_batch_id`. Includes shared list inputs. This request is gated by `DEC-007`, `DEC-012`, and `DEC-013`.

### `REQ-012` — Audit-event list query

Filters: `domain`, `event_type`, `resource_type`, safe opaque `resource_id`, `actor_type`, `occurred_from`, `occurred_to`, `correlation_id`. Sort allowlist: `occurred_at`, `audit_event_id`. Includes shared list inputs. Free-text search and raw before/after filtering are excluded from v1.

## Shared public components

### Vehicle reference

| Field | Type | Meaning |
| --- | --- | --- |
| `vehicle_id` | opaque string | PM Assistant-local API resource ID. |
| `fleetos_vehicle_id` | opaque string or `null` | Proposed future canonical identity; unimplemented. |
| `vehicle_no` | string | Original approved display value and transitional match key. |
| `vehicle_code` | string or `null` | Distinct attribute/alias namespace. |

### Location reference

| Field | Type | Meaning |
| --- | --- | --- |
| `location_id` | opaque string | PM Assistant-local location resource ID. |
| `name` | string | Approved current display name. |
| `name_snapshot` | string or `null` | Historical plan-time display value where required. |

### Four-status component

| Field | Candidate values | Rule |
| --- | --- | --- |
| `pm_mileage_status` | `overdue`, `call_in`, `prepare`, `ok`, `unknown` | Requires `DEC-004` and `DEC-005`; current labels/thresholds remain evidence only. |
| `pm_workflow_status` | `planned`, `in_progress`, `completed`, `cancelled` | Recommended vocabulary pending `DEC-005`; schedule condition must not be folded into it. |
| `completion_status` | `not_completed`, `completed`, `reopened`, `unknown` | Requires approved evidence, correction, and reopen behavior. |
| `notification_status` | `pending`, `success`, `failed`, `skipped`, `unknown` | `pending` applies only if notification intent is implemented. |

The four fields never overwrite or imply one another. A client must safely display an unknown future value without mapping it to another status domain.

## Response models

### `RSP-001` — Liveness response

Object fields: `status` (`live`), `service` (`pm_assistant`), `api_version`, and `checked_at`. This response may use a minimal envelope or the common envelope as finalized by `DEC-009`; it never reports dependency details.

### `RSP-002` — Readiness response

Object fields: `status` (`ready` or `not_ready`), `service`, `api_version`, `checked_at`, and an allowlisted `dependencies` object whose values are only `ready` or `unavailable`. Names are logical capabilities such as `maintenance_read_store`, not vendor or topology names.

### `RSP-003` — Vehicle lookup response

Object fields:

- vehicle reference fields;
- `transport_type`, `vehicle_model`, `fleet`, `vehicle_type` as approved nullable attributes;
- `match_classification` and `normalization_rule_version`;
- safe `source`, `created_at`, and `updated_at` representation where approved.

No match returns `ERR-009`; multiple or conflicting matches return `ERR-012` or `ERR-013`.

### `RSP-004` — Vehicle list response

Array of the approved `RSP-003` vehicle data shape plus record freshness, wrapped with list pagination metadata. Identity exceptions are not silently merged into a vehicle.

### `RSP-005` — PM plan list response

Each array item contains:

- `pm_plan_id` and vehicle reference;
- `title` and authorized nullable `description`;
- `planned_date`, `deadline_date`, nullable `actual_date`;
- location reference and historical snapshot where applicable;
- all four separately named status fields;
- optional safe schedule-condition representation after `DEC-005`;
- `created_at`, `updated_at`, source, and record freshness;
- calculation/rule versions for derived fields.

### `RSP-006` — PM plan detail response

Contains the `RSP-005` item plus approved:

- task-state summary;
- status transition timestamps;
- mileage calculation inputs by safe reference, not raw private records;
- history link/reference;
- optional latest notification aggregate and synchronization metadata expansions.

Deleted-plan tombstone behavior is unresolved by `DEC-018`. Raw ORM relations and raw JSON history are prohibited.

### `RSP-007` — PM history list response

Each event contains `history_event_id`, `pm_plan_id`, `action`, `occurred_at`, safe actor representation, authorized nullable `note`, structured status changes, `correlation_id`, nullable `import_batch_id`, and redacted before/after summaries. Actor privacy and retention are controlled by `DEC-012` and `DEC-013`.

### `RSP-008` — Location list response

Each item contains `location_id`, `name`, approved nullable `province`, `district`, and `service_type`, `identity_status`, `created_at`, and `updated_at`. Address and notes are excluded unless `DEC-012` explicitly permits them.

### `RSP-009` — Dashboard summary response

Object fields:

- `as_of` and `population_definition` or approved version reference;
- `vehicle_count` and `pm_plan_count` where defined;
- `pm_workflow_status_counts` and `completion_status_counts` as independent maps;
- optional `pm_mileage_status_counts` and `notification_status_counts` only when their source gates pass;
- `filters` echo using canonical safe values;
- calculation versions and freshness.

All canonical status keys appear with integer zero when the population is valid but empty. Definitions remain `DEC-006`.

### `RSP-010` — Mileage-status summary response

Object fields: `as_of`, counts by canonical `pm_mileage_status`, `total`, `unknown_count`, `rule_version`, `calculated_at`, `latest_measurement_at`, accepted-input source class, and freshness. It must not return successful zeroes if accepted input or an approved rule is absent.

### `RSP-011` — Synchronization list response

Each run contains `sync_run_id`, `domain`, `source_type`, `status`, `received_count`, `accepted_count`, `rejected_count`, `ambiguous_count`, `contract_version`, `rule_version`, `started_at`, nullable `completed_at`, nullable `last_success_at`, `is_stale`, `correlation_id`, replay disposition, and a safe nullable error summary.

### `RSP-012` — Notification-status summary response

Object fields: `as_of`, independent counts for canonical `notification_status`, `total`, filters, nullable `last_attempt_at`, source freshness, and optional approved channel-class grouping. No target, recipient, message, credential, or provider-response field is permitted.

### `RSP-013` — Import-batch list response

Each batch contains `import_batch_id`, `import_type`, safe source type/reference, `status`, received/valid/accepted/rejected/ambiguous counts, contract/mapping/rule versions, replay disposition, `received_at`, nullable `completed_at`, safe actor/process reference, `correlation_id`, and redacted error summary. Raw rows, file content, and local paths are prohibited.

### `RSP-014` — Audit-event list response

Each event contains `audit_event_id`, domain, event type, safe resource type/reference, actor type and authorized pseudonymous/reference form, `occurred_at`, recorded time, correlation and causation references, applicable contract/rule/mapping versions, and a redacted outcome or before/after summary. Sensitive data exclusions in the security document are mandatory.

## Identity representation

1. `vehicle_id`, `pm_plan_id`, `location_id`, history, run, batch, and audit IDs are opaque strings at the API boundary.
2. A PM Assistant-local ID is not an enterprise identity and may not be joined directly to another module's persistence.
3. `vehicle_no` preserves the original Unicode display value. Approved normalized values are comparison artifacts and are not returned as replacements unless explicitly documented.
4. Registration and vehicle code are distinct namespaced attributes; neither is silently substituted for `vehicle_no`.
5. Ambiguous, missing, rejected, and conflicting matches remain visible as classifications or errors.
6. `fleetos_vehicle_id` remains `null` until `DEC-001` is resolved and implementation is separately approved.

## Dates, times, and Thai text

- Dates use ISO 8601 `YYYY-MM-DD`.
- Datetimes use RFC 3339 with an explicit offset; UTC `Z` is preferred for interchange.
- Naive stored timestamps are not assigned a timezone by guesswork.
- Buddhist Era and Gregorian input dates are distinguished during ingestion; ambiguous dates fail validation.
- JSON is UTF-8. Thai text, combining marks, spacing, and original source values are preserved.
- Matching normalization is versioned, locale-aware where approved, and non-destructive.
- Clients must not branch on localized human messages or normalize identifiers using display-only transformations.

## Example PM plan item

```json
{
  "pm_plan_id": "plan-local-1842",
  "vehicle": {
    "vehicle_id": "vehicle-local-104",
    "fleetos_vehicle_id": null,
    "vehicle_no": "รถ-104",
    "vehicle_code": "VH-104"
  },
  "title": "Preventive maintenance",
  "description": null,
  "planned_date": "2026-07-20",
  "deadline_date": "2026-07-22",
  "actual_date": null,
  "location": {
    "location_id": "location-local-7",
    "name": "ศูนย์บริการตัวอย่าง",
    "name_snapshot": "ศูนย์บริการตัวอย่าง"
  },
  "pm_mileage_status": "unknown",
  "pm_workflow_status": "planned",
  "completion_status": "not_completed",
  "notification_status": "unknown",
  "created_at": "2026-07-10T09:00:00+07:00",
  "updated_at": "2026-07-16T10:30:00+07:00"
}
```

The values are synthetic and contain no operational identifiers, credentials, recipients, or infrastructure details.
