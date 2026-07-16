# FleetOS Operational Metrics and SLOs

## Purpose

This document defines proposed measurement semantics, operational KPIs, service indicators, service-objective governance, and reporting for FleetOS v1.0. It defines no numerical objective, alert threshold, timing, retry value, capacity target, error budget, or release threshold.

## Requirement registry

| ID | Requirement |
| --- | --- |
| `MET-001` | Every operational metric has an approved purpose, owner, population, source, unit, calculation, dimensions, time basis, freshness, and version. |
| `MET-002` | Metrics distinguish valid zero, missing signal, stale signal, unavailable source, partial result, and calculation failure. |
| `MET-003` | Operational KPIs do not redefine AutoPM business KPIs, maintenance status, completion, notification success, or domain authority. |
| `MET-004` | Availability indicators use the approved service responsibility and state model rather than process existence alone. |
| `MET-005` | Latency and duration indicators identify the measured boundary and do not combine unrelated request, dependency, job, import, notification, backup, or restore work. |
| `MET-006` | Error indicators use stable safe classifications and exclude validation or expected business outcomes unless the approved definition includes them explicitly. |
| `MET-007` | Freshness indicators use authoritative `as_of` or approved source times and never browser observation time as authority. |
| `MET-008` | Job, import, and notification indicators preserve occurrence, batch, intent, attempt, partial, duplicate, skipped, and uncertain semantics. |
| `MET-009` | Metric dimensions are bounded and exclude secrets, raw identifiers where unnecessary, personal data, free text, filenames, targets, and payloads. |
| `MET-010` | SLOs are approved from product impact, measured evidence, dependency behavior, recovery capability, and accountable ownership. |
| `MET-011` | SLO reporting identifies exclusions, missing data, maintenance treatment, definition changes, and unresolved evidence. |
| `MET-012` | No service level is called achieved until measurement integrity and the approved objective are validated in the intended environment. |

## Measurement principles

1. Measure one clearly defined boundary.
2. Identify the counted population and excluded outcomes.
3. Preserve source and explicit-timezone time semantics.
4. Use stable definitions and version changes.
5. Separate business meaning from operational outcome.
6. Avoid uncontrolled metric cardinality.
7. Make missing and stale measurement visible.
8. Treat metrics as evidence, not proof of root cause.
9. Protect sensitive data.
10. Require Product Owner approval for objectives and release use.

## Metric definition template

Each metric or indicator should document:

| Field | Required direction |
| --- | --- |
| Name and version | Stable identifier and definition version |
| Purpose | Operational question answered |
| Owner | Role accountable for definition and action |
| Boundary | AutoPM, PM Assistant, API, job, import, notification, persistence, recovery, or security |
| Population | Included observations and exclusions |
| Source | Authoritative operational signal and collection dependency |
| Unit | Count, ratio, duration, age, size, or other approved unit |
| Calculation | Reproducible numerator/denominator or aggregation |
| Dimensions | Approved bounded labels |
| Time basis | Observation, event, effective, measured, received, or `as_of` time |
| Missing/stale behavior | Unknown, unavailable, stale, or invalid handling |
| Sensitivity | Classification and prohibited dimensions |
| Objective relationship | Informational, alert input, SLI, release evidence, or other approved use |

## Proposed operational KPI catalog

These are indicator families, not implemented metrics or approved targets.

| Area | Indicator direction |
| --- | --- |
| Service lifecycle | Live, ready, degraded, not-ready, failed, draining, and recovery transitions |
| API/read boundary | Request/result count, duration, error class, timeout, dependency unavailability, and contract compatibility |
| AutoPM data experience | Successful read, last-known-good use, fallback use, source age, stale/unavailable state, and unknown contract value |
| Read-model freshness | `as_of` age, stale classification, missing authoritative input, projection generation failure |
| Identity quality | Exact, normalized, ambiguous, conflicting, missing, rejected, quarantined, and reviewed outcomes |
| Import/synchronization | Batch and row results, partial outcome, replay disposition, duration, freshness, and unresolved exception count |
| Background jobs | Occurrence acquisition, duplicate skip, start, completion, failure, interruption, recovery, and duration |
| Notifications | Intent, attempt, safe provider result, ambiguous outcome, retry disposition, terminal outcome, and duration |
| Persistence | Readiness, transaction classification, capacity risk direction, migration result, backup result, and restore result |
| Delivery | Validation, enablement, rollback, stabilization, compatibility, and failed promotion |
| Security | Authentication/authorization classifications when implemented, protected access, configuration changes, evidence loss, and incident state |
| Operations | Alert lifecycle, incident state, runbook use, maintenance state, recovery validation, and unresolved action ownership |

## Availability direction

Availability measurement requires:

- one approved service responsibility;
- the intended user or service perspective;
- ready, degraded, not-ready, and excluded maintenance semantics;
- treatment of dependency and telemetry failure;
- valid-empty versus unavailable behavior;
- planned maintenance treatment;
- measurement source and missing-data policy.

Process liveness alone is not an availability indicator. AutoPM delivery availability and PM Assistant authoritative-work availability remain separate.

## Latency and duration direction

Separate measurement families apply to:

- AutoPM asset delivery and read presentation;
- API request processing;
- authoritative dependency access;
- import preview and confirmation;
- background-job acquisition and execution;
- notification provider attempts;
- backup creation and verification;
- restore and reconciliation;
- deployment, rollback, and recovery.

No boundary inherits another boundary's target. Percentile method, aggregation interval, clock source, timeout, and objective remain unresolved.

## Error and outcome direction

Operational error classifications should preserve:

- invalid request or validation outcome;
- not found or not visible;
- identity ambiguous/conflicting;
- dependency unavailable or timeout;
- persistence or provider failure;
- configuration invalid;
- runtime not ready;
- unexpected internal failure;
- partial, skipped duplicate, denied, or uncertain outcome.

Expected user validation failures must not be mixed with infrastructure failure without an approved reason. Notification provider success does not imply maintenance completion.

## Freshness direction

Freshness uses the newest authoritative state represented by a read model, not response generation time or browser cache time. Reporting should distinguish:

- `generated_at`;
- authoritative `as_of`;
- source measured/received time where applicable;
- cache storage time;
- stale classification and reason;
- fallback source and age;
- unavailable authority.

Freshness thresholds remain unresolved.

## SLI and SLO governance

An SLI is an approved measurement of a defined service outcome. An SLO is an approved objective for that indicator. Before an SLO can govern release or operations:

1. the service and users are identified;
2. the indicator definition and data source are validated;
3. exclusions and maintenance treatment are approved;
4. dependency and telemetry failure behavior is known;
5. historical or representative evidence is reviewed;
6. the accountable owner and response path are assigned;
7. the objective and evaluation method are approved;
8. rollout, rollback, incident, and exception effects are defined.

No objective or error-budget policy is selected by this Blueprint.

## Reporting and review

Operational reporting should include:

- definition and version;
- reporting environment and period after approval;
- objective status only when an objective exists;
- missing/stale measurement;
- maintenance and exclusion treatment;
- significant incidents, changes, and recovery events;
- definition or instrumentation changes;
- residual risk and required decisions.

## Validation direction

Later implementation should validate calculation reproducibility, units, timezones, source integrity, missing/stale behavior, dimension bounds, redaction, dashboard rendering, alert use, historical comparison, definition changes, and objective evaluation with synthetic or approved sanitized evidence.

Metric and SLO decisions remain `ODEC-004` through `ODEC-006`.
