# FleetOS v1.0 User Workflows and Acceptance

## Purpose

This document defines the critical FleetOS v1.0 workflows and their acceptance criteria. The flows describe required product outcomes, not proof of current implementation.

Each workflow must preserve module ownership, identity provenance, the four status domains, safe errors, audit evidence, and component-specific rollback.

## Common workflow rules

- PM Assistant is authoritative for maintenance workflow information.
- AutoPM consumes maintenance information read-only.
- Direct shared-database access is prohibited.
- `vehicle_no` is transitional; `fleetos_vehicle_id` is not implemented.
- Ambiguous or conflicting data is never guessed.
- Empty, missing, stale, conflicting, unauthorized, and unavailable states remain distinct.
- Audit evidence excludes secrets and unnecessary sensitive data.

## WF-01 — PM planning

### Primary actor

Maintenance planner/operator

### Preconditions

- The actor is authenticated and authorized under the approved design.
- A vehicle reference can be resolved or an identity exception can be recorded.
- Required plan dates, location representation, and workflow vocabulary are approved.

### Main flow

1. The actor opens PM Assistant planning.
2. The actor searches for or selects the vehicle.
3. PM Assistant shows match classification and approved vehicle attributes.
4. The actor enters plan details, dates, location, and other required fields.
5. PM Assistant validates identity, dates, status, location, and authorization.
6. PM Assistant commits the authoritative plan.
7. PM Assistant records the plan action and required before/after evidence.
8. The approved read model publishes the plan with source and freshness.
9. AutoPM may display the plan read-only.

### Exception paths

- Ambiguous or conflicting vehicle: quarantine and require review.
- Invalid or ambiguous date: reject without guessing.
- Missing location mapping: preserve entered evidence and require approved resolution.
- Concurrent change: reject or reconcile through the approved concurrency policy.
- Persistence or audit failure: do not report success unless the approved consistency guarantee is met.

### Acceptance criteria

- AC-PLAN-001: An authorized actor can create and change a valid plan in PM Assistant.
- AC-PLAN-002: Invalid identity, date, location, status, and authorization inputs fail safely and actionably.
- AC-PLAN-003: AutoPM cannot create, change, cancel, or complete the plan.
- AC-PLAN-004: The read projection contains approved plan fields, separate statuses, source, and freshness.
- AC-PLAN-005: Every accepted state change has traceable audit evidence.
- AC-PLAN-006: PM Assistant planning remains usable when AutoPM is unavailable.

## WF-02 — Vehicle lookup and reconciliation

### Primary actors

Maintenance planner/operator; system administrator/operator

### Main flow

1. A user or controlled process supplies a `vehicle_no` and source context.
2. The system preserves the original Unicode value.
3. The approved normalization rule produces a comparison value and rule version.
4. Candidates are evaluated only in the approved vehicle-number namespace.
5. The system classifies the result as exact, normalized, ambiguous, conflicting, missing, or rejected.
6. Exact or approved normalized results return the transitional representation and provenance.
7. All other classifications create an exception or explicit error for review.

### Exception paths

- Same vehicle number with different registrations: do not merge automatically.
- Same registration with different vehicle numbers: treat as a conflict.
- Vehicle code used as vehicle number: reject implicit cross-field matching.
- Missing master vehicle for a plan: preserve the plan and create an identity exception.
- Sheet row movement: ignore the row position for identity.

### Acceptance criteria

- AC-ID-001: Original and normalized values and the normalization version are preserved.
- AC-ID-002: Exact, normalized, ambiguous, conflicting, missing, and rejected outcomes test distinctly.
- AC-ID-003: Registration, vehicle code, row position, or latest timestamp is never substituted automatically for `vehicle_no`.
- AC-ID-004: `fleetos_vehicle_id` remains null or otherwise represented only as permitted by the approved contract; it is never fabricated.
- AC-ID-005: Exception counts and dispositions are auditable.

## WF-03 — Location selection and management

### Primary actors

Maintenance planner/operator; system administrator/operator

### Main flow

1. The user views approved transitional location representations.
2. The user selects an exact canonical name or approved alias for a plan.
3. PM Assistant stores the authoritative plan reference and preserves the plan-time label.
4. Approved location changes record before/after, source, actor, time, and affected records.
5. Read projections publish only approved location attributes.

### Exception paths

- Similar or translated name without an approved alias: require review.
- Rename: preserve the historical plan label.
- Merge or deletion: follow an approved lifecycle and referential policy.

### Acceptance criteria

- AC-LOC-001: Similar names are not silently merged.
- AC-LOC-002: Historical plan labels remain available after an approved rename.
- AC-LOC-003: Location-management actions are authorized and audited.
- AC-LOC-004: The local location ID is not described as a stable FleetOS identity.

## WF-04 — Mileage acceptance and PM-status calculation

### Primary actors

Approved upstream process; maintenance planner/operator reviewing exceptions

### Preconditions

