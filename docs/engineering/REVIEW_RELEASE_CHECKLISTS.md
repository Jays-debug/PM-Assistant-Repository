# FleetOS Review and Release Checklists

Version 1.0

Use the applicable sections. Mark a requirement not applicable only with a clear reason.

## Pre-change checklist

- [ ] Applicable `AGENTS.md`, task instructions, contracts, and ADRs were inspected.
- [ ] Current behavior and repository evidence were identified.
- [ ] Proposed outcome and exclusions were explained.
- [ ] Architecture, ownership, identity, API, data, security, and operational impacts were assessed.
- [ ] Risks and rollback were documented.
- [ ] Exact file-level plan was presented.
- [ ] Product Owner approved the scope before modification.
- [ ] Git, deployment, migration, credential, and external-service permissions are understood separately.

## Implementation checklist

- [ ] Only approved files were changed.
- [ ] Unrelated human changes were preserved.
- [ ] AutoPM and PM Assistant boundaries remain intact.
- [ ] PM Assistant remains authoritative for maintenance workflow information.
- [ ] AutoPM remains read-only for maintenance workflow information.
- [ ] No direct shared-database access was introduced.
- [ ] `vehicle_no` remains transitional and `fleetos_vehicle_id` remains proposed unless a later approved decision changes that state.
- [ ] The four status domains remain separate.
- [ ] Current, transitional, proposed, and operational states are labeled accurately.
- [ ] No secret, credential, sensitive fixture, local database, or generated log was added.

## Code review checklist

- [ ] The change satisfies the approved outcome without unnecessary scope.
- [ ] Names and structure communicate domain ownership clearly.
- [ ] Business logic is not duplicated across modules.
- [ ] Input, null, encoding, timezone, and failure behavior are explicit.
- [ ] Public schemas do not expose ORM or persistence internals.
- [ ] Security boundaries and sensitive-data redaction were reviewed.
- [ ] Compatibility and deprecation effects were assessed.
- [ ] New dependencies are necessary and reviewed.
- [ ] Comments and documentation explain non-obvious decisions.
- [ ] Relevant automated and manual tests pass.

## API and data review checklist

- [ ] Authoritative owner and allowed writers/readers are explicit.
- [ ] API version, path, field, envelope, error, and correlation behavior follow approved contracts.
- [ ] Breaking-change analysis was completed.
- [ ] Identity ambiguity is quarantined rather than guessed.
- [ ] Original and normalized values and provenance are retained where required.
- [ ] Empty, unavailable, stale, and conflicting data are represented distinctly.
- [ ] Import, replay, idempotency, audit, and partial-failure behavior are defined.
- [ ] Migration, backup, reconciliation, and rollback evidence exists where applicable.
- [ ] Existing ADR/API inconsistencies were escalated rather than silently resolved.

## Documentation review checklist

- [ ] Markdown headings and code fences are structurally valid.
- [ ] Relative links resolve to the intended file or directory.
- [ ] Terminology matches FleetOS, AutoPM, and PM Assistant contracts.
- [ ] Required status field names are exact and separate.
- [ ] Proposed infrastructure is not presented as operational.
- [ ] Specialized authoritative documents are referenced rather than replaced.
- [ ] Commands and examples are safe and contain no secrets.
- [ ] Documentation reflects the actual approved scope and validation.

## Security and observability checklist

- [ ] Secret-pattern and sensitive-data review passed.
- [ ] Environment-variable handling uses names or safe placeholders only.
- [ ] Authentication and authorization claims match evidence.
- [ ] CORS, webhook, upload, cache, timeout, retry, and rate-limit effects were reviewed where applicable.
- [ ] Logs and errors redact secrets and sensitive payloads.
- [ ] Correlation IDs are diagnostic only and safely validated.
- [ ] Liveness/readiness disclose only coarse state.
- [ ] Audit and retention requirements are addressed or listed as unresolved.
- [ ] Scheduler and notification duplicate/failure visibility is tested where applicable.

## Pull Request review checklist

- [ ] A human created the branch, commit, push, and Pull Request.
- [ ] Pull Request title and description follow the Git standard.
- [ ] Scope, architecture impact, changed files, validation, risks, and rollback are included.
- [ ] Required owner review was requested.
- [ ] Review comments are resolved or explicitly accepted.
- [ ] Required checks pass and limitations are documented.
- [ ] No unapproved scope entered the diff.
- [ ] Product Owner approval is recorded before merge.

## Release checklist

- [ ] Release scope and identifier are approved.
- [ ] Included commits or change sets match the reviewed scope.
- [ ] Required tests, security checks, and user acceptance are complete.
- [ ] Configuration and environment requirements are documented without secret values.
- [ ] Database migration and restore evidence is approved, if applicable.
- [ ] Deployment order, compatibility window, and external dependencies are understood.
- [ ] Monitoring, health, error, scheduler, notification, and audit evidence is ready where applicable.
- [ ] Rollback trigger, owner, procedure, and last-known-good version are confirmed.
- [ ] Product Owner approved the release and any deployment, migration, or external-service action separately.

## Rollback checklist

- [ ] Rollback trigger and decision owner are known.
- [ ] Last-known-good application, documentation, configuration, or data state is identifiable.
- [ ] Backups and restore procedures were verified where data is affected.
- [ ] Rollback preserves PM Assistant workflow authority and audit evidence.
- [ ] AutoPM cache or legacy reads will not be reverse-synchronized.
- [ ] Revoked secrets will not be restored.
- [ ] Compatibility of provider, consumer, schema, and configuration rollback is understood.
- [ ] Post-rollback validation and reconciliation are defined.
- [ ] Users and operators will receive appropriate status communication.

## Definition of Done

A FleetOS change is done only when:

- [ ] The approved outcome is fully implemented within the approved scope.
- [ ] Architecture, ownership, identity, status, API, security, and repository boundaries are preserved.
- [ ] Relevant tests and checks pass, or Product Owner-approved exceptions are documented.
- [ ] Documentation and ADR requirements are satisfied.
- [ ] No secrets or unapproved sensitive data are present.
- [ ] The exact changed-file list and concise diff summary were reviewed.
- [ ] Validation evidence, limitations, unresolved risks, and remaining work are recorded.
- [ ] Rollback is credible and tested where required.
- [ ] Required human and Product Owner approvals are complete for the current lifecycle stage.
- [ ] No AI tool performed a prohibited Git or GitHub action.
- [ ] Merge, release, deployment, migration, and external-service status are reported accurately.

