# FleetOS Development Guide

- Version: 1.1
- Status: Repository development and documentation navigation guide
- Parent platform: FleetOS — Fleet Operating System

## Development workflow

Every task that may modify project files follows:

```text
Analyze
↓
Explain
↓
Architecture Impact
↓
Risk Analysis
↓
File Plan
↓
Wait Approval
↓
Modify Approved Local Files
↓
Validate
↓
Review
↓
Commit only when explicitly authorized
```

No project file may be modified before approval. Only the exact approved files and scope may be changed.

## Git rules

The Product Owner performs Git operations through the approved human workflow.

Codex must not create branches, commit, push, merge, or deploy unless a later task explicitly authorizes the exact operation. Documentation work does not imply Git authorization.

## Approval and documentation rules

- Every task requires analysis, architecture impact, risk analysis, rollback considerations, and an exact file plan.
- Architecture decisions require an ADR.
- A target, proposed, planned, candidate, or unresolved statement is not operational evidence.
- Every implementation phase requires separate approval and validation.
- Secrets and `.env` values must never be exposed or copied into documentation.

## FleetOS principles

- FleetOS is the parent platform.
- AutoPM and PM Assistant remain independent bounded modules.
- PM Assistant owns authoritative maintenance workflow information.
- AutoPM remains read-only for maintenance workflow information and owns presentation.
- Direct database access between modules is prohibited.
- Approved read models or versioned APIs are the documented integration direction.
- No production deployment occurs without separate approval.

## Repository structure

```text
autopm/
pm-assistant/
docs/
├── README.md
├── adr/
├── api/
├── application/
├── backend/
├── blueprint/
├── database/
├── domain/
├── engineering/
├── frontend/
├── infrastructure/
├── operations/
├── product/
├── review/
└── security/
AGENTS.md
CHANGELOG.md
CONTRIBUTING.md
FLEETOS_DEVELOPMENT_GUIDE.md
PROJECT_CONTEXT.md
README.md
ROADMAP.md
```

## Repository-level navigation

- [Repository README](README.md)
- [Project context](PROJECT_CONTEXT.md)
- [Repository roadmap](ROADMAP.md)
- [Documentation changelog](CHANGELOG.md)
- [FleetOS documentation index](docs/README.md)
- [Repository governance](AGENTS.md)
- [Contribution guide](CONTRIBUTING.md)

## Core architecture and decisions

- [FleetOS Architecture](docs/FLEETOS_ARCHITECTURE.md)
- [Data Ownership](docs/DATA_OWNERSHIP.md)
- [Identity Contract](docs/IDENTITY_CONTRACT.md)
- [API Contract](docs/API_CONTRACT.md)
- [API Error Model](docs/API_ERROR_MODEL.md)
- [Architecture Decision Record index](docs/adr/README.md)

## Engineering Standard

- [Engineering Standard index](docs/engineering/README.md)
- [Development lifecycle](docs/engineering/DEVELOPMENT_LIFECYCLE.md)
- [Git and branch standard](docs/engineering/GIT_AND_BRANCH_STANDARD.md)
- [Coding standard](docs/engineering/CODING_STANDARD.md)
- [API and data standard](docs/engineering/API_AND_DATA_STANDARD.md)
- [Testing and quality standard](docs/engineering/TESTING_AND_QUALITY_STANDARD.md)
- [Security and observability standard](docs/engineering/SECURITY_AND_OBSERVABILITY_STANDARD.md)
- [AI collaboration standard](docs/engineering/AI_COLLABORATION_STANDARD.md)
- [Review and release checklists](docs/engineering/REVIEW_RELEASE_CHECKLISTS.md)

## FleetOS v1.0 Blueprint

- [Blueprint index](docs/blueprint/README.md)
- [FleetOS v1.0 Blueprint](docs/blueprint/FLEETOS_V1_BLUEPRINT.md)
- [System context and module map](docs/blueprint/SYSTEM_CONTEXT_AND_MODULE_MAP.md)
- [Data and integration flow](docs/blueprint/DATA_AND_INTEGRATION_FLOW.md)
- [Deployment and runtime blueprint](docs/blueprint/DEPLOYMENT_AND_RUNTIME_BLUEPRINT.md)
- [Implementation roadmap](docs/blueprint/IMPLEMENTATION_ROADMAP.md)

## Product Specification

