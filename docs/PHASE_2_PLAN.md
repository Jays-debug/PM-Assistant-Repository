# Phase 2 — FleetOS Architecture and Deployment Readiness

## Objectives

- Establish FleetOS as the parent-platform identity without renaming existing modules or technical resources.
- Define controlled, approval-based development governance.
- Produce verified evidence for secure configuration, Railway readiness, PostgreSQL compatibility, migration, staging, integrations, and mobile use.
- Reduce deployment and migration risk before AutoPM integration.

## Scope

Phase 2 comprises:

- 2.0 Naming and governance
- 2.1 Confirm source of truth
- 2.2 Security and secret cleanup
- 2.3 Configuration refactor
- 2.4 Railway readiness
- 2.5 PostgreSQL compatibility
- 2.6 Migration rehearsal
- 2.7 Staging deployment
- 2.8 LINE webhook and scheduler validation
- 2.9 Mobile testing

Each subphase requires analysis, architecture-impact and risk review, an explicit plan, human approval before modification, validation, and a review summary.

## Out of scope

- Renaming AutoPM or PM Assistant.
- Renaming folders, Python modules, API paths, database tables, URLs, Netlify projects, Railway projects, or application screens.
- AutoPM integration, which belongs to Phase 3.
- Unapproved production deployment or production data migration.
- Repository-visibility changes.
- Feature development unrelated to deployment readiness.

## Risks

- An incorrectly identified source of truth could cause lost or conflicting changes.
- Existing secrets may be exposed in history, configuration, logs, or documentation.
- SQLite-specific behavior may fail under PostgreSQL.
- Scheduler or webhook behavior may change under multi-process or hosted execution.
- Staging may accidentally connect to production data or external targets.
- Mobile workflows may have usability or compatibility gaps.
- Naming changes may be over-applied to technical identifiers that must remain stable.

## Approval gates

1. **Governance gate:** approve platform terminology, repository rules, and Phase 2 plan.
2. **Source-of-truth gate:** approve authoritative repositories, branches, data sources, and deployed versions.
3. **Security gate:** approve the secret-remediation inventory and rotation plan before changing credentials.
4. **Configuration gate:** approve configuration boundaries and environment-variable contracts.
5. **Deployment gate:** approve Railway runtime design and staging isolation before deployment.
6. **Database gate:** approve PostgreSQL compatibility findings and migration/rollback procedures.
7. **Integration gate:** approve LINE webhook and scheduler validation criteria and test targets.
8. **Release gate:** approve Phase 2 evidence before Phase 3 begins.

## Deliverables

- FleetOS naming and governance documentation.
- Confirmed source-of-truth register.
- Secret inventory and remediation record without secret values.
- Configuration contract and environment matrix.
- Railway readiness assessment and runbook.
- PostgreSQL compatibility report.
- Migration rehearsal report with backup and rollback evidence.
- Isolated staging deployment and validation record.
- LINE webhook and scheduler validation report.
- Mobile test matrix and results.
- Phase 2 completion summary and Phase 3 recommendation.

## Rollback

- Documentation changes can be reverted as one isolated change set.
- Configuration and deployment changes must retain the prior working configuration and version for restoration.
- Secret rotation must use provider-supported replacement and revocation procedures; revoked secrets must never be restored.
- Database work requires verified backups, an explicit restore procedure, and reconciliation checks before approval.
- Staging must be isolated so rollback cannot affect production data or external targets.

## Definition of done

Phase 2 is complete when:

- All subphases 2.0 through 2.9 have completed their approval gates.
- FleetOS is consistently documented as the parent platform while AutoPM and PM Assistant remain unchanged.
- No prohibited technical identifiers were renamed.
- Source-of-truth, security, configuration, Railway, PostgreSQL, migration, staging, LINE, scheduler, and mobile evidence is reviewed and accepted.
- Relevant tests and checks pass, or approved exceptions are documented.
- Rollback procedures are tested where applicable.
- The completion summary is approved before Phase 3 begins.
