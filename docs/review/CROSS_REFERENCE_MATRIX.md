# FleetOS Cross-Reference Matrix

## Purpose

This document records how the existing FleetOS documentation relates across authority, architecture areas, ownership, concepts, identifiers, decisions, validation, and implementation readiness.

It does not promote a Proposed source, resolve a conflict, create a requirement, or replace any governing document.

## Authority and precedence

The review applies the precedence expressed by the Engineering Standard and repository governance:

| Level | Source | Review interpretation |
| ---: | --- | --- |
| 1 | Explicit Product Owner direction for the current task | Controls approved scope and actions. |
| 2 | `AGENTS.md` | Controls repository workflow, change boundaries, and approval. |
| 3 | Approved architecture decisions and specialized contracts | Control their accepted subject areas. Sources marked Proposed retain Proposed status. |
| 4 | FleetOS Engineering Standard | Controls engineering practice without replacing architecture decisions. |
| 5 | Development Guide and `CONTRIBUTING.md` | Supporting workflow guidance. |
| 6 | Existing implementation patterns | Evidence only when not conflicting with higher authority. |

Current authority caveat:

- `FLEETOS_ARCHITECTURE.md` describes the high-level architecture as approved.
- ADR-0001, ADR-0002, ADR-0003, `API_CONTRACT.md`, and `API_ERROR_MODEL.md` remain `Proposed`.
- The Blueprint and later area documents correctly retain proposed and unresolved status.
- This review does not decide which source status should change.

## Architecture-area document matrix

| Area | Index or controlling overview | Primary detailed documents | Primary dependencies | Primary consumers |
| --- | --- | --- | --- | --- |
| Governance | `AGENTS.md`, `FLEETOS_DEVELOPMENT_GUIDE.md` | Engineering Standard, contribution guide | Product Owner direction | All repository work |
| Architecture | `docs/FLEETOS_ARCHITECTURE.md` | ADR-0001 through ADR-0003 | Governance | All architecture areas |
| Blueprint | `docs/blueprint/README.md` | FleetOS v1 Blueprint, system context, data flow, runtime, roadmap | Architecture, ownership, identity, API, engineering | Product through operations |
| Product | `docs/product/README.md` | Specification, roles, FRs, NFRs, workflows, release criteria | Architecture and Blueprint | Domain, application, frontend, backend, validation |
| Data ownership | `docs/DATA_OWNERSHIP.md` | Source-of-truth matrix, conflict, audit, rollback | Architecture and ADR-0002 | Domain, database, API, application, security, operations |
| Identity | `docs/IDENTITY_CONTRACT.md` | Matching, normalization, classification, audit, migration | Architecture and ownership | Domain, database, API, frontend, backend, security |
| Domain | `docs/domain/README.md` | Model, entities, aggregates, lifecycle, events, rules | Product, ownership, identity | Database, API, application, frontend, backend |
| Database | `docs/database/README.md` | Blueprint, schema, tables, indexes, migration | Domain, ownership, identity, API | Backend, infrastructure, operations |
| API | `docs/api/README.md` plus root Proposed contracts | Blueprint, endpoints, models, errors, compatibility, validation | Architecture, ownership, identity, domain, database | AutoPM/frontend, backend, security, operations |
| Application | `docs/application/README.md` | Modules, interactions, jobs, state, deployment, lifecycle | Product, domain, database, API | Frontend, backend, infrastructure, operations |
| Frontend | `docs/frontend/README.md` | IA, pages, components, state, UX, validation | Product, domain, API, application | AutoPM and PM Assistant presentation implementation |
| Backend | `docs/backend/README.md` | Modules, services, use cases, repositories, transactions, runtime, rollout | Product, domain, database, API, application | PM Assistant implementation, infrastructure, operations |
| Infrastructure | `docs/infrastructure/README.md` | Environments, network, storage, CI/CD, monitoring, scaling, DR | Application, backend, database, security requirements | Runtime and operations implementation |
| Security | `docs/security/README.md` | Blueprint, identity, access, privacy, app security, supply chain, threats, rollout | All architecture areas | All implementation and release work |
| Operations | `docs/operations/README.md` | Monitoring, logs, health, incidents, SLOs, continuity, rollout | Application, backend, infrastructure, security | Production-readiness and support |

