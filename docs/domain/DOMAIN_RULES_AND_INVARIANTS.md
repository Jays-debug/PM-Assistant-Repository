# FleetOS Domain Rules and Invariants

## Purpose

This document defines fixed domain direction, invariants that must remain true, mandatory conflict handling, and unresolved Product Owner decisions. It does not invent policy where the architecture, product specification, or contracts identify an approval gate.

## Domain-rule catalog

| ID | Domain rule | State and rationale |
| --- | --- | --- |
| `DR-001` | PM Assistant is authoritative for PM plans, workflow, completion, maintenance history, notification state, and controlled import/synchronization audit. | Fixed FleetOS ownership direction. |
| `DR-002` | AutoPM is read-only for maintenance workflow information and owns presentation, filters, labels, KPI visualization, and temporary cache. | Fixed module boundary. |
| `DR-003` | Cross-module maintenance reads use an approved versioned interface or approved read model; direct shared-database access is prohibited. | Fixed architecture boundary. |
| `DR-004` | Transitional vehicle matching uses only `vehicle_no` under an approved, versioned normalization rule while preserving original values and provenance. | Fixed transition direction; detailed normalization remains `DEC-002`. |
| `DR-005` | Identity classifications exact, normalized, ambiguous, conflicting, missing, and rejected remain distinct. | Fixed identity contract. |
| `DR-006` | Registration, vehicle code, vehicle number, fleet, business unit, transport type, location, responsibility, person, and team occupy distinct namespaces unless an approved mapping says otherwise. | Prevents implicit cross-field identity. |
| `DR-007` | Domain ownership outranks timestamp when authoritative and non-authoritative values conflict. | Fixed conflict priority. |
| `DR-008` | `pm_mileage_status`, `pm_workflow_status`, `completion_status`, `notification_status`, and schedule condition retain separate meanings. | Fixed status rule. |
| `DR-009` | Completion results only from an explicit authorized PM Assistant action and creates preserved completion/history/audit evidence. | Fixed completion rule; evidence policy remains `DEC-007`. |
| `DR-010` | A mileage assessment is derived only from an accepted reading using an approved versioned rule; missing authority or rule yields unknown/unavailable behavior, never a guess. | Conditional target after `DEC-009` and `DEC-010`. |
| `DR-011` | Notification intent and notification attempts are separate; every attempt remains linked to its intent. | Fixed target requirement; retry/idempotency remains `DEC-011`. |
| `DR-012` | One approved scheduler execution owner produces one accepted business outcome per approved job identity; non-acquired duplicates are safely skipped and observable. | Fixed target outcome; mechanism remains `DEC-012`. |
| `DR-013` | Controlled import parses, validates, normalizes, and classifies before authoritative mutation; preview has no business mutation and confirmation is explicit. | Fixed import direction. |
| `DR-014` | Every received import row and every batch retains a traceable outcome, including partial, rejected, ambiguous, cancelled, interrupted, or failed outcomes. | Fixed auditability direction. |
| `DR-015` | Replayed command, intent, scheduler execution, import, or synchronization work must not create duplicate business outcomes under an approved idempotency scope. | Direction fixed; formats and exact semantics remain `DEC-011`, `DEC-012`, `DEC-013`, `DEC-015`. |
| `DR-016` | Original source values, historical aliases/labels, accepted readings, prior events, and superseded decisions remain traceable through correction and rollback. | Fixed preservation rule. |
| `DR-017` | Cancellation, correction, reopening, re-completion, merge, split, rename, and deletion preserve prior evidence and do not silently detach history. | Fixed preservation direction; allowed actions remain decision-dependent. |
| `DR-018` | Audit is domain-appropriate, correlation-aware, version-aware, and secret-safe. | Fixed audit/security direction. |
| `DR-019` | AutoPM fallback/cache remains labeled with source and age and is never reverse-synchronized to PM Assistant. | Fixed transitional and rollback rule. |
| `DR-020` | Physical persistence, identifier type, ORM structure, migration framework, hosting, and runtime topology cannot change domain ownership. | Fixed technology-independent rule. |

## Invariant catalog

