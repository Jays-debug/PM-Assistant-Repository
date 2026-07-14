# FleetOS v1.0 Functional Requirements

## Purpose and interpretation

This document defines uniquely identified functional requirements for FleetOS v1.0. `MUST` indicates a v1 release requirement after its blocking decisions are approved. `SHOULD` indicates expected direction that may be varied only through an explicit Product Owner decision.

Requirements do not claim implementation. Current implementation evidence is identified separately in the [Product Specification](FLEETOS_PRODUCT_SPECIFICATION.md).

## Requirement states

| State | Meaning |
| --- | --- |
| Required | Needed for v1 release. |
| Conditional | Needed only when the named capability is included; blocked by an unresolved Product Owner decision. |
| Transitional | Needed for controlled migration or cutover and may be retired only after acceptance. |

## Platform and module boundaries

| ID | Requirement | State |
| --- | --- | --- |
| FR-PLT-001 | FleetOS MUST preserve AutoPM and PM Assistant as separate bounded modules. | Required |
| FR-PLT-002 | PM Assistant MUST remain authoritative for maintenance workflow information. | Required |
| FR-PLT-003 | AutoPM MUST remain read-only for maintenance workflow information. | Required |
| FR-PLT-004 | AutoPM MUST NOT read from or write to PM Assistant persistence directly. | Required |
| FR-PLT-005 | PM Assistant core maintenance workflows MUST operate without AutoPM availability. | Required |
| FR-PLT-006 | Cross-module maintenance reads MUST use an approved versioned interface or approved read model. | Required |
| FR-PLT-007 | A persistence, hosting, or deployment change MUST NOT alter domain ownership. | Required |
| FR-PLT-008 | Existing unversioned routes MUST remain outside the v1 compatibility guarantee until individually reviewed and approved. | Required |

## Identity and vehicle lookup

| ID | Requirement | State |
| --- | --- | --- |
| FR-ID-001 | `vehicle_no` MUST be treated as a transitional matching key and not as a permanent enterprise identifier. | Required |
| FR-ID-002 | `fleetos_vehicle_id` MUST NOT be fabricated or described as implemented. | Required |
| FR-ID-003 | Vehicle lookup MUST use only approved, versioned normalization rules. | Required |
| FR-ID-004 | Original identity values, normalized comparison values, rule version, source, and match classification MUST be retained where reconciliation occurs. | Required |
| FR-ID-005 | Exact, normalized, ambiguous, conflicting, missing, and rejected outcomes MUST remain distinct. | Required |
| FR-ID-006 | Ambiguous or conflicting vehicle matches MUST be quarantined or returned as explicit conflicts; the system MUST NOT select a candidate automatically. | Required |
| FR-ID-007 | Registration, vehicle code, and vehicle number MUST remain separate namespaces unless a later identity decision approves otherwise. | Required |
| FR-ID-008 | Sheet row positions and database-local integers MUST NOT be used as shared enterprise identities. | Required |
| FR-ID-009 | Vehicle lists and lookups MUST expose approved identity status, source, and freshness. | Required |
| FR-ID-010 | An operational `fleetos_vehicle_id` MAY be introduced only through a separately approved identity lifecycle. | Conditional |

## PM planning

| ID | Requirement | State |
| --- | --- | --- |
| FR-PLAN-001 | PM Assistant MUST own PM plan creation, modification, cancellation, and authoritative publication. | Required |
| FR-PLAN-002 | Plan actions MUST validate vehicle identity, dates, location representation, status input, and authorization before acceptance. | Required |
| FR-PLAN-003 | A successful plan mutation MUST persist the authoritative state and required audit evidence with the approved consistency guarantee. | Required |
| FR-PLAN-004 | AutoPM MUST NOT create, modify, cancel, or complete a PM plan in v1. | Required |
| FR-PLAN-005 | Plan read projections MUST include the approved vehicle reference, plan dates, location representation, source, freshness, and separate status fields. | Required |
| FR-PLAN-006 | Plan list behavior MUST support approved filters, sorts, and pagination and MUST reject unsupported values explicitly. | Required |
| FR-PLAN-007 | Candidate upstream plan data MUST enter through controlled import or reconciliation and MUST NOT overwrite authoritative plans directly. | Required |
| FR-PLAN-008 | The definition and identity of a recurring plan MUST be approved before recurring-plan behavior becomes a v1 contract. | Conditional |

## Location behavior

| ID | Requirement | State |
| --- | --- | --- |
| FR-LOC-001 | PM Assistant MUST publish approved transitional location representations for plan selection and filtering. | Required |
| FR-LOC-002 | Exact canonical names or explicitly approved aliases MUST be used during transition. | Required |
| FR-LOC-003 | Historical plan location labels MUST be preserved across rename or mapping activity. | Required |
| FR-LOC-004 | Similar location names MUST NOT be merged automatically. | Required |
| FR-LOC-005 | Location creation, update, rename, merge, and alias actions MUST be audited when implemented. | Required |
| FR-LOC-006 | A stable FleetOS location identifier MAY be introduced only after owner and lifecycle approval. | Conditional |