- The Product Owner has approved the upstream odometer producer, source priority, time policy, reset/correction behavior, freshness, and mileage rule.

### Main flow

1. The controlled boundary receives a mileage record.
2. It preserves raw value, source, measured time, received time, timezone, and vehicle reference.
3. Vehicle identity is classified.
4. The reading is validated for format, sequence, duplication, freshness, and approved reset/replacement evidence.
5. Accepted input becomes an accepted maintenance-mileage record.
6. PM Assistant calculates `pm_mileage_status` using the approved rule version.
7. The result records input reference, rule version, calculation time, source, and freshness.
8. AutoPM displays the result without changing another status domain.

### Exception paths

- Ambiguous vehicle: quarantine.
- Odometer decrease without approved event: quarantine.
- Same-time conflicting readings: quarantine or apply only an approved source-priority rule.
- Missing authoritative input or rule: return unknown or unavailable, never a fabricated zero/OK result.

### Acceptance criteria

- AC-MIL-001: Boundary values and every approved mileage status are tested.
- AC-MIL-002: Stale, duplicate, decreasing, reset, corrected, missing, and conflicting inputs are tested.
- AC-MIL-003: Recalculating or rolling back a rule does not alter accepted raw readings.
- AC-MIL-004: Mileage status never changes workflow, completion, or notification status.
- AC-MIL-005: AutoPM current browser thresholds are not treated as authoritative without approval.

## WF-05 — Completion and correction/reopen

### Primary actor

Maintenance planner/operator

### Main flow

1. The actor opens the authoritative PM plan in PM Assistant.
2. The actor explicitly chooses completion.
3. PM Assistant validates authorization, current state, time, and required evidence.
4. PM Assistant changes `completion_status` under the approved transition policy.
5. PM Assistant records actual/effective time, recorded time, actor, reason, evidence reference, previous/new state, and correlation.
6. Linked task or weekly-control behavior changes only under an approved rule.
7. The read model publishes the updated completion and history projection.

### Exception paths

- Duplicate completion request: produce one business outcome under the approved concurrency/idempotency policy.
- Backdated completion: reject or require elevated approval according to policy.
- Correction or reopen: append evidence and preserve the prior completion event.
- Missing evidence: reject when evidence is required.

### Acceptance criteria

- AC-CMP-001: Completion requires an explicit authorized PM Assistant action.
- AC-CMP-002: Mileage, sheet status, elapsed time, dashboard state, and notification result cannot complete a plan.
- AC-CMP-003: Duplicate or concurrent action cannot create inconsistent completion outcomes.
- AC-CMP-004: Reopen/correction preserves the original evidence.
- AC-CMP-005: AutoPM can display but cannot alter completion state.

## WF-06 — Maintenance history

### Primary actors

Maintenance planner/operator; authorized fleet or executive user

### Main flow

1. The user requests history for a known plan.
2. The system authorizes the history projection.
3. PM Assistant returns ordered events with safe actor representation, action, time, correlation, and approved change summary.
4. AutoPM may display an approved read-only projection.

### Exception paths

- Existing plan without events: return an explicit empty history.
- Unknown or protected plan: follow the approved not-found/disclosure policy.
- Sensitive legacy snapshot: redact or omit unsafe fields.

### Acceptance criteria

- AC-HIS-001: Events are ordered deterministically.
- AC-HIS-002: Empty history and unknown plan behave differently.
- AC-HIS-003: Corrections retain prior evidence.
- AC-HIS-004: Secrets, raw authentication data, unsafe targets, and sensitive snapshots are absent.
- AC-HIS-005: Actor visibility and retention follow the approved policy.

## WF-07 — Notification

### Primary actors

Maintenance workflow or scheduler; system administrator/operator

### Main flow

1. An approved workflow creates a notification intent.
2. PM Assistant authorizes the action, validates the recipient reference, and applies duplicate suppression.
3. PM Assistant records the pending intent.
4. The notification adapter sends the approved message.
5. PM Assistant records the provider outcome as success, failed, or skipped.
6. A retryable failure follows the approved bounded retry policy.
7. Every attempt remains linked to the original intent.

### Exception paths

- Invalid or unauthorized recipient: reject or skip safely.
- Provider timeout or rate limit: apply bounded retry and record outcome.
- Invalid credentials: fail safely without exposing the value.
- Duplicate intent: do not create a duplicate business delivery.

### Acceptance criteria

- AC-NOT-001: Intent and attempts are represented separately.
- AC-NOT-002: Pending, success, failed, and skipped remain distinct.
- AC-NOT-003: Duplicate and retry testing produces no duplicate business delivery beyond approved policy.
- AC-NOT-004: AutoPM cannot declare notification success.
- AC-NOT-005: Logs, errors, read models, and audit contain no credentials, raw targets, or unsafe provider payloads.

## WF-08 — Scheduler

### Primary actor

Approved scheduler execution owner

### Main flow