| ID | Invariant |
| --- | --- |
| `INV-001` | FleetOS remains the parent platform and AutoPM and PM Assistant remain separate bounded modules. |
| `INV-002` | PM Assistant remains authoritative for maintenance workflow information. |
| `INV-003` | AutoPM cannot mutate authoritative maintenance workflow information. |
| `INV-004` | AutoPM and PM Assistant never share persistence through direct table access. |
| `INV-005` | `vehicle_no` is never represented as a permanent immutable enterprise identity. |
| `INV-006` | `fleetos_vehicle_id` is never fabricated or described as implemented before its approved identity lifecycle exists. |
| `INV-007` | A sheet row/index or database-local integer never becomes a shared FleetOS identity merely through reuse or API exposure. |
| `INV-008` | Vehicle number, registration, and vehicle code are never substituted for one another implicitly. |
| `INV-009` | Ambiguous or conflicting identities are never guessed, auto-selected by row order/timestamp, or silently merged. |
| `INV-010` | The four exact status domains never overwrite, infer, or stand in for one another. |
| `INV-011` | Schedule condition never becomes `pm_workflow_status` without an explicit Product Owner-approved contract. |
| `INV-012` | Completion never results from mileage, sheet label, elapsed time, workflow status, dashboard state, or notification outcome. |
| `INV-013` | A correction or reopen never conceals the prior completion, history, source, or reconciliation evidence. |
| `INV-014` | Historical plan vehicle/location labels remain available after approved identity or location change. |
| `INV-015` | An accepted mileage reading remains intact when a rule is recalculated or rolled back. |
| `INV-016` | Every notification attempt belongs to exactly one notification intent. |
| `INV-017` | AutoPM cannot declare provider delivery success. |
| `INV-018` | A duplicate scheduler acquisition produces no duplicate accepted business outcome and remains observable as skipped or equivalent approved evidence. |
| `INV-019` | Every received import row has a traceable disposition within its batch. |
| `INV-020` | A partial import or synchronization outcome is never represented as fully successful or fully reconciled. |
| `INV-021` | AutoPM browser cache is never an import, reconciliation, or synchronization source. |
| `INV-022` | Domain ownership wins over `updated_at`, received time, or other timestamps during source conflict. |
| `INV-023` | Valid zero/empty, missing, unknown, stale, ambiguous, conflicting, unauthorized, and unavailable states remain distinguishable. |
| `INV-024` | Audit, errors, logs, history projections, and examples contain no secrets, raw credentials, unsafe targets, raw webhook payloads, or unnecessary sensitive content. |
| `INV-025` | A correlation ID never serves as authentication, authorization, causation, ordering, or idempotency evidence. |
| `INV-026` | A persistence, hosting, deployment, or database-engine change never transfers domain ownership. |

## Conflict and reconciliation rules

| Conflict | Mandatory handling | Related rules |
| --- | --- | --- |
| Same normalized `vehicle_no`, different registrations | Preserve every source record; classify as ambiguous/conflicting; quarantine and review. | `DR-004`–`DR-006`, `INV-009` |
| Same registration, multiple vehicle numbers | Treat as alias conflict or possible reuse/change; never merge automatically. | `DR-006`, `INV-008`, `DEC-002` |
| Vehicle code appears equal to a vehicle number | Retain distinct namespaces and reject implicit cross-field matching. | `DR-006`, `INV-008` |
| Sheet row position changes | Ignore it for shared identity; repeat approved transitional matching. | `INV-007` |
| Plan refers to a missing Vehicle Master candidate | Preserve the plan and open an identity exception; do not silently create a canonical vehicle. | `DR-005`, `INV-009` |
| Fleet/business labels differ by spelling, abbreviation, or language | Preserve originals; apply only an approved mapping/version/effective period. | `DR-006`, `DR-016`, `DEC-004` |
| Location is renamed or text differs | Preserve plan-time label; use exact canonical name or approved alias; quarantine ambiguity. | `INV-014`, `DEC-003` |
| AutoPM mileage status differs from PM workflow status | Retain both under exact separate names and preserve source/freshness. | `DR-008`, `INV-010` |
| Sheet/legacy value says completed but PM Assistant does not | PM Assistant completion remains authoritative; record discrepancy for reconciliation. | `DR-001`, `DR-007`, `DR-009` |
| Odometer decreases | Quarantine unless an approved reset/replacement/correction explains the sequence. | `DR-010`, `DEC-009` |
| Same-time mileage readings disagree | Quarantine unless an approved source-priority/collision policy resolves the case. | `DR-010`, `DEC-009` |
| AutoPM live source fails | Use only a labeled last-known-good presentation path; never synchronize it back. | `DR-019`, `INV-021` |
| Import is replayed | Detect the approved replay identity and avoid duplicate business outcomes; preserve replay disposition. | `DR-015`, `DEC-013` |
| Import is partly accepted | Preserve batch and row results and publish a partial outcome, not full success. | `DR-014`, `INV-019`, `INV-020` |
| Concurrent authoritative command | Reject, serialize, or reconcile under the approved concurrency policy; timestamps alone do not decide. | `DR-007`, `DEC-015` |

