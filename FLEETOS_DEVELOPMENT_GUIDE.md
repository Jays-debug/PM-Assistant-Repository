# FleetOS Development Guide

Version 1.0

---

## Development Workflow

Every engineering task follows this workflow.

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

Modify Local Files

↓

Validate

↓

Review

↓

Commit (GitHub Desktop)

↓

Push

↓

Pull Request

↓

Merge

---

## Git Rules

GitHub Desktop is the source of truth.

Codex must never:

- create branches
- commit
- push
- merge
- deploy

The Product Owner performs Git operations.

---

## Branch Naming

phase-3-4-api-gateway

phase-4-1-dashboard

phase-5-authentication

---

## Approval Rules

No file modifications before approval.

Only approved files may be changed.

---

## Documentation Rules

Every architecture decision requires an ADR.

Every Phase requires a Pull Request.

---

## FleetOS Principles

AutoPM and PM Assistant remain independent modules.

Direct database access between modules is prohibited.

Use documented API contracts.

No production deployment without approval.

---

## Repository Structure

autopm/

pm-assistant/

docs/

adr/

README.md

AGENTS.md

PROJECT_CONTEXT.md

ROADMAP.md

---

## Engineering Standard

FleetOS Engineering Standard v1.0:

- [Engineering Standard index](docs/engineering/README.md)
- [Development lifecycle](docs/engineering/DEVELOPMENT_LIFECYCLE.md)
- [Git and branch standard](docs/engineering/GIT_AND_BRANCH_STANDARD.md)
- [Coding standard](docs/engineering/CODING_STANDARD.md)
- [API and data standard](docs/engineering/API_AND_DATA_STANDARD.md)
- [Testing and quality standard](docs/engineering/TESTING_AND_QUALITY_STANDARD.md)
- [Security and observability standard](docs/engineering/SECURITY_AND_OBSERVABILITY_STANDARD.md)
- [AI collaboration standard](docs/engineering/AI_COLLABORATION_STANDARD.md)
- [Review and release checklists](docs/engineering/REVIEW_RELEASE_CHECKLISTS.md)

---

## FleetOS v1.0 Blueprint

- [Blueprint index](docs/blueprint/README.md)
- [FleetOS v1.0 Blueprint](docs/blueprint/FLEETOS_V1_BLUEPRINT.md)
- [System context and module map](docs/blueprint/SYSTEM_CONTEXT_AND_MODULE_MAP.md)
- [Data and integration flow](docs/blueprint/DATA_AND_INTEGRATION_FLOW.md)
- [Deployment and runtime blueprint](docs/blueprint/DEPLOYMENT_AND_RUNTIME_BLUEPRINT.md)
- [Implementation roadmap](docs/blueprint/IMPLEMENTATION_ROADMAP.md)

---

## FleetOS Product Specification v1.0

- [Product Specification index](docs/product/README.md)
- [FleetOS Product Specification](docs/product/FLEETOS_PRODUCT_SPECIFICATION.md)
- [User roles and personas](docs/product/USER_ROLES_AND_PERSONAS.md)
- [Functional requirements](docs/product/FUNCTIONAL_REQUIREMENTS.md)
- [Non-functional requirements](docs/product/NON_FUNCTIONAL_REQUIREMENTS.md)
- [User workflows and acceptance](docs/product/USER_WORKFLOWS_AND_ACCEPTANCE.md)
- [v1 scope and release criteria](docs/product/V1_SCOPE_AND_RELEASE_CRITERIA.md)

---

## FleetOS Domain Model v1.0

- [Domain Model index](docs/domain/README.md)
- [Canonical Domain Model](docs/domain/DOMAIN_MODEL.md)
- [Entity Catalog](docs/domain/ENTITY_CATALOG.md)
- [Aggregates and Boundaries](docs/domain/AGGREGATES_AND_BOUNDARIES.md)
- [State and Lifecycle Model](docs/domain/STATE_AND_LIFECYCLE_MODEL.md)
- [Domain Events and Audit](docs/domain/DOMAIN_EVENTS_AND_AUDIT.md)
- [Domain Rules and Invariants](docs/domain/DOMAIN_RULES_AND_INVARIANTS.md)
