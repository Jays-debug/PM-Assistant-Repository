# FleetOS Implementation Guide

## Purpose and status

- Phase: 5.0 — FleetOS Implementation Foundation
- Status: Documentation-only implementation guide
- Implementation authorization: None
- Architecture authority: None added by this guide

This guide is the implementation-entry map for FleetOS. It connects the existing
architecture and Engineering Standards without creating another architecture layer,
accepting a proposed decision, or authorizing source changes.

Documents marked `Proposed`, target, candidate, planned, review baseline, or
unresolved retain that status. The current implementation-readiness verdict remains
**Hold** until a later task satisfies the applicable entry conditions and receives an
exact Product Owner approval.

## Authority and complete reference path

Apply sources in this order:

1. explicit Product Owner direction for the current task;
2. [repository governance](../AGENTS.md);
3. accepted architecture decisions and controlling contracts for the selected scope;
4. the [FleetOS Engineering Standard](engineering/README.md);
5. the [FleetOS Development Guide](../FLEETOS_DEVELOPMENT_GUIDE.md) and supporting
   contribution guidance;
6. this implementation-entry map;
7. existing implementation patterns when they do not conflict with a higher source.

The [Document Status and Authority Register](review/DOCUMENT_STATUS_AND_AUTHORITY_REGISTER.md)
is the controlling inventory for all governed FleetOS documents. The
[FleetOS Development Guide](../FLEETOS_DEVELOPMENT_GUIDE.md) provides the complete
document-level navigation. Together they are the reference path for every governed
FleetOS document; this guide does not copy that inventory or alter any source status.

For implementation planning, consult every applicable area index:

| Concern | Controlling entry point |
| --- | --- |
| Architecture and module boundaries | [FleetOS Architecture](FLEETOS_ARCHITECTURE.md) and [ADRs](adr/README.md) |
| Ownership and identity | [Data Ownership](DATA_OWNERSHIP.md) and [Identity Contract](IDENTITY_CONTRACT.md) |
| Engineering practice | [Engineering Standard](engineering/README.md) |
| System context and integration | [FleetOS Blueprint](blueprint/README.md) |
| Requirements and acceptance | [Product Specification](product/README.md) |
| Domain concepts and invariants | [Domain Model](domain/README.md) |
| Logical persistence and migration | [Database documentation](database/README.md) |
| Boundary contracts | [API Blueprint](api/README.md) and the proposed [API Contract](API_CONTRACT.md) and [API Error Model](API_ERROR_MODEL.md) |
| Application responsibilities | [Application Blueprint](application/README.md) |
| Presentation | [Frontend Blueprint](frontend/README.md) |
| Services and persistence boundaries | [Backend Blueprint](backend/README.md) |
| Runtime prerequisites | [Infrastructure Blueprint](infrastructure/README.md) |
| Security controls | [Security Blueprint](security/README.md) |
| Operational evidence | [Operations and Observability](operations/README.md) |
| Readiness and unresolved decisions | [Enterprise Review](review/README.md) |

An area is applicable when the proposed change affects its responsibilities, data,
contracts, runtime, validation, security, operations, migration, or rollback.

## Implementation architecture

Implementation must preserve the architecture already documented by the governing
sources:

- FleetOS remains the parent platform.
- AutoPM and PM Assistant retain their existing names and remain separate bounded
  modules, deployment units, and rollback units.
- PM Assistant remains authoritative for maintenance workflow information and
  persistence.
- AutoPM remains read-only for maintenance workflow information and owns presentation.
- Cross-module integration uses only a separately accepted contract. Direct
  shared-database access and unapproved source imports are prohibited.
- `vehicle_no` remains a transitional matching key. `fleetos_vehicle_id` must not be
  created until its ownership and lifecycle are approved.
- Mileage, workflow, completion, and notification status remain separate domains.

This guide does not select a framework, datastore, provider, runtime topology, or
authentication mechanism.

## Folder, module, and package layout

The current top-level application boundaries remain:

```text
autopm/         AutoPM-owned implementation
pm-assistant/   PM Assistant-owned implementation
docs/           FleetOS documentation
```

Future implementation work must remain within the owning application root. A task
that proposes a new folder, module, or package must:

1. identify the owning bounded module;
2. map the proposed location to an existing application, frontend, backend, or
   domain responsibility;
3. list every new or changed path in the approval plan;
4. define its public boundary and prohibited dependencies;
5. avoid a shared application package unless an accepted decision explicitly
   establishes its ownership, compatibility, release, and rollback rules.

No folder or package shown in target documentation exists merely because it is
documented. Package layout is approved only in the exact implementation task that
creates it.

## Naming and coding conventions