## Core architecture concept matrix

| Concept | Governing direction | Supporting areas | Consistency result |
| --- | --- | --- | --- |
| Parent platform | FleetOS | All areas | Consistent |
| Existing module names | AutoPM and PM Assistant remain unchanged | Governance, architecture, product, all Blueprints | Consistent |
| Module boundary | Separate bounded, deployment, and rollback units | Architecture, ADRs, application, infrastructure, operations | Consistent |
| Maintenance workflow owner | PM Assistant | Architecture, ownership, product, domain, database, API, backend | Consistent |
| Presentation owner | AutoPM for dashboard/KPI presentation | Architecture, ownership, product, frontend | Consistent |
| Cross-module writes | AutoPM writes prohibited in v1 direction | ADRs, API, application, frontend, backend, security | Consistent |
| Persistence access | Direct shared-database access prohibited | All architecture areas | Consistent |
| Read integration | Approved read model or versioned API | Architecture, ADR-0003, API, application, frontend | Consistent except malformed ADR-0003 notation |
| Transitional vehicle key | `vehicle_no` | Ownership, identity, domain, database, API, frontend, backend | Consistent |
| Canonical vehicle key | `fleetos_vehicle_id` proposed and unimplemented | All data-facing areas | Consistent |
| Status domains | Mileage, workflow, completion, notification remain separate | Product, domain, ownership, API, application, frontend, backend, operations | Consistent |
| Schedule condition | Separate from workflow unless approved otherwise | Domain, API, product, backend | Consistent and unresolved |
| Legacy sources | Transitional evidence, not workflow authority | Ownership, Blueprint, product, database, application | Consistent |
| Target technologies | Not operational merely because documented | Engineering, all Blueprints | Consistent |

## Data ownership matrix

| Domain | Current or transitional evidence | Target authority direction | AutoPM permission | Primary unresolved source |
| --- | --- | --- | --- | --- |
| Vehicle identity | Sheet data and PM Assistant local vehicle master | Proposed FleetOS registry; enterprise owner unresolved | Read only | `domain:DEC-001`, `api:DEC-001`, `backend:DEC-001` |
| Vehicle attributes | Multiple legacy sources with field-level provenance | Approved registry owner | Read only | Domain and backend identity decisions |
| Location | PM Assistant local ID/name and plan text | Stable FleetOS identity after ownership approval | Read only | `domain:DEC-003` |
| Fleet/business grouping | Free-text and source labels | Approved grouping registry | Presentation/filtering only | `domain:DEC-004` |
| PM plan | PM Assistant persistence; Sheet plan evidence | PM Assistant | Read only | Workflow and recurring-plan decisions |
| Workflow status | PM Assistant generic/current state | PM Assistant with approved vocabulary | Read only | `domain:DEC-006` |
| Completion | PM Assistant completion/history evidence | PM Assistant | Read only | `domain:DEC-007` |
| PM history | PM Assistant history | PM Assistant | Approved projection only | Retention/privacy decisions |
| Mileage reading | Upstream source not settled | PM Assistant owns accepted maintenance-mileage record after validation | Read only | `domain:DEC-009` |
| Mileage status | AutoPM current calculation evidence | PM Assistant after accepted input and rule approval | Presentation only | `domain:DEC-010` |
| Notifications | PM Assistant scheduler/provider/log evidence | PM Assistant | Read-only safe status | `domain:DEC-011` |
| Scheduler | PM Assistant in-process APScheduler evidence | PM Assistant logical ownership; topology unresolved | None | `domain:DEC-012` |
| Import/sync | PM Assistant imports and AutoPM cache metadata | PM Assistant controlled boundary | Safe status read only | `domain:DEC-013` |
| Audit | Multiple current evidence forms | Owning domain with protected evidence | Authorized projection only | `domain:DEC-014` |

## Identity matrix

