# FleetOS Domain Model v1.0

## Purpose and status

This directory defines the canonical conceptual domain model for **FleetOS — Fleet Operating System** Phase 3.6.

The model establishes business vocabulary, ownership boundaries, relationships, aggregate direction, lifecycle direction, domain events, audit expectations, rules, invariants, and unresolved Product Owner decisions required before physical database design or application implementation.

It is a documentation contract. It does not claim that the proposed domain structures, `/api/v1`, production authentication, a canonical vehicle registry, a production datastore, or domain-event infrastructure are implemented or operational.

## Interpretation model

Every domain statement uses one of four states:

| State | Meaning |
| --- | --- |
| Current implementation evidence | Behavior or structure directly observed in repository source or existing documentation. It is not automatically an approved domain rule. |
| Transitional domain model | Controlled behavior required while legacy sources, local identifiers, and current routes remain in use. |
| FleetOS v1.0 target domain model | Required or proposed v1 business direction, subject to the approval status and unresolved decisions cited by the statement. |
| Future outside v1.0 | A concept intentionally excluded from v1 implementation unless separately analyzed and approved. |

When a target concept depends on an unresolved decision, the decision identifier is shown. A target direction must not be implemented as a settled rule until its blocking decision is approved.

## Documents

- [Canonical Domain Model](DOMAIN_MODEL.md) — vocabulary, bounded contexts, conceptual relationships, state separation, and completeness criteria.
- [Entity Catalog](ENTITY_CATALOG.md) — entities, value objects, ownership, identity, and conceptual relationships.
- [Aggregates and Boundaries](AGGREGATES_AND_BOUNDARIES.md) — aggregate roots, consistency direction, allowed references, and module boundaries.
- [State and Lifecycle Model](STATE_AND_LIFECYCLE_MODEL.md) — transition catalog and lifecycle diagrams.
- [Domain Events and Audit](DOMAIN_EVENTS_AND_AUDIT.md) — conceptual domain-event facts, event flow, lineage, and audit requirements.
- [Domain Rules and Invariants](DOMAIN_RULES_AND_INVARIANTS.md) — business rules, invariants, conflict handling, idempotency, history preservation, and decision register.

## Identifier registry

| Prefix | Element |
| --- | --- |
| `ENT` | Entity |
| `AGG` | Aggregate |
| `VO` | Value object |
| `DR` | Domain rule |
| `INV` | Invariant |
| `ST` | State transition |
| `EVT` | Domain event |
| `DEC` | Unresolved Product Owner decision |

Identifiers are unique within this Domain Model set and remain stable once referenced by later approved work. Renaming or reusing an identifier requires explicit review.

## Authority and precedence

Apply this model with the status of its authoritative sources preserved:

1. [Repository governance](../../AGENTS.md)
2. [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
3. [Data Ownership](../DATA_OWNERSHIP.md)
4. [Identity Contract](../IDENTITY_CONTRACT.md)
5. [API Contract](../API_CONTRACT.md) and [API Error Model](../API_ERROR_MODEL.md)
6. [Architecture decision records](../adr/)
7. [FleetOS v1.0 Blueprint](../blueprint/README.md)
8. [FleetOS Product Specification v1.0](../product/README.md)
9. [FleetOS Engineering Standard](../engineering/README.md)

This model specializes those sources for domain design; it does not supersede their architecture, API, security, deployment, or approval rules. A conflict must be escalated to the Product Owner instead of resolved through implementation guesswork.

## Fixed guardrails

- FleetOS is the parent platform.
- AutoPM and PM Assistant remain separate bounded modules and rollback units.
- PM Assistant owns authoritative maintenance workflow information.
- AutoPM is read-only for maintenance workflow information and owns presentation.
- Direct shared-database access is prohibited.
- `vehicle_no` is a transitional matching key only.
- `fleetos_vehicle_id` is proposed and unimplemented.
- `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` are separate concepts.
- Current tables, ORM classes, routes, labels, and calculations are implementation evidence, not automatically approved domain elements or rules.
- This phase does not design tables, columns, keys, indexes, ORM mappings, database engines, migrations, hosting, or deployment topology.