- [Product Specification index](docs/product/README.md)
- [FleetOS Product Specification](docs/product/FLEETOS_PRODUCT_SPECIFICATION.md)
- [Functional requirements](docs/product/FUNCTIONAL_REQUIREMENTS.md)
- [Non-functional requirements](docs/product/NON_FUNCTIONAL_REQUIREMENTS.md)
- [User workflows and acceptance](docs/product/USER_WORKFLOWS_AND_ACCEPTANCE.md)
- [Requirements traceability matrix](docs/product/REQUIREMENTS_TRACEABILITY_MATRIX.md)
- [v1 scope and release criteria](docs/product/V1_SCOPE_AND_RELEASE_CRITERIA.md)

## Domain Model

- [Domain Model index](docs/domain/README.md)
- [Canonical Domain Model](docs/domain/DOMAIN_MODEL.md)
- [Entity Catalog](docs/domain/ENTITY_CATALOG.md)
- [Aggregates and Boundaries](docs/domain/AGGREGATES_AND_BOUNDARIES.md)
- [State and Lifecycle Model](docs/domain/STATE_AND_LIFECYCLE_MODEL.md)
- [Domain Events and Audit](docs/domain/DOMAIN_EVENTS_AND_AUDIT.md)
- [Domain Rules and Invariants](docs/domain/DOMAIN_RULES_AND_INVARIANTS.md)

## Database Documentation

- [Database index](docs/database/README.md)
- [Database Blueprint](docs/database/DATABASE_BLUEPRINT.md)
- [Schema Design](docs/database/SCHEMA_DESIGN.md)
- [Table Specification](docs/database/TABLE_SPECIFICATION.md)
- [Index Strategy](docs/database/INDEX_STRATEGY.md)
- [Migration Strategy](docs/database/MIGRATION_STRATEGY.md)
- [Database decision traceability](docs/database/DECISION_TRACEABILITY.md)

## API Blueprint

- [API Blueprint index](docs/api/README.md)
- [API Blueprint](docs/api/API_BLUEPRINT.md)
- [Resource and Endpoint Catalog](docs/api/RESOURCE_AND_ENDPOINT_CATALOG.md)
- [Request and Response Models](docs/api/REQUEST_RESPONSE_MODELS.md)
- [Error, Pagination, and Filtering](docs/api/ERROR_PAGINATION_AND_FILTERING.md)
- [Security, Versioning, and Compatibility](docs/api/SECURITY_VERSIONING_AND_COMPATIBILITY.md)
- [API Validation and Rollout](docs/api/API_VALIDATION_AND_ROLLOUT.md)

## Application Blueprint

- [Application Blueprint index](docs/application/README.md)
- [FleetOS Application Blueprint](docs/application/FLEETOS_APPLICATION_BLUEPRINT.md)
- [Application Modules](docs/application/APPLICATION_MODULES.md)
- [Service Interactions](docs/application/SERVICE_INTERACTIONS.md)
- [Background Jobs](docs/application/BACKGROUND_JOBS.md)
- [State Management](docs/application/STATE_MANAGEMENT.md)
- [Application Deployment](docs/application/APPLICATION_DEPLOYMENT.md)
- [Application Lifecycle](docs/application/APPLICATION_LIFECYCLE.md)
- [Application decision traceability](docs/application/DECISION_TRACEABILITY.md)

## Frontend, backend, infrastructure, security, and operations

- [Frontend Blueprint index](docs/frontend/README.md)
- [Backend Blueprint index](docs/backend/README.md)
- [Infrastructure Blueprint index](docs/infrastructure/README.md)
- [Security Blueprint index](docs/security/README.md)
- [Operations and Observability index](docs/operations/README.md)

Each area index links its complete document set and preserves its declared status and decision gates.

## Enterprise review and readiness

- [Phase 4.9 review index](docs/review/README.md)
- [Enterprise Architecture Review](docs/review/ENTERPRISE_ARCHITECTURE_REVIEW.md)
- [Cross-Reference Matrix](docs/review/CROSS_REFERENCE_MATRIX.md)
- [Implementation Readiness Report](docs/review/IMPLEMENTATION_READINESS_REPORT.md)
- [Unresolved Decisions Register](docs/review/UNRESOLVED_DECISIONS_REGISTER.md)
- [Document Status and Authority Register](docs/review/DOCUMENT_STATUS_AND_AUTHORITY_REGISTER.md)
- [Recommended Phase 5 Implementation Roadmap](docs/review/PHASE5_IMPLEMENTATION_ROADMAP.md)

The Phase 4.9 readiness verdict remains **Hold before implementation** until a separately approved scope satisfies its entry conditions.