| Identity | Current state | Transitional rule | Target state | Readiness |
| --- | --- | --- | --- | --- |
| Vehicle | Local IDs, `vehicle_no`, registration, code, row position | Match only by approved normalized `vehicle_no`; quarantine ambiguity | Future `fleetos_vehicle_id` after owner/lifecycle approval | Blocked |
| Location | PM Assistant local integer ID and name; plan text | Exact approved name or alias; preserve history | Future stable FleetOS location identity | Blocked |
| Fleet/business unit | Labels in multiple sources | Preserve labels and versioned mappings | Stable approved hierarchy and identities | Blocked |
| Human user/person/team | PM Assistant username/display name and AutoPM labels | No automatic display-name mapping | Approved identity provider and responsibility model | Blocked |
| PM plan/event | PM Assistant-local identifiers | Opaque local boundary identifiers | Stable external identity if separately approved | Partially ready for reads |
| Import/sync batch | Local import evidence | Traceable batch reference | Approved replay/idempotency identity | Blocked for write/replay behavior |
| Notification intent | Delivery log/provider evidence | Correlate safely without treating correlation as identity | Approved intent/idempotency identity | Blocked |
| Scheduler occurrence | APScheduler string IDs | Runtime evidence only | Deterministic business occurrence identity | Blocked |

## Status-domain matrix

| Domain | Meaning | Authority direction | Prohibited conflation |
| --- | --- | --- | --- |
| `pm_mileage_status` | Condition derived from accepted mileage and approved rule | PM Assistant after mileage decisions | Workflow, completion, notification, schedule condition |
| `pm_workflow_status` | PM planning/work progression | PM Assistant | Mileage, explicit completion, notification |
| `completion_status` | Explicit completion, correction, or reopen | PM Assistant | Mileage reset, notification success, elapsed time |
| `notification_status` | Intent and delivery outcome | PM Assistant | Completion and workflow |
| Schedule condition | Date/schedule-derived condition such as overdue-by-date | Separate representation pending approval | Workflow status |
| Runtime health | Live, ready, degraded, draining, failed, stopped | Runtime/operations evidence | Every business status domain |

## API cross-reference matrix

| API registry | Count | Owning document | Governing dependency | Readiness |
| --- | ---: | --- | --- | --- |
| `RES-*` | 11 | Resource and Endpoint Catalog | Ownership/domain | Proposed |
| `EP-*` | 14 | Resource and Endpoint Catalog | Root API Contract, API decisions | 11 core/gated; 3 directional candidates |
| `REQ-*` | 12 | Request and Response Models | Identity, filtering, security | Proposed |
| `RSP-*` | 14 | Request and Response Models | Ownership, projection, privacy | Proposed |
| `ERR-*` | 19 | Error, Pagination, and Filtering | Root API Error Model | Proposed |
| `COMP-*` | 12 | Security, Versioning, and Compatibility | ADR-0003 and contract status | Proposed |
| `VAL-*` | 16 | API Validation and Rollout | All API registries | Documentation gates defined |
| `DEC-*` | 18 | API Validation and Rollout | Product Owner decisions | Unresolved |

### Root-contract to API-Blueprint relationship

| Root contract subject | Detailed Blueprint source | Result |
| --- | --- | --- |
| `/api/v1` path and read-only direction | API Blueprint and endpoint catalog | Aligned |
| Success envelope and freshness | Request/response models | Aligned |
| Error envelope and codes | Error, Pagination, and Filtering | Aligned |
| Pagination/filter/sort | Request models and error model | Aligned |
| Identity representation | Request/response models | Aligned |
| Four statuses | Response models and endpoint catalog | Aligned |
| Security/authorization | Security, Versioning, and Compatibility | Direction aligned; decisions unresolved |
| Caching, retry, rate limits | Compatibility and validation | Direction aligned; exact values unresolved |
| Endpoint expansion | Endpoint catalog `EP-012` through `EP-014` | Explicit directional candidates, not silently added to root contract |

## Product traceability matrix

| Product registry | Count | Directly mapped to acceptance IDs | Directly mapped to architecture IDs | Result |
| --- | ---: | --- | --- | --- |
| Functional requirements `FR-*` | 101 | No explicit one-to-one mapping | Primarily narrative/domain-based | Gap |
| Non-functional requirements `NFR-*` | 86 | No explicit one-to-one mapping | Primarily narrative/security/operations based | Gap |
| Acceptance criteria `AC-*` | 56 | Defined by workflow area | Does not cite exact FR/NFR IDs | Gap |

