# FleetOS Infrastructure Blueprint v1.0

## Purpose and status

This directory contains the Phase 4.6 infrastructure architecture blueprint for **FleetOS — Fleet Operating System v1.0**.

- Status: **Proposed**
- Blueprint version: `1.0`
- Scope: Documentation only
- Decision owner: FleetOS Product Owner

The Blueprint defines vendor-neutral infrastructure requirements and decision gates. It does not provision, configure, deploy, migrate, scale, monitor, back up, restore, or operate any environment or service. Completion of these documents is not evidence that the target infrastructure exists.

## State legend

| State | Meaning |
| --- | --- |
| **Current implementation evidence** | Behavior or infrastructure directly evidenced in the repository. |
| **Transitional direction** | Reversible preparation or validation used before a target capability is approved and operational. |
| **FleetOS v1.0 target infrastructure** | Proposed requirements that apply only after approval, implementation, and validation. |
| **Future outside v1.0** | Deferred capabilities that are not required for FleetOS v1.0. |

Proposed, planned, target, candidate, and unresolved statements must never be interpreted as operational claims.

## Documents

| Document | Responsibility |
| --- | --- |
| [Infrastructure Blueprint](INFRASTRUCTURE_BLUEPRINT.md) | Scope, logical topology, principles, shared requirements, validation gates, and unresolved decisions. |
| [Environment Architecture](ENVIRONMENT_ARCHITECTURE.md) | Environment separation, configuration, promotion, test isolation, and environment lifecycle. |
| [Network and Security](NETWORK_AND_SECURITY.md) | Trust boundaries, ingress and egress, TLS, identity gates, least privilege, and network security. |
| [Storage and Backup](STORAGE_AND_BACKUP.md) | Storage ownership, durability, backup, restore, retention, and migration dependencies. |
| [CI/CD and Deployment](CI_CD_AND_DEPLOYMENT.md) | Proposed delivery controls, artifact promotion, deployment sequence, approvals, and rollback integration. |
| [Monitoring and Logging](MONITORING_AND_LOGGING.md) | Structured logs, metrics, traces, probes, alerts, audit separation, and redaction. |
| [Scaling and High Availability](SCALING_AND_HIGH_AVAILABILITY.md) | Scaling triggers, capacity evidence, availability boundaries, job safety, and graceful degradation. |
| [Disaster Recovery and Rollback](DISASTER_RECOVERY_AND_ROLLBACK.md) | Recovery scenarios, decision ownership, recovery sequence, reconciliation, rollback, and rehearsal. |

## Identifier ownership

Infrastructure identifiers are defined once in their owning registries and may be referenced throughout this directory.

| Identifier | Registry |
| --- | --- |
| `IBP-*`, `IVAL-*`, `IDEC-*` | [Infrastructure Blueprint](INFRASTRUCTURE_BLUEPRINT.md) |
| `IENV-*` | [Environment Architecture](ENVIRONMENT_ARCHITECTURE.md) |
| `INET-*` | [Network and Security](NETWORK_AND_SECURITY.md) |
| `ISTOR-*` | [Storage and Backup](STORAGE_AND_BACKUP.md) |
| `ICD-*` | [CI/CD and Deployment](CI_CD_AND_DEPLOYMENT.md) |
| `IOBS-*` | [Monitoring and Logging](MONITORING_AND_LOGGING.md) |
| `ISCALE-*` | [Scaling and High Availability](SCALING_AND_HIGH_AVAILABILITY.md) |
| `IDR-*` | [Disaster Recovery and Rollback](DISASTER_RECOVERY_AND_ROLLBACK.md) |

Identifiers are scoped to `docs/infrastructure/`. They do not replace identifiers in the backend, API, database, domain, frontend, product, or application documentation.

## Governing references

This Blueprint specializes, but does not replace:

- [Repository governance](../../AGENTS.md)
- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [FleetOS Data Ownership](../DATA_OWNERSHIP.md)
- [FleetOS Identity Contract](../IDENTITY_CONTRACT.md)
- [FleetOS v1.0 Blueprint](../blueprint/README.md)
- [Deployment and Runtime Blueprint](../blueprint/DEPLOYMENT_AND_RUNTIME_BLUEPRINT.md)
- [Application Deployment](../application/APPLICATION_DEPLOYMENT.md)
- [Backend Configuration, Dependency, and Runtime](../backend/CONFIGURATION_DEPENDENCY_AND_RUNTIME.md)
- [Database Blueprint](../database/DATABASE_BLUEPRINT.md)
- [Database Migration Strategy](../database/MIGRATION_STRATEGY.md)
- [Non-Functional Requirements](../product/NON_FUNCTIONAL_REQUIREMENTS.md)
- [FleetOS Engineering Standard](../engineering/README.md)
- [Security and Observability Standard](../engineering/SECURITY_AND_OBSERVABILITY_STANDARD.md)
- [Review and Release Checklists](../engineering/REVIEW_RELEASE_CHECKLISTS.md)

Where a governing source is proposed or a decision is unresolved, the same status applies here. Conflicts are Product Owner gates and must not be resolved through implementation guesswork.

## Fixed guardrails

1. FleetOS is the parent platform; AutoPM and PM Assistant retain their existing names.
2. AutoPM and PM Assistant remain separate bounded modules, deployment units, and rollback units.
3. PM Assistant remains authoritative for maintenance workflow information and persistence.
4. AutoPM remains read-only for maintenance workflow information.
5. Direct shared-database access is prohibited.
6. Browser-delivered assets contain no privileged service credentials.
7. `vehicle_no` remains a transitional matching key; `fleetos_vehicle_id` remains proposed and unimplemented.
8. Mileage, workflow, completion, and notification status remain separate concepts.
9. Infrastructure products, vendors, service levels, recovery objectives, and topology details remain unresolved until separately approved.
10. PostgreSQL, Railway, Docker, CI/CD, production authentication, centralized observability, multi-replica execution, and production backup are not claimed operational.

## How to use this Blueprint

A later infrastructure implementation must identify the affected identifiers and unresolved decisions, present exact implementation scope and rollback, obtain Product Owner approval, validate the applicable `IVAL-*` gates, and stop at separate Git, deployment, migration, credential, data, and external-service approval boundaries.