1. The approved trigger fires using the approved timezone.
2. The runtime attempts to acquire the approved single-execution control.
3. The acquired execution runs the domain job.
4. A non-acquired duplicate is skipped and recorded.
5. The job records start, finish, result, duration, correlation, and any notification intent.
6. Failures follow the approved retry or recovery policy.

### Exception paths

- Process restart or missed trigger: apply approved misfire behavior.
- Overlapping execution: prevent or skip the duplicate.
- Dependency failure: fail visibly and recover under bounded policy.
- Timezone transition or incorrect clock: test and reject ambiguous scheduling behavior.

### Acceptance criteria

- AC-SCH-001: One approved execution owner produces one business outcome per job identity.
- AC-SCH-002: Restart, overlap, misfire, timeout, dependency failure, retry, and recovery tests pass.
- AC-SCH-003: Duplicate prevention and skipped execution are observable.
- AC-SCH-004: AutoPM availability does not affect job execution.

## WF-09 — Import and synchronization

### Primary actor

Authorized maintenance planner/operator or system administrator/operator

### Main flow

1. The actor selects an approved file or feed.
2. PM Assistant creates a batch identity and preserves source provenance.
3. The system parses without authoritative mutation.
4. It validates, normalizes, and classifies every row.
5. It presents preview counts and safe row exceptions.
6. An authorized actor confirms or cancels the import.
7. Confirmed accepted rows are written under the approved atomicity policy.
8. Batch and row outcomes, correlation, versions, and replay disposition are retained.
9. Safe synchronization metadata becomes available read-only to AutoPM if approved.

### Exception paths

- Replayed batch: detect and avoid duplicate business records.
- Partial success: retain accepted and rejected outcomes; do not claim full reconciliation.
- Ambiguous identity: quarantine affected rows.
- Unsafe file or invalid format: reject before mutation.
- Interrupted import: apply approved resume or rollback behavior.

### Acceptance criteria

- AC-IMP-001: Preview causes no business mutation.
- AC-IMP-002: Every received row has a traceable outcome.
- AC-IMP-003: Replay does not duplicate business records.
- AC-IMP-004: Partial success remains visible at batch and row level.
- AC-IMP-005: AutoPM cache is never an import source.
- AC-IMP-006: Source, counts, versions, times, actor/process, correlation, and safe errors are auditable.

## WF-10 — Dashboard and reporting

### Primary actor

Fleet and executive user

### Main flow

1. AutoPM requests approved read projections.
2. The provider returns authorized data with source, freshness, generated time, and correlation metadata.
3. AutoPM validates the response shape and status values.
4. AutoPM displays dashboard, KPI, tracking, calendar, filter, and report views.
5. The user drills down, filters, exports, or copies authorized presentation data.

### Exception paths

- Valid empty population: show explicit zero/empty state.
- Missing singular resource: show not-found behavior.
- Ambiguous identity: show conflict requiring review.
- Authoritative data unavailable: show unavailable, not zero.
- Target read failure with valid fallback: show labeled fallback source and age.
- Unknown enum value: display a safe unknown value without remapping domains.

### Acceptance criteria

- AC-DAS-001: Source and freshness are visible and accurate.
- AC-DAS-002: Empty, missing, ambiguous, stale, fallback, and unavailable states test distinctly.
- AC-DAS-003: All four status domains remain separate in display and filters.
- AC-DAS-004: Unknown future enum values render safely.
- AC-DAS-005: Export/copy uses the authorized visible dataset.
- AC-DAS-006: Target consumption can be disabled without changing PM Assistant data or authority.

## WF-11 — Audit and operational review

### Primary actors

System administrator/operator; Product Owner

### Main flow

1. A plan, completion, mileage, import, scheduler, or notification event occurs.
2. The authoritative module creates domain audit evidence.
3. Evidence includes safe actor/process identity, times, result, correlation, and applicable versions.
4. Authorized users review safe audit and operational summaries.
5. Corrections or incident actions retain prior evidence.

### Exception paths

- Suspected secret or sensitive value: redact and handle through the security incident process.
- Missing correlation: create a safe diagnostic reference without fabricating causation.
- Retention or privacy request: follow the approved domain-specific policy.

### Acceptance criteria

- AC-AUD-001: Required workflow events produce traceable evidence.
- AC-AUD-002: Correlation is consistent across the approved boundary but is not treated as authentication or idempotency.
- AC-AUD-003: Audit excludes prohibited secret and sensitive content.
- AC-AUD-004: Corrections preserve superseded evidence.
- AC-AUD-005: Access and retention follow the approved policy.

## Cross-workflow acceptance

FleetOS v1.0 workflow acceptance requires:

- all applicable acceptance criteria above pass;
- Thai text, keyboard operation, responsive behavior, validation, and failure states are reviewed;
- provider and consumer contract tests pass;
- identity and reconciliation differences meet approved thresholds;
- security, redaction, retry, duplicate prevention, migration, backup, restore, and rollback evidence passes;
- no production-blocking Product Owner decision remains unresolved;
- the Product Owner accepts user-acceptance and release evidence.