## Idempotency direction

Idempotency means repeated handling of the same approved business request does not create unintended duplicate business outcomes.

| Scope | Required direction | Unresolved design |
| --- | --- | --- |
| Future PM plan/completion commands | Duplicate/concurrent requests yield one consistent accepted business outcome and traceable replay/conflict evidence. | Command identity, key format, scope, expiry, response replay, and concurrency (`DEC-015`). |
| Notification | Duplicate intent does not produce an unintended duplicate delivery; retries remain attempts of one intent. | Business scope, recipient/channel/message changes, expiry, retry count (`DEC-011`). |
| Scheduler | One business outcome per approved job occurrence; duplicate execution is safely skipped/observed. | Job occurrence identity, lock/lease, overlap, misfire, restart (`DEC-012`). |
| Import | Replayed source does not duplicate accepted domain records and retains replay disposition. | Checksum, source reference, scope, partial/resume behavior, expiry (`DEC-013`). |
| Synchronization | Repeating a run does not conceal or duplicate reconciliation decisions and publishes accurate freshness/outcome. | Run identity and acceptance thresholds (`DEC-013`, `DEC-015`). |

The following are not sufficient idempotency identities without approval: correlation ID, filename, timestamp, database-local ID, provider response, row order, or `vehicle_no` alone.

## Historical-data preservation

1. Preserve original Unicode source values before normalization.
2. Retain normalized comparison values and normalization version separately.
3. Preserve registration, vehicle-code, location, fleet/business, and responsibility labels with provenance.
4. Preserve plan-time vehicle and location evidence after later mapping or rename.
5. Preserve accepted mileage readings and create new assessment evidence for recalculation.
6. Preserve original completion and history when correcting or reopening.
7. Preserve notification attempt chain, including failed and skipped outcomes.
8. Preserve scheduler duplicate/failure evidence.
9. Preserve import preview, confirmation/cancellation, row outcomes, source reference, mapping/rule versions, and replay disposition.
10. Preserve reconciliation decisions and record supersession rather than destructive replacement.
11. Preserve raw evidence through rollback while changing active mapping/calculation versions only under approved procedure.

## Deletion, cancellation, correction, and reopening direction

- Cancellation is a business state/action, not physical deletion. It records reason, actor/process, time, previous state, and effects.
- Physical or logical deletion policy is unresolved and must not detach or conceal history.
- Correction appends or supersedes with traceable evidence; it does not rewrite the past without lineage.
- Reopen retains original completion evidence and creates a new lifecycle fact.
- Merge/split/retire behavior for vehicle or location identity is unresolved and cannot reuse or renumber issued canonical identities if later introduced.
- Privacy/deletion obligations require domain-specific policy and must be reconciled with audit/history preservation through `DEC-014`.

## Unresolved Product Owner decision register