Use the [Coding Standard](engineering/CODING_STANDARD.md) and
[API and Data Standard](engineering/API_AND_DATA_STANDARD.md). Preserve established
AutoPM and PM Assistant naming where it does not conflict with a controlling contract.

FleetOS-specific naming rules are:

- do not rename AutoPM, PM Assistant, existing paths, tables, routes, projects, or
  screens without explicit approval;
- use scope-qualified decision and validation identifiers outside their owning
  documents, such as `domain:DEC-001` and `api:VAL-001`;
- do not use a generic `status` name when one of the distinct status domains is
  intended;
- do not use proposed identities or contract names as though they are implemented.

## Dependency direction and layer rules

Detailed rules remain in the [Application Blueprint](application/README.md),
[Backend Blueprint](backend/README.md), [Frontend Blueprint](frontend/README.md), and
[API and Data Standard](engineering/API_AND_DATA_STANDARD.md).

The implementation dependency direction is:

```text
presentation or delivery
        -> application/use-case boundary
        -> domain policy

infrastructure or persistence
        -> application/domain-owned interfaces

AutoPM
        -> accepted read contract
        -> PM Assistant-owned projection
```

The domain must not depend on presentation, delivery, database, framework, provider,
or deployment details. Persistence models and provider payloads must not become
cross-module contracts. Dependencies must not give AutoPM write authority or bypass
PM Assistant ownership.

## Testing strategy

The [Testing and Quality Standard](engineering/TESTING_AND_QUALITY_STANDARD.md) is
controlling. Each later implementation plan must select the applicable unit,
component, integration, contract, migration, security, operational, and end-to-end
checks from the affected area validation documents.

Before implementation approval, map:

```text
requirement -> acceptance criterion -> affected decision/contract -> test -> evidence
```

Tests must cover changed boundaries, failure behavior, compatibility, rollback, and
the preservation of module ownership. A passing test cannot resolve an unapproved
decision.

## Migration strategy

The [Database Migration Strategy](database/MIGRATION_STRATEGY.md),
[API compatibility rules](api/SECURITY_VERSIONING_AND_COMPATIBILITY.md), and affected
application, infrastructure, security, and operations rollout documents remain
controlling.

Every task with data, schema, contract, configuration, or consumer compatibility
impact must define:

- the starting and target states;
- accepted decision dependencies;
- compatibility and deployment ordering;
- validation and reconciliation evidence;
- stop conditions;
- rollback or approved forward recovery;
- retention of authoritative source and audit evidence.

Phase 5.0 creates no migration and selects no datastore or migration tool.

## Development and repository workflow

Follow the [Development Lifecycle](engineering/DEVELOPMENT_LIFECYCLE.md),
[Git and Branch Standard](engineering/GIT_AND_BRANCH_STANDARD.md),
[AI Collaboration Standard](engineering/AI_COLLABORATION_STANDARD.md), and
[Review and Release Checklists](engineering/REVIEW_RELEASE_CHECKLISTS.md).

Every file-changing task follows:

```text
Analyze -> Explain -> Architecture Impact -> Risk and Rollback
-> Exact File Plan -> Product Owner Approval -> Modify Approved Scope
-> Validate -> Summarize -> Commit only when explicitly authorized
```

A phase, roadmap, guide, or workstream name is not file-level authorization. Git,
deployment, migration execution, credential changes, data changes, and external
service actions require their own explicit authorization when applicable.

## Coding checklist

Before requesting implementation approval:

- [ ] Confirm the exact requirement, acceptance criteria, and owning module.
- [ ] Consult every applicable source through the authority and area indexes above.
- [ ] Record source-qualified decisions as accepted, explicitly deferred, or blocking.
- [ ] List exact source, test, documentation, migration, and rollback files.
- [ ] Explain dependency, data, identity, security, operational, and compatibility impact.
- [ ] Define validation evidence, stop conditions, rollback, and forward recovery.

During and after an approved implementation:

- [ ] Modify only approved files and preserve unrelated work.
- [ ] Preserve module, ownership, identity, and status-domain boundaries.
- [ ] Keep secrets and protected data out of source, tests, logs, and documents.
- [ ] Add or update proportionate tests and execute approved checks.
- [ ] Reconcile documentation and implementation claims with actual evidence.
- [ ] Report changes, validation, residual risks, rollback readiness, and remaining work.
- [ ] Stop before Git or external actions unless they were explicitly approved.

## Phase 5.0 completion boundary

This guide completes documentation foundation only. It does not implement FleetOS
functionality, business logic, APIs, databases, packages, tests, migrations,
configuration, infrastructure, or deployment. A later implementation proposal must
still pass the readiness gates in the
[Implementation Readiness Report](review/IMPLEMENTATION_READINESS_REPORT.md) and the
[Recommended Phase 5 Implementation Roadmap](review/PHASE5_IMPLEMENTATION_ROADMAP.md).
