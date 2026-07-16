# FleetOS Project Context

## Purpose and status

This document is the repository-level context index for **FleetOS — Fleet Operating System**.

- Status: Documentation baseline
- Last documentation review: Phase 4.9
- Current maintenance phase: Phase 4.9.1 repository remediation
- Implementation readiness: Hold

This document summarizes approved documentation. It does not create architecture, resolve decisions, authorize implementation, or claim that target capabilities are operational.

## Platform and modules

FleetOS is the parent platform. The existing module names remain:

- **AutoPM** — dashboard, reporting, KPI, calendar, filtering, and fleet-facing presentation;
- **PM Assistant** — maintenance planning, workflow, completion, history, notification, scheduling, import, and persistence.

AutoPM and PM Assistant remain separate bounded modules, deployment units, and rollback units.

## Authority and integration direction

- PM Assistant owns authoritative maintenance workflow information.
- AutoPM is a read-only consumer of approved maintenance information and owns presentation.
- Direct shared-database access is prohibited.
- Approved read models or a separately accepted versioned API are the documented integration direction.
- Current legacy feeds and local persistence remain implementation evidence, not automatically accepted target contracts.

## Identity and status safeguards

- `vehicle_no` is a transitional matching key only.
- `fleetos_vehicle_id` is reserved as a proposed future canonical identifier and is not implemented.
- Ambiguous identity matches must not be guessed.
- `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` are separate domains.
- Runtime health is separate from business status.

## Documentation authority

Start with:

1. [Repository governance](AGENTS.md)
2. [FleetOS documentation index](docs/README.md)
3. [FleetOS Architecture](docs/FLEETOS_ARCHITECTURE.md)
4. [Data Ownership](docs/DATA_OWNERSHIP.md)
5. [Identity Contract](docs/IDENTITY_CONTRACT.md)
6. [Architecture Decision Record index](docs/adr/README.md)
7. [Enterprise Architecture Review](docs/review/README.md)

Documents marked `Proposed`, target, candidate, planned, or unresolved retain that status. Repository navigation or traceability metadata does not accept those decisions.

## Current readiness

The Phase 4.9 review found comprehensive documentation coverage and consistent central architecture, but Phase 5 implementation remains blocked by proposed governing decisions, unresolved decision registries, incomplete implementation-entry evidence, and unapproved exact implementation scope.

See:

- [Implementation Readiness Report](docs/review/IMPLEMENTATION_READINESS_REPORT.md)
- [Unresolved Decisions Register](docs/review/UNRESOLVED_DECISIONS_REGISTER.md)
- [Recommended Phase 5 Implementation Roadmap](docs/review/PHASE5_IMPLEMENTATION_ROADMAP.md)

## Scope boundary

This context file does not authorize:

- application source changes;
- database creation or migration;
- configuration or secret changes;
- deployment or external-service changes;
- technology selection;
- ownership reassignment;
- acceptance of an ADR or API contract.
