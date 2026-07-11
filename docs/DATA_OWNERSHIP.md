# FleetOS Data Ownership

## Purpose and decision status

This document defines current, transitional, and target ownership for information shared by AutoPM and PM Assistant. It is an architecture contract, not evidence that a production API, authentication, Railway, PostgreSQL, or hosted synchronization service is operational.

Approved principles:

- PM Assistant is authoritative for PM plans, workflow status, completion status, PM history, notification state, and controlled import/synchronization audit.
- AutoPM is read-only for maintenance workflow information. It owns dashboard presentation, KPI visualization, filters, presentation labels, and temporary read cache.
- AutoPM must not write directly to PM Assistant persistence. Direct shared-database access is prohibited.
- Google Sheets and `Data Car.csv` are transitional upstream sources only. They are not authoritative for completion, maintenance history, or notification delivery.
- `vehicle_no` is a transitional matching key, not a permanently immutable enterprise identifier.
- Vehicle Master enterprise ownership, location identity, and current odometer source ownership remain unresolved.

## State model

### Current state

- AutoPM reads Google Sheets CSV or Apps Script JSON, with browser cache and `data.csv` fallbacks. It parses vehicle, registration, grouping, responsibility, plan, and mileage-related fields and derives dashboard mileage status.
- PM Assistant persists maintenance workflow records in SQLite, including PM plans, history, task state, weekly control, notifications, users, locations, imports, and a vehicle master populated in part from `Data Car.csv`.
- No approved FleetOS integration API or shared identity contract is operational.

### Transitional state

- AutoPM may continue reading its existing upstream feed and last-known-good cache.
- Google Sheets and `Data Car.csv` may feed controlled reconciliation and import processes.
- `vehicle_no` is used only for transitional cross-system matching, with ambiguity quarantined.
- PM Assistant remains authoritative for maintenance workflow domains even while AutoPM displays legacy-source data.

### Target state

- AutoPM reads approved, versioned PM Assistant interfaces or read models.
- PM Assistant publishes authoritative maintenance workflow data without exposing persistence tables.
- A FleetOS vehicle registry direction is established after enterprise Vehicle Master ownership is approved.
- `fleetos_vehicle_id` is reserved as the proposed future canonical internal vehicle identifier; it does not exist today.
- Accepted maintenance-mileage records are validated and owned by PM Assistant, while the upstream odometer producer remains explicitly identified.

## Source-of-truth matrix

“Controlled import” means ingestion through PM Assistant validation and audit boundaries. It never means an AutoPM database write.

