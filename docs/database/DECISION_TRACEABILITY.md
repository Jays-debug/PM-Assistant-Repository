# FleetOS Database Decision Traceability

## Purpose and status

This document maps existing database concepts and implementation gates to existing numbered decision registries.

- Status: Derived documentation traceability
- New database requirements or identifiers: None
- Decisions resolved or deferred: None
- Physical technology selected: None

Database documents continue to use their existing headings and conceptual-table names. This map avoids inventing a new database identifier registry.

## Traceability matrix

| Existing database subject | Primary source locations | Governing existing decisions |
| --- | --- | --- |
| Module and persistence boundary | [Database Blueprint](DATABASE_BLUEPRINT.md), [Schema Design](SCHEMA_DESIGN.md) | `domain:DEC-001`–`016`; `backend:DEC-016`; `IDEC-004`; `SDEC-019` |
| Vehicle identity, aliases, and reconciliation | Schema Design “Identity and key model”; Table Specification “Reference and identity” | `domain:DEC-001`, `domain:DEC-002`; `api:DEC-001`, `api:DEC-002`; `backend:DEC-001`, `backend:DEC-002` |
| Location and organizational identity | Schema Design “Reference and identity domain”; relevant conceptual tables | `domain:DEC-003`–`005`; `api:DEC-003`; `backend:DEC-003`; `SDEC-001`–`008` |
| PM plan, workflow, recurrence, completion, and history | Schema Design “Maintenance domain” and “Status model”; Table Specification “Maintenance” | `domain:DEC-006`–`008`; `api:DEC-005`; `backend:DEC-005`, `006`, `013` |
| Mileage readings and assessments | Schema Design mileage/status sections; Table Specification maintenance tables | `domain:DEC-009`, `010`; `api:DEC-004`, `005`; `backend:DEC-004`, `007` |
| Notifications | Table Specification “Notification and scheduler” | `domain:DEC-011`; `api:DEC-008`; `backend:DEC-009`; `SDEC-018` |
| Scheduler jobs and executions | Table Specification “Notification and scheduler” | `domain:DEC-012`; `backend:DEC-010`; `IDEC-006` |
| Import, synchronization, reconciliation, and quarantine | Schema Design import domain; Table Specification import/reconciliation section | `domain:DEC-013`; `api:DEC-007`; `backend:DEC-008`; `SDEC-014` |
| Audit, provenance, privacy, retention, correction, and deletion | Schema Design historical/audit/deletion sections; Table Specification audit section | `domain:DEC-014`; `api:DEC-012`, `013`; `backend:DEC-012`, `013`; `SDEC-016`, `017`, `021`; `ODEC-006` |
| External identity, concurrency, and idempotency | Schema Design key/integrity sections; Migration Strategy replay and recovery sections | `domain:DEC-015`; `backend:DEC-014`; `SDEC-014` |
| KPI/read projections and indexes | Schema Design read projections; Index Strategy access patterns | `domain:DEC-016`; `api:DEC-006`, `010`, `011`; `frontend:DEC-008`–`010`; `backend:DEC-011`, `017` |
| Production datastore and migration mechanism | Database Blueprint future decisions; Migration Strategy governance | `backend:DEC-016`; `IDEC-004`; `SDEC-019` |
| Backup, restore, recovery, and continuity | Migration Strategy backup/restore and recovery sections | `IDEC-010`, `IDEC-012`; `ODEC-010`, `011`; `SDEC-019` |
| Security, encryption, secrets, and database access | Database Blueprint security direction; Table Specification configuration/secrets | `IDEC-003`, `005`; `SDEC-003`–`008`, `010`, `015`, `019` |
| Migration, reconciliation, cutover, and stabilization thresholds | Migration Strategy phases and decision evidence | `api:DEC-018`; `backend:DEC-018`; `IDEC-009`, `012`; `ODEC-011` |

## Interpretation rules

- A mapping is a cross-reference, not an approval.
- Multiple decision scopes remain distinct even when they address the same subject.
- Unqualified `DEC-*` references are not used outside their owning documentation area.
- No table, column, key, engine, migration framework, retention period, or recovery target is selected here.
- The source database documents remain controlling for their existing conceptual content.
