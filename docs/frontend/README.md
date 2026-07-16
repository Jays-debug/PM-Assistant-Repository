# FleetOS Frontend Blueprint v1.0

## Purpose and status

This directory defines the implementation-oriented frontend direction for **FleetOS — Fleet Operating System**, AutoPM, and PM Assistant.

The documents are a design and review baseline. They do not implement frontend source code, select a frontend framework, create a shared FleetOS shell, expose a new API, change authentication or authorization, migrate data, alter deployment, or approve production behavior.

## State legend

| State | Meaning |
|---|---|
| Current implementation evidence | Behavior observed in the repository. It is evidence to assess, not automatically a FleetOS v1.0 requirement or approved contract. |
| Transitional direction | Reversible behavior that may coexist with current applications while approved interfaces and validation evidence are developed. |
| FleetOS v1.0 target | The intended frontend architecture after its dependencies and Product Owner decisions are approved and implemented. |
| Future outside v1.0 | Capability intentionally excluded from the v1.0 frontend baseline. |

Every document keeps these states separate. Proposed diagrams are conceptual and must not be interpreted as deployed topology.

## Document map

| Document | Purpose |
|---|---|
| [Frontend Blueprint](FRONTEND_BLUEPRINT.md) | Scope, application context, boundaries, four-state architecture, cross-cutting direction, risks, and completion criteria. |
| [Information Architecture and Navigation](INFORMATION_ARCHITECTURE_AND_NAVIGATION.md) | FleetOS module navigation, primary and secondary navigation, breadcrumbs, URLs, deep links, and responsive navigation. |
| [Page and Feature Catalog](PAGE_AND_FEATURE_CATALOG.md) | Stable page and feature identifiers, application ownership, page responsibilities, states, and dependencies. |
| [Component and Design System](COMPONENT_AND_DESIGN_SYSTEM.md) | Framework-neutral component hierarchy, design-token direction, and reusable interaction patterns. |
| [Frontend State and Data Flow](FRONTEND_STATE_AND_DATA_FLOW.md) | State ownership, read-only API integration, data adapters, cache/freshness, forms, URLs, and recovery flow. |
| [Responsive, Accessibility, and UX](RESPONSIVE_ACCESSIBILITY_AND_UX.md) | Desktop, tablet, mobile, keyboard, focus, contrast, Thai/Unicode, formatting, and UX rules. |
| [Frontend Validation and Rollout](FRONTEND_VALIDATION_AND_ROLLOUT.md) | Validation gates, testing direction, feature switches, shadow comparison, rollout, rollback, and unresolved decisions. |

## Identifier ownership

Frontend identifiers are defined once in the following registries and may be referenced from any document in this directory:

| Identifier | Registry |
|---|---|
| `APP-*` | [Frontend Blueprint](FRONTEND_BLUEPRINT.md) |
| `PAGE-*`, `FEAT-*` | [Page and Feature Catalog](PAGE_AND_FEATURE_CATALOG.md) |
| `COMPONENT-*` | [Component and Design System](COMPONENT_AND_DESIGN_SYSTEM.md) |
| `UISTATE-*` | [Frontend State and Data Flow](FRONTEND_STATE_AND_DATA_FLOW.md) |
| `UX-*`, `A11Y-*` | [Responsive, Accessibility, and UX](RESPONSIVE_ACCESSIBILITY_AND_UX.md) |
| `VAL-*`, `DEC-*` | [Frontend Validation and Rollout](FRONTEND_VALIDATION_AND_ROLLOUT.md) |

The frontend `VAL-*` and `DEC-*` registries are scoped to `docs/frontend/`. They do not replace similarly named registries in the API, product, domain, database, or other Blueprint documents.

## Fixed guardrails

1. FleetOS is the parent platform.
2. AutoPM and PM Assistant retain their names and remain separate bounded modules, deployment units, and rollback units.
3. Current application screens are implementation evidence only.
4. PM Assistant remains authoritative for maintenance workflow information.
5. AutoPM remains read-only for maintenance workflow information and owns presentation concerns.
6. Direct shared-database access is prohibited.
7. Frontends consume approved read models or versioned APIs; they do not expose persistence tables or ORM models as contracts.
8. Authoritative business rules remain in the owning domain and are not duplicated in browser code.
9. `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` remain separate concepts.
10. `vehicle_no` is a transitional matching key only.
11. `fleetos_vehicle_id` remains proposed and unimplemented.
12. Authentication and authorization UI is proposed until operational evidence proves implementation.
13. No framework, branding system, permission matrix, KPI definition, mileage threshold, production target, or integration is selected by this Blueprint.
14. Secrets and privileged credentials must never appear in frontend source, browser storage, documentation examples, logs, diagnostics, or static assets.

## Governing references

This Blueprint is subordinate to and should be read with:

- [FleetOS Development Guide](../../FLEETOS_DEVELOPMENT_GUIDE.md)
- [FleetOS Architecture](../FLEETOS_ARCHITECTURE.md)
- [Data Ownership](../DATA_OWNERSHIP.md)
- [Identity Contract](../IDENTITY_CONTRACT.md)
- [FleetOS v1.0 Blueprint](../blueprint/FLEETOS_V1_BLUEPRINT.md)
- [FleetOS Product Specification](../product/FLEETOS_PRODUCT_SPECIFICATION.md)
- [FleetOS Domain Model](../domain/DOMAIN_MODEL.md)
- [FleetOS Database Blueprint](../database/DATABASE_BLUEPRINT.md)
- [FleetOS API Blueprint](../api/API_BLUEPRINT.md)
- [FleetOS Application Blueprint](../application/FLEETOS_APPLICATION_BLUEPRINT.md)
- [FleetOS Engineering Standard](../engineering/README.md)
- [ADR-0001: Preserve Module Boundaries](../adr/0001-preserve-module-boundaries.md)
- [ADR-0002: Authoritative Data Ownership](../adr/0002-authoritative-data-ownership.md)
- [ADR-0003: Versioned Read-Only API Boundary](../adr/0003-versioned-api-boundary.md)

Where a governing decision remains proposed or unresolved, this Blueprint retains the same status.

## How to use this Blueprint

A later frontend implementation phase must:

1. identify the exact approved application and pages;
2. resolve or explicitly defer affected `DEC-*` entries;
3. present architecture, security, accessibility, rollout, and rollback impact;
4. receive Product Owner approval before source changes;
5. preserve existing module boundaries and unrelated user changes;
6. validate the applicable `VAL-*` gates;
7. report exact changed files, tests, residual risks, and rollback;
8. stop at the required Git and deployment gates.

Completion of these documents does not make the FleetOS frontend implemented, accessible-conformant, production-ready, deployed, or released.
