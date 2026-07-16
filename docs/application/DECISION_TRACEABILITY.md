# FleetOS Application Decision Traceability

## Purpose and status

This document maps existing Application Blueprint headings and gates to existing numbered decision registries.

- Status: Derived documentation traceability
- New application requirements or identifiers: None
- Decisions resolved or deferred: None
- Runtime or deployment topology selected: None

The Application Blueprint continues to use document headings rather than a new identifier registry.

## Traceability matrix

| Existing application subject | Primary source locations | Governing existing decisions |
| --- | --- | --- |
| Module responsibilities and dependency direction | [Application Modules](APPLICATION_MODULES.md), FleetOS Application Blueprint sections 3, 6, and 7 | `domain:DEC-001`–`016`; applicable API, frontend, and backend decisions; proposed ADRs |
| AutoPM read interaction and read-model consumption | [Service Interactions](SERVICE_INTERACTIONS.md), [State Management](STATE_MANAGEMENT.md) | `api:DEC-001`–`018`; `frontend:DEC-002`, `007`–`010`, `016`, `020`; `backend:DEC-015`–`018` |
| PM Assistant command interaction | Service Interactions “PM Assistant command interaction” | `domain:DEC-005`–`008`, `015`; `backend:DEC-005`, `006`, `013`–`015`; `SDEC-005`, `006`, `014` |
| Vehicle, location, and organizational identity | Application modules and state authority sections | `domain:DEC-001`–`005`; `api:DEC-001`–`003`; `backend:DEC-001`–`003`; `SDEC-001`–`008` |
| Four status domains and schedule condition | State Management “Four status domains” and transition rules | `domain:DEC-006`, `007`, `009`–`011`; `api:DEC-004`, `005`, `008`; `backend:DEC-004`–`007`, `009` |
| Import and synchronization interaction | Service Interactions “Import interaction” | `domain:DEC-013`; `api:DEC-007`; `backend:DEC-008`; `SDEC-014` |
| Notification interaction | Service Interactions background/notification section | `domain:DEC-011`; `api:DEC-008`; `backend:DEC-009`; `SDEC-018` |
| Background jobs, identity, scheduling, and recovery | [Background Jobs](BACKGROUND_JOBS.md) | `domain:DEC-012`; `backend:DEC-010`; `IDEC-006`; `ODEC-003`, `005`, `008`, `012` |
| Authoritative, presentation, cache, request, and configuration state | State Management | `api:DEC-010`, `011`; `frontend:DEC-005`, `009`, `010`; `backend:DEC-015`–`017`; `SDEC-009`, `010` |
| Runtime lifecycle, readiness, degradation, shutdown, and recovery | [Application Lifecycle](APPLICATION_LIFECYCLE.md) | `api:DEC-015`; `backend:DEC-016`, `017`; `IDEC-001`, `008`–`010`; `ODEC-003`–`005`, `008`, `010`, `012` |
| Deployment units, configuration, rollout, and rollback | [Application Deployment](APPLICATION_DEPLOYMENT.md) | `backend:DEC-016`–`018`; `IDEC-001`–`012`; `SDEC-019`, `024`; `ODEC-009`, `011` |
| Security and authorization direction | FleetOS Application Blueprint section 11 and interaction boundaries | `api:DEC-009`, `012`–`016`; `backend:DEC-015`; `SDEC-001`–`024` |
| Observability, correlation, audit, and retention | Service Interactions correlation/error sections; Application Lifecycle observability | `domain:DEC-014`; `api:DEC-013`–`015`; `backend:DEC-012`, `017`; `SDEC-016`, `021`–`023`; `ODEC-001`–`008` |
| Compatibility and replacement lifecycle | Service Interactions compatibility; Application Lifecycle version/replacement sections | `api:DEC-011`, `017`, `018`; `frontend:DEC-020`; `backend:DEC-018`; `IDEC-012`; `ODEC-011` |

## Interpretation rules

- Application headings remain the controlling source for application-layer narrative.
- A cross-reference does not merge or reassign decision ownership.
- Scope-qualified identifiers are required for reused `DEC-*` prefixes.
- No application framework, service topology, queue, scheduler, cache, datastore, identity provider, or deployment platform is selected here.
