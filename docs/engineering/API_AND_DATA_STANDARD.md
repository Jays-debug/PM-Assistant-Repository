# FleetOS API and Data Standard

Version 1.0

## Authority

This standard summarizes engineering rules from the specialized [API contract](../API_CONTRACT.md), [API error model](../API_ERROR_MODEL.md), [data ownership](../DATA_OWNERSHIP.md), [identity contract](../IDENTITY_CONTRACT.md), [FleetOS architecture](../FLEETOS_ARCHITECTURE.md), and related [ADRs](../adr/). Those documents remain authoritative within their stated approval status.

The currently documented `/api/v1` boundary is proposed. This standard does not claim that a production FleetOS API, authentication, Railway, or PostgreSQL is operational.

## Module and ownership rules

- PM Assistant is authoritative for PM plans, `pm_workflow_status`, `completion_status`, PM history, `notification_status`, and controlled import and synchronization audit.
- AutoPM is read-only for maintenance workflow information and owns dashboard presentation, KPI visualization, filters, presentation labels, and temporary read cache.
- Direct shared-database access is prohibited.
- AutoPM must not write to PM Assistant persistence or duplicate PM Assistant workflow rules.
- PM Assistant publishes purpose-built read models instead of tables or ORM models.
- A database-engine change does not transfer data ownership.

## API naming and versioning

For an approved FleetOS API boundary:

- place the major version in the path, such as `/api/v1`;
- use lowercase plural kebab-case resource paths;
- use `snake_case` fields and query parameters;
- represent boundary resource identifiers as opaque strings;
- use ISO 8601 dates and RFC 3339 datetimes with explicit offsets;
- use safe, idempotent `GET` operations for the proposed v1 read boundary;
- use cursor pagination for lists and reject unsupported filters or sorts;
- return an empty list for a valid list query with no matches;
- preserve source and freshness metadata;
- keep database engine, hosting provider, and authentication implementation out of the representation contract.

Compatible v1 changes may add documented endpoints, optional fields, optional filters, or optional metadata. Removing or renaming fields, changing types or nullability, changing identity or status meaning, or changing established ordering is breaking and requires an approved new major version or compatibility plan.

Deprecation requires a documented replacement, consumer migration guidance, an approved sunset, overlap sufficient for migration, and tested fallback and rollback. No deprecation period is assumed approved unless the Product Owner approves it.

## Success envelope

Approved JSON success responses follow the contract shape:

```json
{
  "data": {},
  "meta": {
    "api_version": "v1",
    "generated_at": "2026-07-12T08:15:30Z",
    "correlation_id": "example-correlation-id",
    "source": "pm_assistant",
    "freshness": {
      "as_of": "2026-07-12T08:15:00Z",
      "is_stale": false
    }
  }
}
```

Lists use an array in `data`; paginated responses include the documented pagination metadata. Do not fabricate unavailable authoritative data.

## Error envelope

Approved JSON errors follow the common envelope:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid.",
    "details": [],
    "retryable": false
  },
  "meta": {
    "api_version": "v1",
    "generated_at": "2026-07-12T08:15:30Z",
    "correlation_id": "example-correlation-id"
  }
}
```

Rules:

- `code` is stable `UPPER_SNAKE_CASE` machine-readable text.
- Clients branch on HTTP status and `code`, not the human message.
- Optional `details` contains safe public field names and redacted validation context only.
- `retryable` classifies the failure; it does not guarantee success on retry.
- The response header and envelope carry the same approved correlation ID.
- Errors never expose stack traces, SQL, persistence details, paths, topology, secrets, tokens, targets, or raw sensitive payloads.
- Missing authoritative input is not converted to a zero or empty success.
- Ambiguous transitional identity returns an explicit conflict; the API never guesses a match.

If the API contract, error model, or ADR registry disagrees about a code or behavior, stop and escalate. Do not invent a code, silently select one source, or implement both meanings without an approved resolution.

## Identity rules

- `vehicle_no` is the only approved transitional cross-system matching key.
- It is not a permanently immutable or globally canonical identifier.
- `fleetos_vehicle_id` is reserved as a proposed future canonical internal identifier; it does not currently exist.
- Local database IDs, sheet row numbers, and array indexes are not shared identities.
- Registration and vehicle codes remain attributes or namespaced aliases unless later approved otherwise.
- Preserve original Unicode values alongside versioned normalized comparison values.
- Quarantine ambiguous, conflicting, missing, or rejected matches; never select by row order or latest timestamp.
- Location, fleet, business-unit, user, and responsibility identity remain subject to their unresolved ownership decisions.

## Status-domain rules

The following fields represent separate concepts and must never overwrite or infer one another:

| Field | Meaning |
| --- | --- |
| `pm_mileage_status` | Condition derived from accepted mileage input and an approved versioned rule |
| `pm_workflow_status` | Progress through the maintenance planning workflow |
| `completion_status` | Explicit completion, correction, or reopen state |
| `notification_status` | Notification intent and delivery outcome |

AutoPM may present these values but does not become authoritative for them. Current AutoPM labels and thresholds are implementation evidence, not approved authoritative rules.

## Data handling and synchronization

- Domain ownership outranks timestamps.
- Google Sheets, Apps Script, CSV files, and AutoPM browser cache are transitional sources or presentation mechanisms, not authoritative workflow stores.
- AutoPM cache is never reverse-synchronized into PM Assistant.
- Controlled imports must validate, classify, audit, and retain partial outcomes.
- Replayed imports must be idempotent under a later approved identity scheme.
- Preserve source, batch, raw value, normalized value, rule version, timestamps, actor or process, and disposition as appropriate.
- Corrections should retain prior evidence through append-only or compensating records where feasible.
- Audit records exclude secrets and unnecessary sensitive values.

## Database and migration direction

Current repository evidence shows SQLite persistence in PM Assistant. PostgreSQL readiness is planned, not proven operational.

Future database changes require:

- explicit Product Owner scope and migration approval;
- a versioned migration mechanism selected and approved before schema evolution;
- compatibility analysis for current queries, types, constraints, transactions, and scheduler behavior;
- verified backup and restore procedures;
- rehearsal against isolated non-production data;
- pre- and post-migration counts, constraints, identity, status, and reconciliation checks;
- controlled application compatibility and deployment sequencing;
- a rollback or forward-recovery decision with clear triggers;
- retained audit evidence without credentials or connection strings.

Do not deploy a migration automatically, mutate production data, or describe readiness as completion without reviewed evidence.

## Contract and data change gate

Before implementation, confirm:

- authoritative owner and allowed readers/writers;
- identity and ambiguity behavior;
- separate status semantics;
- schema and error compatibility;
- authentication and authorization direction;
- sensitive-field exposure;
- timeout, retry, cache, staleness, and rate-limit behavior;
- audit, retention, migration, and rollback requirements;
- consumer compatibility tests and staged cutover evidence.
