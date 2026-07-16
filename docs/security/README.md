# FleetOS Security Blueprint v1.0

## Purpose and status

This directory defines the implementation-oriented security direction for **FleetOS — Fleet Operating System v1.0**, including AutoPM, PM Assistant, their frontends and backends, the proposed API boundary, data, infrastructure, integrations, delivery, and operations.

These documents are a security design baseline. They do not implement or prove authentication, authorization, sessions, encryption, secret management, scanning, monitoring, infrastructure, deployment, or incident-response capability.

## State model

Every document uses four states:

| State | Meaning |
| --- | --- |
| **Current security implementation evidence** | Behavior directly observed in repository source or documentation. Evidence is not automatically an approved or production-ready control. |
| **Transitional security direction** | Reversible preparation and risk reduction while approved target controls are designed and validated. |
| **FleetOS v1.0 target security architecture** | Required security outcomes after Product Owner approval, implementation, and validation. |
| **Future capabilities outside v1.0** | Deferred capabilities not required for FleetOS v1.0. |

Proposed, target, planned, and unresolved statements must never be interpreted as operational claims.

## Fixed security guardrails

1. FleetOS is the parent platform.
2. AutoPM and PM Assistant remain separate bounded modules and rollback units.
3. PM Assistant remains authoritative for maintenance workflow information.
4. AutoPM remains read-only for maintenance workflow information.
5. Direct shared-database access is prohibited.
6. `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` remain separate concepts.
7. `vehicle_no` remains a transitional matching key only.
8. `fleetos_vehicle_id` remains proposed and unimplemented.
9. Browser controls, visible user names, settings screens, current roles, CORS settings, environment-variable names, LINE behavior, and diagnostic routes are implementation evidence only.
10. No authentication, authorization, encryption, security tooling, hosting, monitoring, or recovery control is operational merely because this Blueprint requires it.

## Documents

1. [Security Blueprint](SECURITY_BLUEPRINT.md) — security context, four-state architecture, domains, assets, trust boundaries, actors, controls, and architecture impact.
2. [Identity, Authentication, and Session](IDENTITY_AUTHENTICATION_AND_SESSION.md) — identity lifecycle, authentication, session, credential, and service-identity direction.
3. [Authorization, Roles, and Access Control](AUTHORIZATION_ROLES_AND_ACCESS_CONTROL.md) — least privilege, default deny, roles, permissions, protected navigation, API authorization, and resource access.
4. [Data Protection, Privacy, and Retention](DATA_PROTECTION_PRIVACY_AND_RETENTION.md) — classification, minimization, sensitive fields, encryption direction, retention, deletion, backups, audit protection, and privacy.
5. [Application, API, and Frontend Security](APPLICATION_API_AND_FRONTEND_SECURITY.md) — browser, frontend, API, backend, import, webhook, notification, and scheduler security.
6. [Infrastructure, Secrets, and Supply Chain](INFRASTRUCTURE_SECRETS_AND_SUPPLY_CHAIN.md) — secrets, configuration, dependencies, artifacts, environments, networks, logging, and delivery.
7. [Threat Model, Incident, and Audit](THREAT_MODEL_INCIDENT_AND_AUDIT.md) — threat agents, threats, security events, monitoring, audit, vulnerability management, and incident direction.
8. [Security Validation and Rollout](SECURITY_VALIDATION_AND_ROLLOUT.md) — validation gates, testing, access review, rollout, rollback, unresolved decisions, and definition of complete.

## Identifier ownership

Security-local identifiers are defined once in the owning document and may be cross-referenced elsewhere.

| Prefix | Range | Owner |
| --- | --- | --- |
| `SECDOM` | `SECDOM-001` through `SECDOM-008` | `SECURITY_BLUEPRINT.md` |
| `ASSET` | `ASSET-001` through `ASSET-012` | `SECURITY_BLUEPRINT.md` |
| `TRUST` | `TRUST-001` through `TRUST-010` | `SECURITY_BLUEPRINT.md` |
| `CTRL` | `CTRL-001` through `CTRL-032` | `SECURITY_BLUEPRINT.md` |
| `IDENT` | `IDENT-001` through `IDENT-016` | `IDENTITY_AUTHENTICATION_AND_SESSION.md` |
| `ACCESS` | `ACCESS-001` through `ACCESS-018` | `AUTHORIZATION_ROLES_AND_ACCESS_CONTROL.md` |
| `DPROT` | `DPROT-001` through `DPROT-018` | `DATA_PROTECTION_PRIVACY_AND_RETENTION.md` |
| `THREAT` | `THREAT-001` through `THREAT-016` | `THREAT_MODEL_INCIDENT_AND_AUDIT.md` |
| `SECEVT` | `SECEVT-001` through `SECEVT-014` | `THREAT_MODEL_INCIDENT_AND_AUDIT.md` |
| `SVAL` | `SVAL-001` through `SVAL-018` | `SECURITY_VALIDATION_AND_ROLLOUT.md` |
| `SDEC` | `SDEC-001` through `SDEC-024` | `SECURITY_VALIDATION_AND_ROLLOUT.md` |

## Governing references

- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [Repository governance](../../AGENTS.md)
- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [Data Ownership](../DATA_OWNERSHIP.md)
- [Identity Contract](../IDENTITY_CONTRACT.md)
- [Engineering Standard](../engineering/README.md)
- [FleetOS v1.0 Blueprint](../blueprint/README.md)
- [Product Specification](../product/README.md)
- [Domain Model](../domain/README.md)
- [Database Blueprint](../database/README.md)
- [API Blueprint](../api/README.md)
- [Application Blueprint](../application/README.md)
- [Frontend Blueprint](../frontend/README.md)
- [Backend Blueprint](../backend/README.md)
- [Infrastructure Blueprint](../infrastructure/README.md)
- [Architecture Decision Records](../adr/)

Where a governing decision remains proposed, it remains proposed here. A material security decision that changes architecture or a trust boundary requires Product Owner approval and may require a future ADR.

## How to use this Blueprint

Future implementation work must trace affected assets, trust boundaries, controls, requirements, threats, security events, validation gates, and unresolved decisions. Each implementation phase requires separate approved scope, selected mechanisms, tests, rollout evidence, and rollback authority.

Completion of these documents is documentation completion only. It is not security implementation, production readiness, deployment, certification, or release approval.
