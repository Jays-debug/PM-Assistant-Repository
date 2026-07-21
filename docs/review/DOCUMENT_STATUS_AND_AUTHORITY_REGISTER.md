# FleetOS Document Status and Authority Register

## Purpose

This register makes document status and authority discoverable without changing the acceptance state of any architecture decision, contract, requirement, or implementation gate.

- Status: Repository metadata register
- Review date: 2026-07-21
- Implementation authorization: None

## Status meanings

| Classification | Meaning |
| --- | --- |
| Declared | The file or its owning index explicitly states a status. |
| Inherited | The file inherits the non-operational status and interpretation rules of its owning directory index. |
| Repository index or record | Navigation, context, roadmap, changelog, or review evidence; it does not create architecture authority. |
| Historical plan | Evidence of an earlier approved phase scope; not the current repository status. |
| Undetermined acceptance | No acceptance action is inferred. Proposed or unresolved dependencies remain unchanged. |

## Repository-level documents

| Files | Status and authority |
| --- | --- |
| `README.md`, `PROJECT_CONTEXT.md`, `ROADMAP.md`, `CHANGELOG.md` | Repository indexes and records. They summarize and link governing sources; they do not accept decisions. |
| `AGENTS.md` | Repository governance. Task-specific approval remains required. |
| `FLEETOS_DEVELOPMENT_GUIDE.md`, `CONTRIBUTING.md` | Development guidance subordinate to repository governance and explicit Product Owner direction. |

## Core documents under `docs/`

| File | Status and authority |
| --- | --- |
| `docs/README.md` | Documentation index only. |
| `docs/FLEETOS_IMPLEMENTATION_GUIDE.md` | Phase 5.0 documentation-only implementation-entry map. It is subordinate to repository governance, accepted decisions, controlling contracts, and the Engineering Standard; it adds no architecture authority and authorizes no implementation. |
| `docs/FLEETOS_ARCHITECTURE.md` | High-level architecture baseline; controlling proposed ADR and contract statuses are preserved. |
| `docs/DATA_OWNERSHIP.md` | Architecture ownership contract containing approved principles and explicit unresolved ownership areas. |
| `docs/IDENTITY_CONTRACT.md` | Identity contract with transitional and proposed identity direction; unresolved lifecycle decisions remain unresolved. |
| `docs/API_CONTRACT.md` | Declared `Proposed`; controlling proposed API contract. |
| `docs/API_ERROR_MODEL.md` | Declared `Proposed`; controlling proposed API error model. |
| `docs/PHASE_2_PLAN.md` | Historical approved phase plan; not the current status index. |

## Directory status coverage

Every file named below inherits the status and interpretation rules of its directory index unless the file declares a more specific status.

