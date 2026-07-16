# FleetOS Requirements Traceability Matrix

## Purpose and status

This matrix maps existing FleetOS product requirements to existing acceptance and validation evidence.

- Status: Derived documentation traceability
- Requirements created: None
- Acceptance criteria created: None
- Decisions resolved: None
- Implementation authorization: None

A range row applies to every identifier in that contiguous range. Where no direct product acceptance criterion exists, the gap is stated explicitly rather than filled with a new requirement or criterion.

## Source legend

- Functional and non-functional requirements: [Functional Requirements](FUNCTIONAL_REQUIREMENTS.md) and [Non-Functional Requirements](NON_FUNCTIONAL_REQUIREMENTS.md)
- Product acceptance: [User Workflows and Acceptance](USER_WORKFLOWS_AND_ACCEPTANCE.md)
- Release evidence: [v1 Scope and Release Criteria](V1_SCOPE_AND_RELEASE_CRITERIA.md)
- Architecture-area validation: linked validation and rollout documents

Scope-qualified validation notation is used where `VAL-*` is reused:

- `api:VAL-*`
- `frontend:VAL-*`
- `backend:VAL-*`

## Functional requirement traceability

| Requirement IDs | Existing product acceptance evidence | Existing validation or release evidence | Coverage |
| --- | --- | --- | --- |
| `FR-PLT-001`–`008` | `AC-PLAN-003`, `AC-PLAN-006`, `AC-DAS-006` | `RC-02`, `RC-05`, `RC-10`; architecture-area ownership and rollback validation | Partial: module availability, write prohibition, and rollback are covered; no direct product AC exists for every platform requirement. |
| `FR-ID-001`–`010` | `AC-ID-001`–`005` | `RC-03`; domain, API, frontend, backend, and security identity validation | Direct workflow coverage, subject to unresolved identity decisions. |
| `FR-PLAN-001`–`008` | `AC-PLAN-001`–`006` | `RC-04`; backend use-case and transaction validation | Direct workflow coverage; recurring-plan behavior remains conditional. |
| `FR-LOC-001`–`006` | `AC-LOC-001`–`004` | `RC-03`, `RC-04`; domain and backend identity validation | Direct workflow coverage; stable identity remains conditional. |
| `FR-STS-001`–`007` | `AC-PLAN-004`, `AC-MIL-004`, `AC-CMP-002`, `AC-CMP-005`, `AC-NOT-002`, `AC-NOT-004`, `AC-DAS-003`, `AC-DAS-004` | `RC-04`, `RC-05`; API, frontend, and backend status validation | Direct cross-workflow coverage. |
| `FR-MIL-001`–`007` | `AC-MIL-001`–`005` | `RC-03`, `RC-04`; domain, API, backend, and database validation | Direct workflow coverage, subject to mileage decisions. |
| `FR-CMP-001`–`004` | `AC-CMP-001`–`005` | `RC-04`; domain and backend lifecycle validation | Direct workflow coverage, subject to correction/reopen decisions. |
| `FR-HIS-001`–`005` | `AC-HIS-001`–`005` | `RC-04`, `RC-06`; security, privacy, backend, and operations validation | Direct workflow coverage, subject to access and retention decisions. |
| `FR-NOT-001`–`008` | `AC-NOT-001`–`005` | `RC-04`, `RC-06`, `RC-07`; backend and security provider validation | Direct workflow coverage, subject to recipient, retry, and retention decisions. |
| `FR-SCH-001`–`006` | `AC-SCH-001`–`004` | `RC-04`, `RC-07`; backend runtime, infrastructure, and operations validation | Direct workflow coverage, subject to execution-topology decisions. |
| `FR-IMP-001`–`009` | `AC-IMP-001`–`006` | `RC-03`, `RC-04`, `RC-08`; backend, database, security, and operations validation | Direct workflow coverage, subject to replay and atomicity decisions. |
| `FR-DAS-001`–`008` | `AC-DAS-001`–`006` | `RC-04`, `RC-05`, `RC-09`, `RC-10`; `frontend:VAL-008`–`017` | Direct workflow coverage, subject to KPI, freshness, and cutover decisions. |
| `FR-API-001`–`010` | `AC-DAS-001`, `AC-DAS-002`, `AC-DAS-004`, `AC-DAS-006`, `AC-AUD-002`; cross-workflow provider/consumer contract acceptance | `RC-05`, `RC-06`, `RC-10`; `api:VAL-008`–`016`; `backend:VAL-012`–`018` | Partial: contract behavior is covered, but no product `AC-API-*` registry exists. |
| `FR-AUD-001`–`005` | `AC-AUD-001`–`005` | `RC-06`, `RC-07`; security and operations validation | Direct workflow coverage, subject to access, privacy, and retention decisions. |