The requirements and acceptance content is semantically aligned by capability area, but explicit identifier-level traceability is absent. This prevents a mechanical determination that every requirement has one or more approved acceptance and validation checks.

## Identifier Registry Validation

### Scoped totals

| Area | Identifier count | Prefix groups | Range gaps |
| --- | ---: | ---: | ---: |
| ADR | 3 | 1 | 0 |
| Product | 243 | 35 | 0 |
| Domain | 145 | 8 | 0 |
| API | 116 | 8 | 0 |
| Frontend | 181 | 9 | 0 |
| Backend | 168 | 10 | 0 |
| Infrastructure | 111 | 10 | 0 |
| Security | 186 | 11 | 0 |
| Operations | 111 | 9 | 0 |
| **Total** | **1,264** | **101** | **0** |

### Prefix ranges by area

| Area | Prefix ranges |
| --- | --- |
| ADR | `ADR-0001`–`ADR-0003` |
| Product functional | `FR-PLT-001`–`008`, `FR-ID-001`–`010`, `FR-PLAN-001`–`008`, `FR-LOC-001`–`006`, `FR-STS-001`–`007`, `FR-MIL-001`–`007`, `FR-CMP-001`–`004`, `FR-HIS-001`–`005`, `FR-NOT-001`–`008`, `FR-SCH-001`–`006`, `FR-IMP-001`–`009`, `FR-DAS-001`–`008`, `FR-API-001`–`010`, `FR-AUD-001`–`005` |
| Product non-functional | `NFR-SEC-001`–`015`, `NFR-REL-001`–`011`, `NFR-PERF-001`–`008`, `NFR-DQ-001`–`010`, `NFR-USA-001`–`009`, `NFR-ACC-001`–`008`, `NFR-OBS-001`–`006`, `NFR-COM-001`–`006`, `NFR-MNT-001`–`006`, `NFR-VAL-001`–`007` |
| Product acceptance | `AC-PLAN-001`–`006`, `AC-ID-001`–`005`, `AC-LOC-001`–`004`, `AC-MIL-001`–`005`, `AC-CMP-001`–`005`, `AC-HIS-001`–`005`, `AC-NOT-001`–`005`, `AC-SCH-001`–`004`, `AC-IMP-001`–`006`, `AC-DAS-001`–`006`, `AC-AUD-001`–`005` |
| Domain | `ENT-001`–`019`, `AGG-001`–`009`, `VO-001`–`019`, `DR-001`–`020`, `INV-001`–`026`, `ST-001`–`016`, `EVT-001`–`020`, `DEC-001`–`016` |
| API | `RES-001`–`011`, `EP-001`–`014`, `REQ-001`–`012`, `RSP-001`–`014`, `ERR-001`–`019`, `COMP-001`–`012`, `VAL-001`–`016`, `DEC-001`–`018` |
| Frontend | `APP-001`–`003`, `PAGE-001`–`021`, `FEAT-001`–`040`, `COMPONENT-001`–`025`, `UISTATE-001`–`016`, `UX-001`–`020`, `A11Y-001`–`018`, `VAL-001`–`018`, `DEC-001`–`020` |
| Backend | `BEMOD-001`–`012`, `APSVC-001`–`014`, `UC-001`–`041`, `REPO-001`–`014`, `TX-001`–`011`, `BVAL-001`–`012`, `BEERR-001`–`014`, `RUNTIME-001`–`014`, `VAL-001`–`018`, `DEC-001`–`018` |
| Infrastructure | `IBP-001`–`010`, `IVAL-001`–`007`, `IDEC-001`–`012`, `IENV-001`–`012`, `INET-001`–`012`, `ISTOR-001`–`012`, `ICD-001`–`012`, `IOBS-001`–`012`, `ISCALE-001`–`010`, `IDR-001`–`012` |
| Security | `SECDOM-001`–`008`, `ASSET-001`–`012`, `TRUST-001`–`010`, `CTRL-001`–`032`, `IDENT-001`–`016`, `ACCESS-001`–`018`, `DPROT-001`–`018`, `THREAT-001`–`016`, `SECEVT-001`–`014`, `SVAL-001`–`018`, `SDEC-001`–`024` |
| Operations | `OPS-001`–`012`, `ODEC-001`–`012`, `MON-001`–`012`, `LOG-001`–`012`, `HEALTH-001`–`012`, `IR-001`–`012`, `MET-001`–`012`, `BCP-001`–`012`, `OVAL-001`–`015` |