| Domain | Current observed source | Transitional rule | Target authoritative owner | Create | Update | Read | Identifier / candidate | Conflict and synchronization rule | Audit requirement | Unresolved decisions |
|---|---|---|---|---|---|---|---|---|---|---|
| Vehicle identity | AutoPM has sheet row index, `vehicle_no`, and registration. PM Assistant has local `vehicle_master.id`, unique `vehicle_no`, vehicle code, and weekly-control registration. | Match by normalized `vehicle_no` only. Preserve registrations and vehicle codes as attributes/aliases. Quarantine ambiguous matches. | Proposed FleetOS vehicle registry; enterprise owner pending. | Controlled registry/import process after approval. | Controlled registry process after approval. | AutoPM and PM Assistant. | Transitional: `vehicle_no`. Future reserved candidate: `fleetos_vehicle_id` (not implemented). | Upstream to reconciliation; registry/read model to consumers. Ownership outranks timestamp. No automatic merges. | Source value, normalized value, match decision, aliases, actor/batch, timestamps, merge/split history. | Enterprise Vehicle Master owner; creation authority; lifecycle and reuse policy. |
| Vehicle master attributes | Sheet supplies registration, model, vehicle type, fleet, business type and other fields. PM Assistant vehicle master/Data Car supplies code, transport type, model, fleet and vehicle type. | Preserve provenance per field; do not blanket-overwrite conflicting records. | Proposed FleetOS registry direction; final enterprise owner pending. | Approved registry owner or controlled import. | Approved registry owner or controlled import. | Both systems. | Vehicle identity reference; no separate durable attribute identifier. | Field-level reconciliation. Approved value is published to AutoPM; conflicting imports are exceptions. | Before/after, source, batch, reviewer, effective time. | Owners of registration, model year, PM interval, fleet, and business type. |
| Fleet and business-unit grouping | AutoPM uses sheet fleet fields and column AK for business type. PM Assistant stores free-text fleet/transport type. No grouping master observed. | Preserve exact labels plus reviewed mappings. Do not silently merge Thai/English variants. | FleetOS grouping registry direction; owner pending. | Approved master owner/import. | Approved master owner/import. | Both systems. | No supported stable ID; current names are labels only. | Mapping is explicit and effective-dated. Target mapping/read model flows to AutoPM. | Mapping version, previous/new group, effective dates, affected vehicles. | Corporate source, hierarchy, whether transport type equals business unit, assignment history. |
| Location identity | PM Assistant has local integer ID and unique name; plans store location as text. | Exact-name matching only unless an approved alias exists. Renames must not silently detach history. | Unresolved; proposed future stable FleetOS location identity. | PM Assistant or approved location-master import during transition. | PM Assistant or approved location-master import during transition. | Both as required. | Local PM Assistant ID is not yet a shared ID; canonical name is a risky candidate. Future stable ID pending. | PM Assistant publishes approved location representation. Ambiguities are quarantined. | Create/update/rename/merge, aliases, affected records, source and actor. | Stable ID, enterprise owner, rename/merge and historical-name policy. |
| PM plan | AutoPM sheet contains forecast/plan fields. PM Assistant persists PM plan CRUD/import records. | Sheet records may be reconciled or imported but cannot overwrite authoritative plans directly. | PM Assistant. | PM Assistant UI/API or controlled import. | PM Assistant only. | Both; AutoPM read-only. | Current local `pm_plan.id`; external stable plan ID/idempotency key pending. | PM Assistant wins. PM Assistant to AutoPM through approved read interface. | Full lifecycle, before/after, actor/batch, timestamps, correlation/idempotency data when introduced. | Definition of one recurring plan and whether sheet plan dates are forecasts or import candidates. |
| PM mileage status (`pm_mileage_status`) | AutoPM derives status from remaining kilometres; sheet may also carry a status field. | Keep derived and source-reported status distinct and label freshness/source. | PM Assistant after accepted mileage ingestion and rule approval. | Derived by approved rule from accepted records. | Recomputed by PM Assistant when accepted input/rule changes. | Both; AutoPM presentation only. | Vehicle identity plus accepted measurement reference; pending. | Never overwrite workflow or completion status. PM Assistant publishes result and rule version. | Inputs, rule version, result, calculation time and source freshness. | Threshold approval and treatment of imported `remainingKm`. |
| PM workflow status (`pm_workflow_status`) | PM Assistant stores Planned/In Progress/Completed/Cancelled and derives Overdue from dates. | PM Assistant remains authoritative; legacy AutoPM labels are not workflow state. | PM Assistant. | PM Assistant. | PM Assistant. | Both; AutoPM read-only. | PM plan identity. | Valid transition graph only; PM Assistant to AutoPM. | Old/new status, reason, actor, timestamp, correlation. | Canonical vocabulary and authorization per transition. |
| Completion status (`completion_status`) | PM Assistant marks completion, records actual date, task completion state, history, and weekly-control linkage. | Never infer completion from mileage reset or sheet status. | PM Assistant. | PM Assistant. | PM Assistant, including controlled correction/reopen. | Both; AutoPM read-only. | PM plan identity; completion-event identity pending. | Authoritative explicit completion wins. PM Assistant to AutoPM. | Actor, actual time, evidence/reference, previous state, linked items, correction reason. | Required evidence, backdating and reopen policy. |
| PM history | PM Assistant persists `pm_history`; AutoPM has no authoritative history ledger observed. | Existing history is retained; corrections append rather than rewrite where feasible. | PM Assistant. | PM Assistant as a consequence of controlled actions. | Append-only; compensating events for corrections. | Approved views in both systems. | Local history ID plus PM plan association. | PM Assistant to AutoPM when history display is approved. | Actor/source, before/after, event time, correlation/import reference and retention. | Retention, privacy/deletion, referential handling after plan deletion. |
| Notification status (`notification_status`) | PM Assistant owns scheduler/settings, LINE targets, webhook events, task reminder state and delivery logs. AutoPM has presentation/copy actions only. | PM Assistant records every delivery attempt; AutoPM cannot declare delivery success. | PM Assistant. | PM Assistant orchestration. | PM Assistant orchestration/retry. | Both as authorized; AutoPM read-only. | Local notification log ID; business idempotency key pending. | Provider result recorded by PM Assistant wins. Retries link to original intent and are idempotent. | Intent, target, safe payload reference/hash, attempt, response, status, time, correlation; no secrets. | Retry/idempotency policy, retention, recipient authorization, scheduler ownership. |
| User and responsibility data | PM Assistant has local username/display name/role. AutoPM has free-text responsible values and presentation-only user labels. Authentication is not proven operational. | Do not map display/free-text names to users automatically. Use reviewed mappings. | Identity provider unresolved; PM Assistant proposed owner of maintenance responsibility assignments. | Approved identity/responsibility owner. | Approved identity/responsibility owner. | Both according to authorization. | Local username is not an enterprise identity; responsibility strings are labels. | Explicit mapping only; effective-dated assignments flow to AutoPM. | User lifecycle, role/assignment changes, provenance and effective dates. | Identity provider, auth model, person/team responsibility and role vocabulary. |
| Current odometer / PM mileage | Google Sheets/API is the observed AutoPM source; browser cache/data.csv are fallbacks. PM Assistant has no observed odometer entity. | Upstream readings are validated; conflicts and stale data are quarantined. AutoPM displays source/freshness. | PM Assistant proposed owner of accepted maintenance-mileage records after validation; upstream source owner unresolved. | Observed upstream producer; accepted-record creation by PM Assistant validation process. | Corrections through controlled PM Assistant process. | Both; AutoPM read-only. | No supported stable reading ID. Candidate relationship is vehicle plus measurement time, pending collision rules. | Upstream to PM Assistant validation; accepted records/status to AutoPM. Never prefer stale cache over a newer accepted record. | Raw/normalized reading, measured/received times, source/batch, validation outcome and correction chain. | Real odometer producer, timezone, reset/replacement, duplicate readings, source priority. |
| Import and synchronization records | PM Assistant stores import counts/errors. AutoPM stores payload/source/timestamp in browser storage. | Browser state remains ephemeral. Controlled PM Assistant imports and reconciliation are auditable and replay-safe. | PM Assistant. | PM Assistant import/sync boundary. | PM Assistant; original batch outcomes remain traceable. | Both may read presentation-safe status. | Local import ID; external batch/checksum/idempotency identifier pending. | One batch is idempotent. Partial/failed outcomes remain visible. Sync result flows to AutoPM. | Source, filename, checksum if approved, counts, row errors, actor, contract version, correlation and replay status. | Atomic vs partial import, checksum, retention, resume/replay policy. |