## Non-functional requirement traceability

| Requirement IDs | Existing product acceptance evidence | Existing validation or release evidence | Coverage |
| --- | --- | --- | --- |
| `NFR-SEC-001`–`015` | `AC-HIS-004`, `AC-NOT-005`, `AC-AUD-003`, plus applicable negative workflow cases | `RC-06`; `SVAL-007`–`015` in [Security Validation and Rollout](../security/SECURITY_VALIDATION_AND_ROLLOUT.md) | Partial: security validation exists, but there is no direct product AC for every security requirement. |
| `NFR-REL-001`–`011` | `AC-PLAN-006`, `AC-SCH-002`–`004`, `AC-DAS-002`, `AC-DAS-006` | `RC-07`, `RC-08`, `RC-10`; `backend:VAL-013`–`017`; `OVAL-011`–`014` | Partial: workflow and operational validation cover the range; quantitative objectives remain unresolved. |
| `NFR-PERF-001`–`008` | No direct product acceptance-criterion registry | `RC-07`; `api:VAL-009`, `010`, `014`–`016`; `frontend:VAL-015`–`018`; backend performance validation | Gap retained: implementation thresholds and direct product acceptance remain unapproved. |
| `NFR-DQ-001`–`010` | `AC-ID-001`–`005`, `AC-MIL-002`–`003`, `AC-IMP-002`–`004`, `AC-AUD-004` | `RC-03`, `RC-04`, `RC-08`; Unicode, reconciliation, database, API, and backend validation | Partial-to-direct coverage depending on the data domain; numerical thresholds remain unresolved. |
| `NFR-USA-001`–`009` | `AC-PLAN-002`, `AC-DAS-001`–`005`, and cross-workflow acceptance | `RC-09`; `frontend:VAL-009`–`016` | Partial: usability direction is covered; final supported presentation matrix remains unresolved. |
| `NFR-ACC-001`–`008` | Cross-workflow keyboard, responsive, Thai-text, and failure-state acceptance; no dedicated product `AC-ACC-*` registry | `RC-09`; `A11Y-001`–`018` and `frontend:VAL-012`, `013`, `016`, `018` | Gap retained: detailed frontend validation exists, but direct product acceptance IDs do not. |
| `NFR-VAL-001`–`007` | `AC-PLAN-002`, `AC-ID-002`, `AC-DAS-002`, `AC-AUD-002` | `RC-05`, `RC-06`; API error validation and `backend:VAL-011`–`012` | Partial: representative workflows are covered; no dedicated product AC exists for every error class. |
| `NFR-OBS-001`–`006` | `AC-SCH-003`, `AC-IMP-006`, `AC-AUD-001`–`005` | `RC-07`; `OVAL-011`–`015`; security detection and audit validation | Partial: required evidence is mapped; platforms, thresholds, ownership, and retention remain unresolved. |
| `NFR-COM-001`–`006` | `AC-DAS-004`, `AC-DAS-006`; cross-workflow provider/consumer contract acceptance | `RC-05`, `RC-10`; API compatibility rules `COMP-001`–`012` and `api:VAL-009`–`016` | Partial: compatibility direction is explicit; sunset and migration-window decisions remain unresolved. |
| `NFR-MNT-001`–`006` | No direct product acceptance-criterion registry | `RC-01`, `RC-10`; [Engineering Review and Release Checklists](../engineering/REVIEW_RELEASE_CHECKLISTS.md) and architecture-area rollback validation | Gap retained: governance evidence exists, but direct product acceptance IDs do not. |

## Traceability limitations

- This matrix does not assert that mapped criteria have passed.
- Conditional requirements remain conditional.
- Runtime validation gates remain future work unless implementation evidence exists.
- A many-to-many mapping does not replace test-case-level traceability for an approved implementation scope.
- Missing direct product criteria are reported as gaps; they are not silently created here.