### Scoped collisions

| Textual prefix | Scopes | Required review notation |
| --- | --- | --- |
| `DEC-*` | Domain, API, frontend, backend | `domain:DEC-*`, `api:DEC-*`, `frontend:DEC-*`, `backend:DEC-*` |
| `VAL-*` | API, frontend, backend | `api:VAL-*`, `frontend:VAL-*`, `backend:VAL-*` |

These are not numeric duplicates within their local registries. They become ambiguous only when cited without scope outside their owning directory.

### Areas without stable registries

- general Blueprint;
- application;
- database;
- engineering.

These documents remain usable, but traceability depends on file names, headings, table names, or narrative descriptions.

## Cross-reference graph results

| Metric | Result |
| --- | ---: |
| Reviewed graph nodes | 106 |
| Local document edges | 404 |
| Local Markdown links | 414 |
| Missing Markdown targets | 0 |
| Invalid explicit anchors | 0 |
| Markdown links targeting a non-file `.md` path | 1 |
| Documents with no incoming link | 2 |

Documents with no incoming link:

- repository root `README.md`, which is naturally the graph entry point;
- `docs/operations/README.md`, which should be reachable from a current documentation index but is not.

Confirmed invalid file-type target:

- root `README.md` → `ROADMAP.md`, where `ROADMAP.md` is a directory.

Confirmed malformed non-link references:

- ADR-0003 → `docsAPI_CONTRACT.md`;
- ADR-0003 → `docsAPI_ERROR_MODEL.md`.

## Document-status matrix

| Status evidence | Count | Interpretation |
| --- | ---: | --- |
| Explicit `Proposed` | 10 | Includes three ADRs, API contracts, and selected Blueprint indexes. |
| Explicit Product Owner review/baseline | 4 | Engineering, product, and FleetOS Blueprint sources. |
| No explicit per-file status in first-level metadata | 88 | Status may be inherited from an index or inferred from purpose wording. |

Status absence does not make a document accepted. It reduces mechanical certainty about which statements are fixed, proposed, review baseline, or historical.

## Missing-reference matrix

| Missing or incomplete reference | Affected source | Impact |
| --- | --- | --- |
| API Blueprint index absent from Development Guide | Development Guide | Current documentation map is incomplete. |
| Frontend index absent | Development Guide | Current documentation map is incomplete. |
| Backend index absent | Development Guide | Current documentation map is incomplete. |
| Infrastructure index absent | Development Guide | Current documentation map is incomplete. |
| Security index absent | Development Guide | Current documentation map is incomplete. |
| Operations index absent | Development Guide | Operations is orphaned from current top-level navigation. |
| Architecture, ownership, identity, API contracts, ADR index absent | Development Guide | Core authority sources are not directly discoverable from the guide. |
| FR/NFR to AC mapping absent | Product documents | Acceptance coverage cannot be proven mechanically. |
| Database table decisions to numbered decisions absent | Database documents | Implementation gates require manual cross-reading. |
| Application gates to numbered decisions absent | Application documents | Implementation gates require manual cross-reading. |

## Cross-reference conclusion

The document graph is structurally healthy and architecture concepts are strongly aligned. The main cross-reference weakness is not broken Markdown; it is incomplete enterprise traceability across:

- source status;
- scoped identifiers;
- product requirements and acceptance;
- conceptual database/application decisions and numbered registries;
- root navigation and current phase reporting.

Phase 5 work should cite exact source files and scope-qualified identifiers rather than relying on generic terms such as `DEC-001`, `VAL-001`, “the API contract,” or “the roadmap.”
