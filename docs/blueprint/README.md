# FleetOS v1.0 Blueprint

## Purpose

This directory is the implementation-oriented Blueprint for **FleetOS — Fleet Operating System v1.0**. It organizes the approved architecture, ownership, identity, API, error, security, quality, and rollback direction into a delivery sequence.

The Blueprint is documentation, not evidence that its target capabilities are operational. The existing ADRs and API documents marked `Proposed` remain proposed direction until the FleetOS Product Owner accepts them and authorizes implementation.

## State legend

Every Blueprint document uses these four states consistently:

| State | Meaning |
| --- | --- |
| **Current state** | Behavior or infrastructure directly evidenced in the repository. |
| **Transitional state** | Temporary, controlled behavior used while moving from current implementation to the approved target. |
| **FleetOS v1.0 target state** | Capabilities and controls required for FleetOS v1.0 production readiness after approval, implementation, and validation. |
| **Future state outside v1.0** | Deferred direction that is not required for FleetOS v1.0. |

Proposed, unresolved, planned, and target statements must never be interpreted as operational claims.

## Blueprint documents

1. [FleetOS v1.0 Blueprint](FLEETOS_V1_BLUEPRINT.md) — product vision, scope, state model, boundaries, and definition of complete.
2. [System Context and Module Map](SYSTEM_CONTEXT_AND_MODULE_MAP.md) — system context, module responsibilities, ownership, identity, API, and status boundaries.
3. [Data and Integration Flow](DATA_AND_INTEGRATION_FLOW.md) — plan, mileage, completion, history, notification, scheduler, import, synchronization, and audit flows.
4. [Deployment and Runtime Blueprint](DEPLOYMENT_AND_RUNTIME_BLUEPRINT.md) — topology, configuration, security, observability, persistence, testing, deployment, and rollback direction.
5. [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md) — phases, dependencies, gates, evidence, unresolved decisions, and production-readiness criteria.

## Authoritative references

The Blueprint summarizes and connects the following sources; it does not replace them:

- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [Data Ownership](../DATA_OWNERSHIP.md)
- [Identity Contract](../IDENTITY_CONTRACT.md)
- [API Contract](../API_CONTRACT.md)
- [API Error Model](../API_ERROR_MODEL.md)
- [Architecture Decision Records](../adr/)
- [FleetOS Engineering Standard](../engineering/README.md)
- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [Repository governance](../../AGENTS.md)

Where an authoritative source is marked `Proposed`, the same decision remains proposed here. Any conflict or missing decision is an implementation gate for Product Owner resolution.

## Fixed architecture guardrails

- FleetOS is the parent platform.
- AutoPM and PM Assistant remain separate bounded modules and independently deployable units.
- PM Assistant owns authoritative maintenance workflow information.
- AutoPM is read-only for maintenance workflow information and owns presentation.
- Direct shared-database access is prohibited.
- `vehicle_no` is a transitional matching key only.
- `fleetos_vehicle_id` is a proposed future canonical identifier and is not implemented.
- `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` are separate concepts.
- Current Google Sheets, CSV, Apps Script, SQLite, FastAPI, and scheduler behavior is current or transitional evidence, not automatically an approved cross-module contract.

## Using this Blueprint

Implementation must follow the approval lifecycle in the engineering standard. No target-state diagram or roadmap phase authorizes source changes, database migration, deployment, credential changes, or external-service changes. Each phase requires its own approved scope, validation evidence, and rollback plan.
