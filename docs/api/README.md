# FleetOS API Blueprint v1.0

## Purpose and status

This directory is the Phase 4.2 implementation-oriented Blueprint for the proposed FleetOS read-only API boundary between PM Assistant and AutoPM.

- Status: **Proposed**
- Blueprint version: `1.0`
- API namespace direction: `/api/v1`
- Provider: PM Assistant
- Consumer: AutoPM
- Decision owner: FleetOS Product Owner

This documentation does not implement or authorize an API, authentication, authorization, rate limiting, PostgreSQL, Railway, Docker, CI/CD, production hosting, deployment, or database migration. Existing documents marked Proposed remain Proposed unless the Product Owner separately changes their status.

## State legend

| Label | Meaning |
| --- | --- |
| **Current evidence** | Directly observed repository behavior; not automatically an approved FleetOS contract. |
| **Transitional direction** | Reversible work intended to compare and prepare the target boundary. |
| **FleetOS v1.0 target** | Proposed design to implement only after its decision and delivery gates are approved. |
| **Future outside v1.0** | Capability explicitly excluded from the read-only v1 boundary. |

## Documents

| Document | Responsibility |
| --- | --- |
| [API Blueprint](API_BLUEPRINT.md) | Scope, ownership, state separation, architecture, and definition of complete. |
| [Resource and Endpoint Catalog](RESOURCE_AND_ENDPOINT_CATALOG.md) | Stable `RES-*` and `EP-*` identifiers, endpoint maturity, authority, and behavior. |
| [Request and Response Models](REQUEST_RESPONSE_MODELS.md) | Stable `REQ-*` and `RSP-*` identifiers, public fields, envelopes, identity, status, time, and Unicode rules. |
| [Error, Pagination, and Filtering](ERROR_PAGINATION_AND_FILTERING.md) | Stable `ERR-*` identifiers, correlation, empty/error behavior, cursors, filters, and sorts. |
| [Security, Versioning, and Compatibility](SECURITY_VERSIONING_AND_COMPATIBILITY.md) | Security direction and stable `COMP-*` compatibility rules. |
| [API Validation and Rollout](API_VALIDATION_AND_ROLLOUT.md) | Stable `VAL-*` gates, `DEC-*` decision register, shadow rollout, rollback, and completion criteria. |

## Governing authority

The API documentation uses this controlling-source relationship:

| Subject | Controlling proposed source | Detailed elaboration |
| --- | --- | --- |
| Read-only boundary, `/api/v1`, endpoint inventory, response direction, and compatibility baseline | [FleetOS API Contract](../API_CONTRACT.md) | This API Blueprint and its resource/request/response documents |
| Error envelope, HTTP/error-code meaning, correlation, and safe disclosure baseline | [FleetOS API Error Model](../API_ERROR_MODEL.md) | [Error, Pagination, and Filtering](ERROR_PAGINATION_AND_FILTERING.md) and validation documents |

The root contract and error model remain `Proposed`. Detailed Blueprint material may specialize or identify gated candidates, but it must not silently replace, expand, or contradict a controlling root contract. Any conflict or expansion requires explicit approval.

This Blueprint must be read with:

- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [Data Ownership](../DATA_OWNERSHIP.md)
- [Identity Contract](../IDENTITY_CONTRACT.md)
- [Proposed API Contract](../API_CONTRACT.md)
- [Proposed API Error Model](../API_ERROR_MODEL.md)
- [FleetOS API and Data Standard](../engineering/API_AND_DATA_STANDARD.md)
- [FleetOS Security and Observability Standard](../engineering/SECURITY_AND_OBSERVABILITY_STANDARD.md)
- [FleetOS v1.0 Blueprint](../blueprint/FLEETOS_V1_BLUEPRINT.md)
- [Canonical Domain Model](../domain/DOMAIN_MODEL.md)
- [Database Blueprint](../database/DATABASE_BLUEPRINT.md)
- [ADR registry](../adr/README.md)

When documents differ, their stated authority and approval status apply. This Blueprint does not silently resolve a conflict or promote a proposed decision. A conflict must be recorded in the decision register and escalated.

## Fixed guardrails

1. FleetOS is the parent platform; AutoPM and PM Assistant remain separate modules.
2. PM Assistant owns authoritative maintenance workflow information.
3. AutoPM consumes approved maintenance information read-only and owns presentation.
4. Direct shared-database access and AutoPM writes to PM Assistant persistence are prohibited.
5. Existing unversioned routes, ORM entities, and tables are implementation evidence, not public API models.
6. `vehicle_no` is a transitional matching key only.
7. `fleetos_vehicle_id` is proposed and unimplemented; it must never be fabricated.
8. `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` are independent domains.
9. Purpose-built read models expose only approved fields and safe metadata.
10. Unresolved business rules, permissions, thresholds, identities, infrastructure, and integrations remain explicit decisions.

## Identifier registry

Identifiers are unique across their own type and are defined in one owning document:

- Resources: `RES-001` through `RES-011`
- Endpoints: `EP-001` through `EP-014`
- Request models: `REQ-001` through `REQ-012`
- Response models: `RSP-001` through `RSP-014`
- Error cases: `ERR-001` through `ERR-019`
- Compatibility rules: `COMP-001` through `COMP-012`
- Validation gates: `VAL-001` through `VAL-016`
- Unresolved decisions: `DEC-001` through `DEC-018`

References use the identifier rather than duplicating or changing its meaning. New identifiers must be appended and checked for uniqueness before review.

## Blueprint use

The Blueprint is a design and acceptance baseline, not implementation authorization. A later implementation phase must receive its own Product Owner approval, identify exact source files, resolve the applicable `DEC-*` gates, and pass the relevant `VAL-*` gates.
