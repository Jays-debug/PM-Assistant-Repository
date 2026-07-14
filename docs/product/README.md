# FleetOS Product Specification v1.0

## Purpose

This directory contains the official product-definition baseline for **FleetOS — Fleet Operating System v1.0**. It defines the product problem, users, module capabilities, required workflows, requirements, acceptance criteria, release boundaries, limitations, and unresolved Product Owner decisions.

These documents define the intended product outcome. They do not claim that proposed APIs, authentication, authorization, hosted infrastructure, database migration, canonical FleetOS identities, or production controls are operational.

## Document status

- Version: 1.0
- Status: Product specification baseline for Product Owner review
- Product: FleetOS — Fleet Operating System
- Modules: AutoPM and PM Assistant
- Decision owner: FleetOS Product Owner

Requirements remain subject to their stated decision gates. A requirement that depends on an unresolved decision is not implementation authorization.

## State model

Every document uses these states consistently:

| State | Meaning |
| --- | --- |
| **Current capability** | Behavior directly evidenced in the repository. It is not automatically an approved v1 requirement. |
| **Transitional capability** | Temporary, controlled behavior used while moving from current implementation to the v1 target. |
| **FleetOS v1.0 requirement** | Product behavior or control required for v1 after approval, implementation, and validation. |
| **Future capability outside v1.0** | Deferred direction that is not required for the v1 release. |

Proposed, planned, unresolved, and target statements must not be interpreted as operational claims.

## Product documents

1. [FleetOS Product Specification](FLEETOS_PRODUCT_SPECIFICATION.md) — vision, business problem, objectives, module capabilities, limitations, and definition of product complete.
2. [User Roles and Personas](USER_ROLES_AND_PERSONAS.md) — evidence-supported users, responsibilities, needs, boundaries, and unresolved permission decisions.
3. [Functional Requirements](FUNCTIONAL_REQUIREMENTS.md) — uniquely identified product behavior by capability domain.
4. [Non-Functional Requirements](NON_FUNCTIONAL_REQUIREMENTS.md) — security, reliability, performance, data quality, usability, accessibility, observability, compatibility, and recovery direction.
5. [User Workflows and Acceptance](USER_WORKFLOWS_AND_ACCEPTANCE.md) — critical workflows, exception paths, and acceptance criteria.
6. [v1 Scope and Release Criteria](V1_SCOPE_AND_RELEASE_CRITERIA.md) — release boundaries, out-of-scope capabilities, decision gates, release evidence, and final completion criteria.

## Fixed product guardrails

- FleetOS is the parent platform.
- AutoPM and PM Assistant remain separate bounded modules and deployment boundaries.
- PM Assistant owns authoritative maintenance workflow information.
- AutoPM is read-only for maintenance workflow information and owns presentation.
- Direct shared-database access is prohibited.
- `vehicle_no` is a transitional matching key only.
- `fleetos_vehicle_id` is proposed for the future and is not implemented.
- `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` are separate concepts.
- Current source code is implementation evidence, not automatic approval of a FleetOS v1 requirement or cross-module contract.
- Proposed architecture or infrastructure must not be described as operational without implementation and validation evidence.

## Authority and related references

This specification is read with, and does not replace:

- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [Data Ownership](../DATA_OWNERSHIP.md)
- [Identity Contract](../IDENTITY_CONTRACT.md)
- [API Contract](../API_CONTRACT.md)
- [API Error Model](../API_ERROR_MODEL.md)
- [FleetOS v1.0 Blueprint](../blueprint/README.md)
- [Architecture Decision Records](../adr/)
- [FleetOS Engineering Standard](../engineering/README.md)
- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [Repository Governance](../../AGENTS.md)

Where a referenced source is marked `Proposed` or Product Owner review, that decision retains the same status here. Conflicts or missing decisions are Product Owner gates; they must not be resolved through implementation guesswork.