## Status domains

| ID | Requirement | State |
| --- | --- | --- |
| FR-STS-001 | `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` MUST be represented as separate concepts. | Required |
| FR-STS-002 | No status domain MUST overwrite, infer, or stand in for another. | Required |
| FR-STS-003 | AutoPM MUST safely render an approved value and an unknown future value without collapsing status domains. | Required |
| FR-STS-004 | PM Assistant MUST be authoritative for `pm_workflow_status`, `completion_status`, and `notification_status`. | Required |
| FR-STS-005 | PM Assistant MUST become authoritative for `pm_mileage_status` only after accepted mileage input and calculation rules are approved and implemented. | Conditional |
| FR-STS-006 | A schedule condition such as overdue-by-date MUST remain separate from workflow progression unless a Product Owner-approved contract states otherwise. | Required |
| FR-STS-007 | Status transitions MUST record old value, new value, reason, actor or process, time, and correlation according to the audit policy. | Required |

## Mileage and PM condition

| ID | Requirement | State |
| --- | --- | --- |
| FR-MIL-001 | Raw mileage input MUST retain source, raw value, parsed value, vehicle match, measured time, received time, timezone, and validation result. | Conditional |
| FR-MIL-002 | Invalid, stale, decreasing, duplicate, ambiguous, or conflicting mileage MUST be quarantined according to approved rules. | Conditional |
| FR-MIL-003 | Accepted mileage MUST remain intact when a calculation rule is changed or rolled back. | Conditional |
| FR-MIL-004 | `pm_mileage_status` MUST include the accepted input reference, rule version, calculated time, source, and freshness. | Conditional |
| FR-MIL-005 | A missing approved input or rule MUST produce `unknown` or authoritative-unavailable behavior according to the approved contract; it MUST NOT be guessed. | Conditional |
| FR-MIL-006 | AutoPM's current browser thresholds MUST NOT become authoritative merely through reuse. | Required |
| FR-MIL-007 | Mileage correction and odometer reset/replacement MUST preserve correction lineage. | Conditional |

## Completion and maintenance history

| ID | Requirement | State |
| --- | --- | --- |
| FR-CMP-001 | Completion MUST result from an explicit authorized PM Assistant action. | Required |
| FR-CMP-002 | Completion MUST NOT be inferred from mileage reset, sheet status, elapsed time, workflow status, dashboard state, or notification result. | Required |
| FR-CMP-003 | Completion MUST record actual/effective time, recorded time, actor or process, previous and new state, reason, correlation, and approved evidence reference. | Required |
| FR-CMP-004 | Reopen, correction, and re-completion MUST follow an approved transition policy and preserve prior evidence. | Conditional |
| FR-HIS-001 | PM Assistant MUST own authoritative maintenance history. | Required |
| FR-HIS-002 | History SHOULD be append-only or use compensating evidence where feasible. | Required |
| FR-HIS-003 | History reads MUST return safe, authorized projections and redact sensitive legacy snapshots. | Required |
| FR-HIS-004 | An existing plan with no history MUST be distinguishable from an unknown or unauthorized plan. | Required |
| FR-HIS-005 | History retention, actor visibility, correction, and deletion/privacy behavior MUST be approved before production release. | Conditional |

## Notifications

| ID | Requirement | State |
| --- | --- | --- |
| FR-NOT-001 | PM Assistant MUST own notification orchestration and `notification_status`. | Required |
| FR-NOT-002 | Notification intent MUST be represented separately from provider delivery attempts. | Required |
| FR-NOT-003 | Every controlled attempt MUST record an approved safe target reference, attempt number, provider result classification, time, correlation, and terminal or retry state. | Required |
| FR-NOT-004 | Notification delivery MUST use an approved business idempotency and duplicate-suppression policy. | Conditional |
| FR-NOT-005 | Retry MUST be bounded and limited to approved retryable outcomes. | Conditional |
| FR-NOT-006 | Failure, skipped delivery, pending intent, and success MUST remain distinct. | Required |
| FR-NOT-007 | AutoPM MUST NOT declare notification success. | Required |
| FR-NOT-008 | Credentials, raw targets, raw webhook payloads, and unsafe provider responses MUST NOT appear in read projections, errors, logs, or audit. | Required |

## Scheduler

| ID | Requirement | State |
| --- | --- | --- |
| FR-SCH-001 | PM Assistant MUST own scheduled maintenance actions. | Required |
| FR-SCH-002 | Each business job MUST have one approved execution owner in the selected runtime topology. | Required |
| FR-SCH-003 | Jobs MUST use deterministic identity, approved timezone behavior, overlap control, misfire behavior, bounded concurrency, and recovery policy. | Conditional |
| FR-SCH-004 | Duplicate execution MUST be prevented or recorded as a safely skipped outcome. | Required |
| FR-SCH-005 | Job start, result, duration, failure, retry, duplicate prevention, and correlation MUST be observable. | Required |
| FR-SCH-006 | AutoPM availability MUST NOT be required for PM Assistant scheduled jobs. | Required |