## Conflict scenarios and mandatory handling

| Scenario | Required handling |
|---|---|
| Same normalized `vehicle_no`, different registrations | Do not merge automatically. Preserve both source records and require review. |
| Same registration, multiple vehicle numbers | Treat registration as an alias conflict; quarantine and review historical reuse/change. |
| Vehicle code mistaken for vehicle number | Keep namespaces separate; reject implicit cross-field matching. |
| Sheet row index changes | Never use the index as cross-system identity. Re-match using transitional `vehicle_no`. |
| Vehicle appears in a PM plan but not the vehicle master | Preserve the plan; open an identity exception. Do not create a silent master duplicate. |
| Fleet/business labels differ by spelling or language | Preserve originals; apply only an approved mapping version. |
| Location text differs or a location is renamed | Resolve through reviewed aliases; retain the historical plan label. |
| AutoPM mileage status differs from PM workflow status | Retain both under separate names. Neither overwrites the other. |
| Sheet says completed but PM Assistant does not | PM Assistant completion status wins; flag discrepancy for reconciliation. |
| Odometer decreases | Quarantine unless an approved reset/replacement event explains it. |
| Same-time odometer readings disagree | Quarantine; apply approved source priority only after Product Owner approval. |
| AutoPM live source fails | Use last-known-good cache only as a labeled stale read view. Do not synchronize it back. |
| Import is replayed | Detect batch/idempotency match and avoid duplicate business records. |
| Partial import succeeds | Retain batch-level and row-level outcomes; do not represent the batch as fully reconciled. |

## Reconciliation and migration rules

1. Inventory distinct vehicle numbers, registrations, vehicle codes, fleet/BU labels, locations, users/responsibilities, plan records, and mileage readings from each approved source.
2. Preserve original Unicode values before normalization.
3. Classify matches as exact, normalized, ambiguous, missing, conflicting, or rejected.
4. Require reviewed dispositions for every ambiguous or conflicting identity.
5. Build versioned alias/mapping records; do not destructively replace historical labels.
6. Reconcile vehicle masters separately from plans, completion, history, notifications, and mileage.
7. Compare pre/post counts, unmatched records, status distributions, and AutoPM KPI totals.
8. Shadow-read target data before cutover and expose freshness/source metadata.
9. Do not remove transitional paths until acceptance criteria and rollback evidence are approved.
10. Do not treat a database-engine migration as a change of authoritative ownership.

## Audit rules

- Every controlled import or synchronization run must have a traceable batch record.
- Identity decisions require original and normalized values, source, decision, reviewer/actor and timestamp.
- Workflow status, completion, history, notification and accepted-mileage changes require correlation to their initiating action.
- Audit records must exclude secrets and credentials.
- Corrections should append compensating evidence rather than conceal the original event.
- Retention periods remain unresolved and require approval before production implementation.

## Rollback rules

- AutoPM may retain a last-known-good read path during staged cutover, clearly marked with source and age.
- Rollback changes AutoPM's read route/version or feature flag; it does not transfer workflow authority away from PM Assistant.
- Do not reverse-sync PM Assistant workflow data into Google Sheets as rollback.
- Preserve pre-import backups, batch reports, mapping versions and raw input references.
- Mapping and calculation-rule releases must be versioned and reversible.
- Raw accepted mileage readings remain intact if a derived-status rule is rolled back.
- Documentation changes can be reverted as one isolated change set.

## Unresolved decisions

- Enterprise Vehicle Master owner and `fleetos_vehicle_id` creation/lifecycle authority.
- Fleet/business-unit hierarchy and grouping master owner.
- Stable location identifier, owner, rename, merge and history rules.
- Odometer producer, source priority, reset/replacement and duplicate-reading policy.
- PM mileage thresholds and whether remaining kilometres are imported or recalculated.
- User identity provider, authentication, authorization and responsibility model.
- Stable external PM plan/event identifiers and idempotency format.
- Import atomicity, retention, checksum and replay policy.
- Audit retention and deletion/privacy policy.

