# FleetOS Backend Blueprint v1.0

## Purpose and status

This directory contains the Phase 4.5 implementation-oriented Backend Blueprint for **FleetOS — Fleet Operating System v1.0**.

- Status: **Proposed**
- Blueprint version: `1.0`
- Parent platform: FleetOS
- Authoritative maintenance backend: PM Assistant
- Read-only maintenance consumer: AutoPM
- Decision owner: FleetOS Product Owner

The Blueprint defines logical backend modules, layers, application services, use cases, repository and persistence boundaries, transaction behavior, validation, errors, configuration, dependency injection, runtime lifecycle, testing, observability, rollout, and rollback direction.

It is documentation only. It does not implement, configure, deploy, migrate, authenticate, authorize, schedule, notify, or operate any target capability.

## State legend

| State | Meaning |
| --- | --- |
| **Current implementation evidence** | Behavior or structure directly observed in the repository. It is not automatically an approved backend contract. |
| **Transitional backend direction** | Reversible structure and behavior used to introduce controlled backend seams while preserving existing workflows. |
| **FleetOS v1.0 target backend architecture** | Proposed design to implement only after applicable decisions and delivery scope are approved. |
| **Future outside v1.0** | Capability intentionally excluded from FleetOS v1.0. |

Proposed, planned, unresolved, and target statements must not be interpreted as operational claims.

## Documents

| Document | Responsibility |
| --- | --- |
| [Backend Blueprint](BACKEND_BLUEPRINT.md) | Backend scope, current evidence, four-state architecture, layers, dependency direction, impact, risks, and completion criteria. |
| [Backend Module and Layer Catalog](BACKEND_MODULE_AND_LAYER_CATALOG.md) | Stable `BEMOD-*` modules, layer responsibilities, dependencies, ownership, and prohibited coupling. |
| [Application Services and Use Cases](APPLICATION_SERVICE_AND_USE_CASES.md) | Stable `APSVC-*` services and `UC-*` query, command, import, scheduler, notification, and audit use cases. |
| [Repository and Persistence Boundaries](REPOSITORY_AND_PERSISTENCE_BOUNDARIES.md) | Stable `REPO-*` interfaces, adapters, ORM isolation, read models, unit-of-work direction, concurrency, and idempotency. |
| [Transaction, Error, and Validation Model](TRANSACTION_ERROR_AND_VALIDATION_MODEL.md) | Stable `TX-*`, `BVAL-*`, and `BEERR-*` rules for consistency, validation, invariants, error translation, correlation, and rollback. |
| [Configuration, Dependency, and Runtime](CONFIGURATION_DEPENDENCY_AND_RUNTIME.md) | Stable `RUNTIME-*` requirements for configuration, secrets, dependency injection, startup, probes, background execution, and shutdown. |
| [Backend Validation and Rollout](BACKEND_VALIDATION_AND_ROLLOUT.md) | Stable backend-local `VAL-*` gates and `DEC-*` decisions for testing, observability, performance, shadow rollout, and rollback. |

## Identifier ownership

Backend identifiers are defined once in the following registries and may be referenced from any document in this directory:

| Identifier | Registry |
| --- | --- |
| `BEMOD-*` | [Backend Module and Layer Catalog](BACKEND_MODULE_AND_LAYER_CATALOG.md) |
| `APSVC-*`, `UC-*` | [Application Services and Use Cases](APPLICATION_SERVICE_AND_USE_CASES.md) |
| `REPO-*` | [Repository and Persistence Boundaries](REPOSITORY_AND_PERSISTENCE_BOUNDARIES.md) |
| `TX-*`, `BVAL-*`, `BEERR-*` | [Transaction, Error, and Validation Model](TRANSACTION_ERROR_AND_VALIDATION_MODEL.md) |
| `RUNTIME-*` | [Configuration, Dependency, and Runtime](CONFIGURATION_DEPENDENCY_AND_RUNTIME.md) |
| `VAL-*`, `DEC-*` | [Backend Validation and Rollout](BACKEND_VALIDATION_AND_ROLLOUT.md) |

The backend `VAL-*` and `DEC-*` registries are scoped to `docs/backend/`. They do not replace similarly named registries in the API, domain, database, frontend, or other Blueprint sets. Within this Backend Blueprint, identifiers are unique, defined once, and cross-referenced without changing their meaning.

## Governing references

This Blueprint specializes, but does not replace:

- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [Repository governance](../../AGENTS.md)
- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [Data Ownership](../DATA_OWNERSHIP.md)
- [Identity Contract](../IDENTITY_CONTRACT.md)
- [FleetOS v1.0 Blueprint](../blueprint/README.md)
- [FleetOS Product Specification](../product/README.md)
- [FleetOS Domain Model](../domain/README.md)
- [FleetOS Database Blueprint](../database/README.md)
- [FleetOS API Blueprint](../api/README.md)
- [FleetOS Application Blueprint](../application/README.md)
- [FleetOS Frontend Blueprint](../frontend/README.md)
- [FleetOS Engineering Standard](../engineering/README.md)
- [Architecture decision records](../adr/)

Where a governing source is Proposed or a decision is unresolved, the same status applies here. A conflict is a Product Owner gate and must not be resolved through implementation guesswork.

## Fixed guardrails

1. FleetOS is the parent platform.
2. AutoPM and PM Assistant retain their names and remain separate bounded modules, deployment units, and rollback units.
3. PM Assistant owns authoritative maintenance workflow information and persistence.
4. AutoPM is read-only for maintenance workflow information and owns presentation.
5. Direct shared-database access and AutoPM writes to PM Assistant persistence are prohibited.
6. Existing FastAPI, SQLAlchemy, SQLite, APScheduler, notifier, file, and diagnostic behavior is current implementation evidence only.
7. FastAPI and SQLAlchemy may support a transitional implementation; this Blueprint does not select a replacement framework or require a rewrite.
8. Logical modules, services, repositories, and layers do not automatically become packages, processes, deployable services, or microservices.
9. Existing ORM entities and tables must not become public API or application models.
10. Purpose-built boundary, application, domain, and persistence models remain separate.
11. `vehicle_no` is a transitional matching key only.
12. `fleetos_vehicle_id` remains proposed and unimplemented.
13. `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` remain separate concepts.
14. Authentication, authorization, PostgreSQL, Railway, Docker, CI/CD, distributed queues, and production observability are not claimed operational.
15. Permissions, KPI definitions, mileage thresholds, retry values, transaction policies requiring business approval, retention periods, and infrastructure remain unresolved until approved.
16. Secrets and privileged credentials never appear in documentation examples, public models, logs, browser assets, or validation output.

## How to use this Blueprint

A later backend implementation phase must:

1. identify the exact approved use cases and source files;
2. resolve or explicitly defer the affected backend `DEC-*` entries;
3. preserve the module, ownership, identity, status, and API boundaries;
4. present architecture impact, risk, rollback, and exact file scope;
5. receive Product Owner approval before source changes;
6. validate the applicable backend `VAL-*` gates;
7. report exact changed files, tests, limitations, and residual risks;
8. stop at Git, deployment, migration, credential, and external-service gates.

Completion of these documents does not make the backend implemented, production-ready, deployed, or released.