| Area | Files covered | Status and authority |
| --- | --- | --- |
| ADR | `README.md`; `0001-preserve-module-boundaries.md`; `0002-authoritative-data-ownership.md`; `0003-versioned-api-boundary.md`; `0004-pm-assistant-local-vehicle-write-authority.md` | Index only; ADR-0001 through ADR-0003 remain `Proposed`. ADR-0004 is `Accepted` for its limited PM Assistant-local Vehicle creation scope. |
| Engineering | `README.md`; `AI_COLLABORATION_STANDARD.md`; `API_AND_DATA_STANDARD.md`; `CODING_STANDARD.md`; `DEVELOPMENT_LIFECYCLE.md`; `GIT_AND_BRANCH_STANDARD.md`; `REVIEW_RELEASE_CHECKLISTS.md`; `SECURITY_AND_OBSERVABILITY_STANDARD.md`; `TESTING_AND_QUALITY_STANDARD.md` | Product Owner review baseline. It does not replace architecture or task approval. |
| Blueprint | `README.md`; `FLEETOS_V1_BLUEPRINT.md`; `SYSTEM_CONTEXT_AND_MODULE_MAP.md`; `DATA_AND_INTEGRATION_FLOW.md`; `DEPLOYMENT_AND_RUNTIME_BLUEPRINT.md`; `IMPLEMENTATION_ROADMAP.md` | Documentation baseline. Proposed dependencies remain proposed; target material is not operational. |
| Product | `README.md`; `FLEETOS_PRODUCT_SPECIFICATION.md`; `USER_ROLES_AND_PERSONAS.md`; `FUNCTIONAL_REQUIREMENTS.md`; `NON_FUNCTIONAL_REQUIREMENTS.md`; `USER_WORKFLOWS_AND_ACCEPTANCE.md`; `V1_SCOPE_AND_RELEASE_CRITERIA.md`; `REQUIREMENTS_TRACEABILITY_MATRIX.md` | Product specification baseline for Product Owner review. Conditional requirements and decision gates remain conditional. |
| Domain | `README.md`; `DOMAIN_MODEL.md`; `ENTITY_CATALOG.md`; `AGGREGATES_AND_BOUNDARIES.md`; `STATE_AND_LIFECYCLE_MODEL.md`; `DOMAIN_EVENTS_AND_AUDIT.md`; `DOMAIN_RULES_AND_INVARIANTS.md` | Canonical conceptual documentation contract. Unresolved `domain:DEC-*` decisions remain unresolved. |
| Database | `README.md`; `DATABASE_BLUEPRINT.md`; `SCHEMA_DESIGN.md`; `TABLE_SPECIFICATION.md`; `INDEX_STRATEGY.md`; `MIGRATION_STRATEGY.md`; `DECISION_TRACEABILITY.md` | Documentation-only logical database blueprint. No physical technology, migration, or operational status is accepted. |
| API Blueprint | `README.md`; `API_BLUEPRINT.md`; `RESOURCE_AND_ENDPOINT_CATALOG.md`; `REQUEST_RESPONSE_MODELS.md`; `ERROR_PAGINATION_AND_FILTERING.md`; `SECURITY_VERSIONING_AND_COMPATIBILITY.md`; `API_VALIDATION_AND_ROLLOUT.md` | Declared `Proposed`; subordinate detailed elaboration of the proposed root API contract and error model. |
| Application | `README.md`; `FLEETOS_APPLICATION_BLUEPRINT.md`; `APPLICATION_MODULES.md`; `SERVICE_INTERACTIONS.md`; `BACKGROUND_JOBS.md`; `STATE_MANAGEMENT.md`; `APPLICATION_DEPLOYMENT.md`; `APPLICATION_LIFECYCLE.md`; `DECISION_TRACEABILITY.md` | Declared `Proposed`; documentation only. |
| Frontend | `README.md`; `FRONTEND_BLUEPRINT.md`; `PAGE_AND_FEATURE_CATALOG.md`; `INFORMATION_ARCHITECTURE_AND_NAVIGATION.md`; `COMPONENT_AND_DESIGN_SYSTEM.md`; `FRONTEND_STATE_AND_DATA_FLOW.md`; `RESPONSIVE_ACCESSIBILITY_AND_UX.md`; `FRONTEND_VALIDATION_AND_ROLLOUT.md` | Design and review baseline. Target behavior and conformance remain unimplemented unless separately evidenced. |
| Backend | `README.md`; `BACKEND_BLUEPRINT.md`; `BACKEND_MODULE_AND_LAYER_CATALOG.md`; `APPLICATION_SERVICE_AND_USE_CASES.md`; `REPOSITORY_AND_PERSISTENCE_BOUNDARIES.md`; `TRANSACTION_ERROR_AND_VALIDATION_MODEL.md`; `CONFIGURATION_DEPENDENCY_AND_RUNTIME.md`; `BACKEND_VALIDATION_AND_ROLLOUT.md` | Declared `Proposed`; documentation only. |
| Infrastructure | `README.md`; `INFRASTRUCTURE_BLUEPRINT.md`; `ENVIRONMENT_ARCHITECTURE.md`; `NETWORK_AND_SECURITY.md`; `STORAGE_AND_BACKUP.md`; `CI_CD_AND_DEPLOYMENT.md`; `MONITORING_AND_LOGGING.md`; `SCALING_AND_HIGH_AVAILABILITY.md`; `DISASTER_RECOVERY_AND_ROLLBACK.md` | Declared `Proposed`; no vendor, topology, provisioning, or operational claim is accepted. |
| Security | `README.md`; `SECURITY_BLUEPRINT.md`; `IDENTITY_AUTHENTICATION_AND_SESSION.md`; `AUTHORIZATION_ROLES_AND_ACCESS_CONTROL.md`; `DATA_PROTECTION_PRIVACY_AND_RETENTION.md`; `APPLICATION_API_AND_FRONTEND_SECURITY.md`; `INFRASTRUCTURE_SECRETS_AND_SUPPLY_CHAIN.md`; `THREAT_MODEL_INCIDENT_AND_AUDIT.md`; `SECURITY_VALIDATION_AND_ROLLOUT.md` | Security design baseline. Controls are not operational merely because documented. |
| Operations | `README.md`; `OPERATIONS_AND_OBSERVABILITY_BLUEPRINT.md`; `MONITORING_AND_ALERTING.md`; `LOGGING_AND_AUDIT_OBSERVABILITY.md`; `SERVICE_HEALTH_AND_READINESS.md`; `INCIDENT_RESPONSE_AND_RUNBOOKS.md`; `OPERATIONAL_METRICS_AND_SLOS.md`; `BACKUP_RESTORE_AND_BUSINESS_CONTINUITY.md`; `OPERATIONS_VALIDATION_AND_ROLLOUT.md` | Declared `Proposed`; no operational owner, platform, target, or runtime capability is accepted. |
| Enterprise Review | `README.md`; `ENTERPRISE_ARCHITECTURE_REVIEW.md`; `CROSS_REFERENCE_MATRIX.md`; `IMPLEMENTATION_READINESS_REPORT.md`; `UNRESOLVED_DECISIONS_REGISTER.md`; `PHASE5_IMPLEMENTATION_ROADMAP.md`; `DOCUMENT_STATUS_AND_AUTHORITY_REGISTER.md`; `PHASE_4_9_1_REMEDIATION_REPORT.md` | Review and derived governance evidence. Findings and recommendations do not accept architecture or authorize implementation. |

## Acceptance-state summary

| Governing source | Acceptance state |
| --- | --- |
| ADR-0001, ADR-0002, ADR-0003 | Proposed |
| ADR-0004 | Accepted architecture direction; no implementation authorization |
| FleetOS API Contract | Proposed |
| FleetOS API Error Model | Proposed |
| API Blueprint | Proposed |
| Application Blueprint | Proposed |
| Backend Blueprint | Proposed |
| Infrastructure Blueprint | Proposed |
| Operations Blueprint | Proposed |
| Unresolved decision registries | Unresolved |
| Phase 5 roadmap | Recommendation only |

This register must not be used to infer acceptance where an explicit Product Owner decision is absent.
