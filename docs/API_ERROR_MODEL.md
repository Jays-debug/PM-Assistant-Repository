# FleetOS API Error Model

## Status and scope

- Status: Proposed
- API namespace: `/api/v1`
- Scope: read-only AutoPM consumption of PM Assistant maintenance information

This model does not claim that authentication, rate limiting, production hosting, or the versioned API is operational.

## Common error envelope

```json
{
  "error": {
    "code": "IDENTITY_AMBIGUOUS",
    "message": "The transitional vehicle number does not identify one vehicle.",
    "details": [
      {
        "field": "vehicle_no",
        "reason": "multiple_matches"
      }
    ],
    "retryable": false
  },
  "meta": {
    "api_version": "v1",
    "generated_at": "2026-07-12T08:15:30Z",
    "correlation_id": "01J00000000000000000000000"
  }
}
```

Rules:

- `code` is a stable machine-readable `UPPER_SNAKE_CASE` value.
- `message` is a safe human-readable summary and is not intended for program logic.
- `details` is optional and contains safe structured validation or conflict information.
- `retryable` describes the error class, not a guarantee that a repeated call will succeed.
- `meta.api_version`, `generated_at`, and `correlation_id` appear on every JSON error response.
- The `X-Correlation-ID` response header carries the same correlation ID.
- Error responses never expose stack traces, SQL, database engine or connection details, filesystem paths, secrets, tokens, raw webhook payloads, notification targets, or credentials.

## Correlation IDs

A caller may send `X-Correlation-ID`. The service propagates it only if it satisfies approved character and length validation; otherwise it generates a new value. Correlation IDs must not contain user-provided free text or secret material and must be sanitized before logging.

Correlation IDs support tracing across AutoPM, the API boundary, PM Assistant, and approved internal read dependencies. They do not prove identity, authorization, causation, ordering, or idempotency.

## HTTP status and code registry

| HTTP | Code | Meaning | Retryable |
|---|---|---|---|
| `400` | `INVALID_REQUEST` | Request syntax or combination is invalid. | No |
| `400` | `INVALID_FILTER` | Filter name or value is unsupported. | No |
| `400` | `INVALID_SORT` | Sort field or direction is unsupported. | No |
| `400` | `INVALID_CURSOR` | Cursor is malformed, expired, or does not match the query. | No |
| `400` | `INVALID_DATE_RANGE` | Date range is invalid or ambiguous. | No |
| `401` | `AUTHENTICATION_REQUIRED` | Approved authentication is required but absent. | No |
| `401` | `INVALID_CREDENTIALS` | Supplied credentials cannot be accepted. | No |
| `403` | `INSUFFICIENT_SCOPE` | Authenticated caller lacks the required read scope. | No |
| `404` | `VEHICLE_NOT_FOUND` | Singular vehicle lookup has no match. | No |
| `404` | `PM_PLAN_NOT_FOUND` | Requested plan does not exist or is not visible. | No |
| `404` | `LOCATION_NOT_FOUND` | Requested location does not exist or is not visible. | No |
| `409` | `IDENTITY_AMBIGUOUS` | Transitional identity matches multiple candidates. | No |
| `409` | `IDENTITY_CONFLICT` | Source identities or attributes are incompatible. | No |
| `429` | `RATE_LIMITED` | Caller exceeded an approved rate limit. | Yes, after `Retry-After` |
| `500` | `INTERNAL_ERROR` | Unexpected server failure. | Conditional |
| `503` | `SERVICE_NOT_READY` | Read boundary is not ready. | Yes |
| `503` | `DEPENDENCY_UNAVAILABLE` | Essential read dependency is unavailable. | Yes |
| `503` | `READ_MODEL_UNAVAILABLE` | Authoritative data or calculation cannot currently be supplied. | Yes |
| `504` | `DEPENDENCY_TIMEOUT` | Dependency exceeded the server deadline. | Yes |

Authorization failures may intentionally use `404` instead of `403` where resource-existence disclosure would be unsafe; this behavior must be consistent and documented after the authorization design is approved.

## Validation details

A validation detail may contain:

```json
{
  "field": "planned_from",
  "reason": "must_not_be_after_planned_to",
  "value": "2026-07-31"
}
```

The `value` member is optional and must be omitted or redacted for credentials, tokens, personal data, long free text, notification targets, raw source records, or any other sensitive input. Field names use the public contract name, not an ORM, table, or internal Python name.

Multiple independent validation failures may be returned together. The order of details is not a compatibility guarantee.

## Empty results versus errors

- A valid list query with no matching resources returns `200` and `data: []`.
- A valid zero-population summary returns `200` and explicit zero counts.
- A singular lookup with no resource returns `404`.
- A mileage summary returns `503 READ_MODEL_UNAVAILABLE`, not zero counts, when required authoritative input or an approved rule is unavailable.
- Ambiguous transitional identity returns `409`; the API does not choose a candidate automatically.
- Unsupported filters and sorts return `400`; the service does not ignore them.

## Authentication and authorization errors

The codes in this section reserve contract behavior for a future approved security design. Their presence does not mean authentication is implemented.

- `401` indicates that valid caller authentication was not established.
- `403` indicates that caller identity was established but lacks the required scope.
- Error text must not reveal credential validation internals, expected secrets, token structure, user existence, or protected resource contents.
- Challenges and authentication headers are defined by the later selected mechanism.

## Rate-limit errors

A `429 RATE_LIMITED` response should include:

- `Retry-After` with seconds or an HTTP date;
- `retryable: true`;
- the common correlation ID;
- optional limit metadata only if it does not reveal a security control that should remain private.

Clients must honor `Retry-After` and add jitter. No production limit is established by this document.

## Dependency and internal failures

- Return `503 DEPENDENCY_UNAVAILABLE` when an essential dependency cannot supply authoritative reads.
- Return `503 READ_MODEL_UNAVAILABLE` when a required accepted dataset or approved calculation is absent.
- Return `504 DEPENDENCY_TIMEOUT` when an internal dependency reaches its deadline.
- Return `500 INTERNAL_ERROR` only for unexpected failures not represented by a more specific code.
- Do not convert missing authoritative data into empty success responses.
- Readiness may provide only coarse dependency state and must not disclose topology.

Internal logs should record the correlation ID and safe diagnostic context. Sensitive data, secrets, and raw authentication material remain prohibited from logs and audit records.

## Retry direction

AutoPM may retry connection failures and `429`, `502`, `503`, or `504` at most twice using exponential backoff with jitter. It must honor `Retry-After`. It must not automatically retry `400`, `401`, `403`, `404`, or `409`.

Because Phase 3.3 exposes only `GET` operations, retrying a qualifying request is safe from a write-idempotency perspective. A retry may still observe newer authoritative data and is not guaranteed to return an identical representation.

## Compatibility

- Existing error codes retain their meaning for the lifetime of v1.
- Adding a new code for a previously undocumented condition is normally additive, but clients must retain a generic fallback by HTTP class.
- Reusing a code with different semantics is breaking.
- Removing required envelope fields or changing their types is breaking.
- Adding optional detail members is compatible.
- Human-readable `message` text may change and is not a programmatic contract.
- Clients branch on `code` and HTTP status, never on message text.

## Unresolved decisions

- Authentication challenges and resource-existence disclosure policy.
- Correlation ID format, maximum length, and trusted proxy behavior.
- Rate-limit identity, thresholds, and response metadata.
- Validation redaction rules for actor, location, notification, and import data.
- Retry classification for selected `500` failures.
- Localization of messages and whether only English machine-facing messages are supported.
- Error and audit retention periods.