## Import and synchronization

| ID | Requirement | State |
| --- | --- | --- |
| FR-IMP-001 | Every controlled import or synchronization run MUST have a traceable batch identity. | Required |
| FR-IMP-002 | Parsing, validation, normalization, and classification MUST occur before authoritative mutation. | Required |
| FR-IMP-003 | A preview MUST expose received, accepted, rejected, ambiguous, conflicting, and other approved outcome counts before confirmation. | Required |
| FR-IMP-004 | Mutation MUST require an approved confirmation and authorization boundary. | Required |
| FR-IMP-005 | Batch-level and row-level outcomes MUST remain visible, including partial success. | Required |
| FR-IMP-006 | Replayed input MUST NOT duplicate business records under the approved replay identity. | Conditional |
| FR-IMP-007 | Import evidence MUST include source type, safe source reference, contract/rule versions, actor or process, times, correlation, replay disposition, and safe errors. | Required |
| FR-IMP-008 | AutoPM browser cache MUST NOT be an import or synchronization source. | Required |
| FR-IMP-009 | AutoPM MAY read presentation-safe synchronization metadata but MUST NOT alter batch outcomes. | Required |

## Dashboard and reporting

| ID | Requirement | State |
| --- | --- | --- |
| FR-DAS-001 | AutoPM MUST own dashboard composition, visualization, filtering, calendars, and presentation labels. | Required |
| FR-DAS-002 | Maintenance values presented by AutoPM MUST come from approved authoritative projections after target cutover. | Required |
| FR-DAS-003 | AutoPM MUST display source, `as_of`, generated time, freshness, stale state, and fallback state where applicable. | Required |
| FR-DAS-004 | Valid zero counts, valid empty lists, missing singular resources, ambiguous identity, and unavailable authoritative data MUST be distinguishable. | Required |
| FR-DAS-005 | KPI definitions, population, filters, and calculation versions MUST be approved and traceable. | Conditional |
| FR-DAS-006 | Export and copy behavior MUST use the currently displayed authorized projection and MUST indicate relevant source or freshness context where required. | Required |
| FR-DAS-007 | AutoPM MUST retain a labeled last-known-good path during approved transition and stabilization. | Transitional |
| FR-DAS-008 | AutoPM MUST NOT reverse-synchronize cached or legacy presentation values to PM Assistant. | Required |

## API, validation, and errors

| ID | Requirement | State |
| --- | --- | --- |
| FR-API-001 | The approved cross-module API MUST place its major version in the path and publish dedicated response models. | Required |
| FR-API-002 | V1 maintenance integration operations MUST be read-only `GET` operations unless a later write contract is approved. | Required |
| FR-API-003 | Success responses MUST include approved source, freshness, generated time, API version, and correlation metadata. | Required |
| FR-API-004 | Errors MUST use stable machine-readable codes and safe human-readable messages. | Required |
| FR-API-005 | Errors MUST NOT expose stack traces, SQL, persistence details, paths, topology, secrets, raw targets, or sensitive payloads. | Required |
| FR-API-006 | Unsupported filters, sorts, cursors, and invalid date combinations MUST fail explicitly rather than being ignored. | Required |
| FR-API-007 | List endpoints MUST use approved bounded pagination. | Required |
| FR-API-008 | Correlation IDs MUST be diagnostic only and MUST NOT be treated as authentication, authorization, ordering, causation, or idempotency evidence. | Required |
| FR-API-009 | AutoPM retry MUST be bounded and limited to approved transient failures. | Required |
| FR-API-010 | Breaking representation or semantic changes MUST use an approved compatibility plan or new major version. | Required |

## Audit

| ID | Requirement | State |
| --- | --- | --- |
| FR-AUD-001 | Plan, workflow, completion, mileage, import, scheduler, and notification actions MUST create domain-appropriate audit evidence. | Required |
| FR-AUD-002 | Audit MUST include safe actor or process identity, event and recorded times, result, correlation, and applicable contract/rule/mapping versions. | Required |
| FR-AUD-003 | Corrections MUST retain previous evidence rather than concealing it. | Required |
| FR-AUD-004 | Audit MUST exclude secrets, credentials, authorization headers, raw webhook payloads, unredacted notification targets, and unnecessary personal data. | Required |
| FR-AUD-005 | Audit access, retention, privacy, correction, and deletion policy MUST be approved before production release. | Conditional |

## Requirement acceptance

Functional requirements are accepted only when:

- their blocking decisions are approved;
- provider and consumer behavior is implemented within the approved module boundary;
- linked workflow acceptance criteria pass;
- negative and failure cases pass;
- audit, security, compatibility, and rollback evidence is complete;
- the Product Owner accepts the release evidence.

See [User Workflows and Acceptance](USER_WORKFLOWS_AND_ACCEPTANCE.md) and [v1 Scope and Release Criteria](V1_SCOPE_AND_RELEASE_CRITERIA.md).

