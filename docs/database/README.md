# FleetOS Database Documentation

## Purpose and status

This directory contains the Phase 4.1 database architecture blueprint for FleetOS. It is documentation only. It does not create or migrate a database, select a database engine or migration framework, approve a hosting platform, or change application behavior.

PM Assistant remains the authoritative maintenance persistence boundary. AutoPM may consume only approved read models or versioned APIs. AutoPM must never receive database credentials, direct table access, shared schema access, or database write access. Direct shared-database coupling is prohibited.

## State labels

The documents use these labels consistently:

| Label | Meaning |
| --- | --- |
| Current | Repository implementation evidence observed in PM Assistant, including SQLAlchemy and SQLite. It is not automatically an approved target contract. |
| Transitional | Controlled direction for reconciling and moving from current evidence toward an approved target. |
| FleetOS v1.0 target | Logical database design required to support the approved FleetOS boundaries. Infrastructure and implementation choices remain gated where stated. |
| Future | Decisions outside Phase 4.1 that require separate Product Owner approval and, where applicable, an ADR. |

Nothing labeled target, candidate, proposed, or future is operational merely because it appears in this documentation.

## Documents

- [Database Blueprint](DATABASE_BLUEPRINT.md) — ownership boundary, state progression, logical architecture, security, and operational direction.
- [Schema Design](SCHEMA_DESIGN.md) — domain organization, relationship rules, identity, status, history, provenance, and integrity principles.
- [Table Specification](TABLE_SPECIFICATION.md) — current implementation inventory and conceptual target table specifications.
- [Index Strategy](INDEX_STRATEGY.md) — access-pattern-driven candidate indexes and validation requirements.
- [Migration Strategy](MIGRATION_STRATEGY.md) — inventory, profiling, staged migration, reconciliation, cutover, and recovery gates.

## Governing documents

These database documents specialize, but do not replace:

- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [FleetOS Data Ownership](../DATA_OWNERSHIP.md)
- [FleetOS Identity Contract](../IDENTITY_CONTRACT.md)
- [FleetOS API Contract](../API_CONTRACT.md)
- [FleetOS API Error Model](../API_ERROR_MODEL.md)
- [FleetOS v1.0 Blueprint](../blueprint/FLEETOS_V1_BLUEPRINT.md)
- [Data and Integration Flow](../blueprint/DATA_AND_INTEGRATION_FLOW.md)
- [FleetOS API and Data Standard](../engineering/API_AND_DATA_STANDARD.md)
- [FleetOS Security and Observability Standard](../engineering/SECURITY_AND_OBSERVABILITY_STANDARD.md)
- [FleetOS Product Specification](../product/FLEETOS_PRODUCT_SPECIFICATION.md)
- [Functional Requirements](../product/FUNCTIONAL_REQUIREMENTS.md)
- [Non-Functional Requirements](../product/NON_FUNCTIONAL_REQUIREMENTS.md)
- [ADR-0001: Preserve Module Boundaries](../adr/0001-preserve-module-boundaries.md)
- [ADR-0002: Authoritative Data Ownership](../adr/0002-authoritative-data-ownership.md)

If a conflict is found, stop and obtain an approved resolution rather than treating this blueprint as authority to change implementation.

## Phase 4.1 exclusions

Phase 4.1 does not authorize:

- application, ORM, migration, seed, configuration, or infrastructure code;
- changes to AutoPM or PM Assistant;
- database creation, data mutation, migration, deployment, or cutover;
- selection of PostgreSQL, a migration framework, UUID strategy, ORM architecture, hosting platform, Railway, Docker, or production topology;
- authentication, authorization, retention, backup, recovery, or service-level claims as operational;
- creation of `fleetos_vehicle_id` or any other unresolved enterprise identity.

## Unresolved decision register

The following require later approval and may require dedicated ADRs:

- production database engine and topology;
- versioned migration framework and ownership;
- internal identifier types and generation rules;
- enterprise Vehicle Master owner and `fleetos_vehicle_id` lifecycle;
- stable location, fleet, business-unit, user, and responsibility identities;
- odometer source ownership and mileage validation rules;
- status vocabularies and transition rules;
- retention, privacy, deletion, archival, and legal-hold policies;
- authentication, authorization, database roles, encryption, backup, restore, recovery objectives, and operational ownership;
- migration acceptance thresholds, cutover window, and rollback versus forward-recovery criteria.
