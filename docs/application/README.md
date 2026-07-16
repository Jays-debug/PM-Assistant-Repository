# FleetOS Application Blueprint v1.0

## Purpose and status

This directory contains the Phase 4.3 application-layer Blueprint for **FleetOS — Fleet Operating System v1.0**.

- Status: **Proposed**
- Blueprint version: `1.0`
- Parent platform: FleetOS
- Application modules: AutoPM and PM Assistant
- Decision owner: FleetOS Product Owner

The Blueprint defines logical application responsibilities, service interactions, background work, state management, application deployment, and runtime lifecycle direction. It is documentation only. It does not implement, configure, deploy, migrate, authenticate, authorize, schedule, or operate any target capability.

## State legend

| State | Meaning |
| --- | --- |
| **Current evidence** | Behavior directly observed in the repository. It is not automatically an approved application contract. |
| **Transitional direction** | Reversible behavior used to compare, reconcile, and prepare the target application boundary. |
| **FleetOS v1.0 target** | Proposed application design to implement only after applicable decisions and delivery scope are approved. |
| **Future outside v1.0** | Capability intentionally excluded from FleetOS v1.0. |

Proposed, planned, unresolved, and target statements must not be interpreted as operational claims.

## Documents

| Document | Responsibility |
| --- | --- |
| [FleetOS Application Blueprint](FLEETOS_APPLICATION_BLUEPRINT.md) | Application-layer scope, architecture, principles, states, risks, decisions, and completion criteria. |
| [Application Modules](APPLICATION_MODULES.md) | Logical responsibilities, dependencies, ownership boundaries, and prohibited coupling. |
| [Service Interactions](SERVICE_INTERACTIONS.md) | Request, read-model, persistence, import, notification, and scheduler interaction rules. |
| [Background Jobs](BACKGROUND_JOBS.md) | Job ownership, identity, execution, retry, observability, shutdown, and recovery direction. |
| [State Management](STATE_MANAGEMENT.md) | Authoritative, presentation, cache, request, configuration, and operational state boundaries. |
| [Application Deployment](APPLICATION_DEPLOYMENT.md) | Deployment units, configuration, startup, readiness, shutdown, rollout, and rollback direction. |
| [Application Lifecycle](APPLICATION_LIFECYCLE.md) | Runtime lifecycle from initialization through operation, degradation, shutdown, and replacement. |
| [Decision Traceability](DECISION_TRACEABILITY.md) | Existing application gates and headings mapped to existing scope-qualified decision registries. |

## Governing references

This Blueprint specializes, but does not replace:

- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [FleetOS v1.0 Blueprint](../blueprint/README.md)
- [FleetOS Product Specification](../product/README.md)
- [FleetOS Domain Model](../domain/README.md)
- [FleetOS Database Blueprint](../database/README.md)
- [FleetOS API Blueprint](../api/README.md)
- [FleetOS Engineering Standard](../engineering/README.md)
- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [Repository governance](../../AGENTS.md)

Where a governing document marks a decision Proposed or unresolved, the same status applies here. A conflict is a Product Owner gate and must not be resolved through implementation guesswork.

## Fixed guardrails

1. FleetOS is the parent platform.
2. AutoPM and PM Assistant retain their names and remain separate bounded modules, deployment units, and rollback units.
3. PM Assistant owns authoritative maintenance workflow information.
4. AutoPM is read-only for maintenance workflow information and owns presentation.
5. Cross-module reads use an approved versioned interface or approved read model.
6. Direct shared-database access and AutoPM writes to PM Assistant persistence are prohibited.
7. Logical services do not imply one process, package, or deployment per service.
8. `vehicle_no` is a transitional matching key only; `fleetos_vehicle_id` is proposed and unimplemented.
9. `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` remain separate.
10. No target hosting, authentication, persistence, worker, queue, or observability technology is selected by this Blueprint.

## Using this Blueprint

This documentation is an application design and review baseline. A later implementation phase requires its own approved files, architecture review, risk analysis, tests, rollback plan, and Product Owner authorization. Nothing in this directory authorizes source changes, database changes, deployment, credential changes, external-service changes, commit, push, or release.