| ID | Decision required | Blocks or affects |
| --- | --- | --- |
| `DEC-001` | Enterprise Vehicle Master owner; `fleetos_vehicle_id` type, generator, uniqueness, storage, API representation, merge, split, retirement, and creation authority. | Canonical vehicle registry and identity lifecycle. |
| `DEC-002` | `vehicle_no` change/reuse policy; normalization corpus; Thai/Arabic digit and punctuation handling; registration uniqueness, province, change, and reuse; alias approval. | Transitional reconciliation acceptance. |
| `DEC-003` | Location owner; stable identity; creation, rename, merge, alias, retirement/deletion, and historical-name policy. | Location lifecycle and target identity. |
| `DEC-004` | Fleet/business-unit/transport-type/PM-group semantics, owners, hierarchy, mapping, identity, effective dating, and assignment history. | Organizational grouping and KPI filtering. |
| `DEC-005` | Identity provider; human/service identity; role vocabulary; permission matrix; person/team responsibility; provisioning, review, revocation, and emergency access. | Protected actions and actor interpretation. |
| `DEC-006` | Canonical PM workflow vocabulary, schedule-condition representation, allowed transitions, reasons, authorization, cancellation, and pause/follow-up/weekly-control placement. | `VO-008`, `ST-001`–`ST-003`, API representation. |
| `DEC-007` | Completion vocabulary, required evidence, effective/recorded time, backdating, correction, reopen, re-completion, linked task/weekly effects, deletion/tombstone, and authorization. | `ENT-007`, `VO-009`, `ST-004`–`ST-006`. |
| `DEC-008` | Definition and identity of a recurring PM plan, recurrence boundaries, versioning, and relationship between forecast and plan occurrence. | Recurring-plan domain behavior. |
| `DEC-009` | Odometer producer/owner, source priority, unit, timezone, measured/received time, freshness, duplicate/collision, decrease, reset/replacement, correction, and acceptance policy. | `ENT-009`, `ST-015`. |
| `DEC-010` | Mileage inputs, thresholds, boundary behavior, imported remaining distance versus recalculation, rule versioning, recalculation, and unknown/unavailable behavior. | `ENT-010`, `VO-010`, `ST-016`. |
| `DEC-011` | Notification recipient/reference authorization, intent identity, duplicate suppression, provider outcome mapping, retryability, bounded retry, expiry, redaction, diagnostics, and retention. | `ENT-011`, `ENT-012`, `ST-007`–`ST-009`. |
| `DEC-012` | Scheduler business-job identity, execution owner/topology, timezone, locking/lease, overlap, concurrency, misfire, retry, restart, recovery, and stop behavior. | `ENT-013`, `ENT-014`, `ST-010`. |
| `DEC-013` | Import/sync batch identity, checksum, replay scope, atomicity, confirmation, partial behavior, resume/interruption, exception thresholds, cancellation, and retention. | `ENT-015`–`ENT-017`, `ST-011`–`ST-014`. |
| `DEC-014` | History/audit/log access, actor visibility, privacy, correction, deletion, legal/operational retention, immutability, and safe legacy projection. | `ENT-008`, `ENT-018`, audit production readiness. |
| `DEC-015` | Stable external plan/event/import identifiers; write-command contract; optimistic versioning/concurrency; idempotency identity, scope, expiry, and replay response. | Future commands and consistency implementation. |
| `DEC-016` | KPI definitions, counted populations, filters, calculation versions, freshness/staleness thresholds, configuration ownership, and configuration change audit. | AutoPM reporting and summary acceptance. |

## Rules for resolving decisions

- A decision is resolved only by explicit Product Owner approval recorded in an authoritative document or accepted/superseding ADR as appropriate.
- Source code, current database constraints, current labels, frontend thresholds, filenames, or deployment defaults cannot resolve a decision automatically.
- A decision that changes module ownership, identity meaning, status meaning, integration style, persistence strategy, security architecture, or deployment topology requires review against existing ADRs and may require a new or superseding ADR.
- Physical design must not begin for a blocked concept until its required business decisions are sufficiently resolved.

## Domain-model acceptance checklist

- [ ] Every rule and invariant is consistent with FleetOS ownership and module boundaries.
- [ ] Every decision-dependent statement cites a `DEC` identifier.
- [ ] No current table/model/route/calculation is promoted automatically into target policy.
- [ ] The four status domains and schedule condition remain separate.
- [ ] Identity ambiguity, conflict, history, audit, correction, replay, and partial outcomes are explicit.
- [ ] No physical database, ORM, migration, hosting, or identifier strategy is selected.
- [ ] No secret or unsafe sensitive value appears in examples or requirements.
- [ ] Product Owner accepts the baseline before implementation design.

