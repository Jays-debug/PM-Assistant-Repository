# FleetOS AI Collaboration Standard

Version 1.0

## Scope

This standard governs ChatGPT, Codex, future AI development tools, and humans directing or reviewing their work. AI tools assist with analysis, implementation, validation, and review; they do not replace Product Owner authority or accountable human judgment.

## Core rules for AI tools

An AI tool must:

1. Read applicable repository governance and task-specific instructions before acting.
2. Inspect relevant evidence and distinguish facts, inferences, proposals, and unknowns.
3. Explain the proposed change, architecture impact, risks, rollback, and exact file plan.
4. Wait for explicit Product Owner approval before modifying project files.
5. Modify only approved local files and preserve unrelated human work.
6. Validate the result proportionally and report limitations honestly.
7. Show the exact changed-file list and concise diff summary.
8. Stop at Git, merge, release, deployment, migration, credential, or external-service approval gates.
9. Protect secrets, sensitive data, and operational details.
10. Escalate conflicts instead of inventing authority or silently choosing a contract.

## Local-file responsibility

Codex may work directly in the approved local repository and may:

- inspect files and repository structure;
- create, edit, or remove only explicitly approved local paths;
- run safe local validation relevant to the task;
- prepare documentation, test evidence, review notes, and proposed Git metadata.

Codex and other AI tools must not:

- create or switch branches;
- commit;
- push or pull;
- open Pull Requests;
- merge;
- deploy;
- rewrite Git history.

They also must not migrate data, alter environment variables, rotate credentials, or change external services without separate explicit authority; such authority does not remove the Git prohibitions above.

Human contributors may perform the Git actions permitted by [Git and branch standard](GIT_AND_BRANCH_STANDARD.md). Product Owner approval remains required for scope, merge, release, deployment, migration, and external-service changes.

## Evidence and claims

- Read source code to understand current behavior, but do not promote current routes, schemas, tables, or frontend calculations into an approved cross-module contract.
- Cite or link the authoritative document when stating architecture, ownership, identity, API, or error rules.
- Preserve each document's status. `Proposed` is not `Accepted`, and planned is not operational.
- Do not claim PostgreSQL, Railway, production authentication, Docker, CI/CD, or a production FleetOS API is operational without direct repository evidence.
- State uncertainty and validation limitations explicitly.
- Never manufacture test results, approvals, logs, users, deployment state, or external-system outcomes.

## Scope and change control

- Treat the approved file list as a hard boundary.
- Do not perform opportunistic cleanup outside the approved outcome.
- Do not rename FleetOS, AutoPM, PM Assistant, technical paths, tables, URLs, projects, or screens without explicit approval.
- If a necessary change falls outside scope, stop and request expanded approval.
- If new user direction replaces earlier direction, reconcile the instructions before continuing.
- Preserve unrelated and uncommitted human changes.

## Architecture and data behavior

AI-generated proposals and code must preserve:

- FleetOS as the parent platform;
- separate AutoPM and PM Assistant bounded modules;
- PM Assistant authority for maintenance workflow information;
- AutoPM's read-only maintenance role;
- the prohibition on direct shared-database access;
- transitional `vehicle_no` and proposed-only `fleetos_vehicle_id` semantics;
- distinct `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` meanings;
- approved API, error, identity, audit, rollback, and compatibility rules.

## Secret and privacy safety

- Do not request secret values when names, placeholders, or redacted evidence are sufficient.
- Do not display `.env` values or copy them into source, documentation, tests, prompts, or reports.
- Redact tokens, credentials, connection strings, notification targets, raw webhook data, and personal data from tool output.
- Use safe synthetic examples.
- Secret scans must report locations or classifications safely and avoid echoing the suspected value.
- Treat browser storage, logs, exports, CSV files, and screenshots as possible sensitive-data sources.

## AI-generated code and documentation review

Human review must verify:

- the tool followed current instructions and approval scope;
- claims match repository evidence;
- module and ownership boundaries are preserved;
- code is understandable and maintainable without the originating prompt;
- tests cover meaningful behavior and failure cases;
- examples contain no secrets or misleading operational claims;
- links, schemas, commands, and rollback procedures are correct;
- generated text does not conceal unresolved decisions behind confident wording.

AI output is not self-approving. A second AI review may assist but does not replace accountable human approval.

## Escalation conditions

Stop and ask the Product Owner when:

- governing documents conflict;
- a referenced authoritative file is unavailable;
- ADR or contract status is unclear;
- implementation requires an unapproved file or external action;
- data ownership, identity, status meaning, authentication, or migration behavior is unresolved;
- a suspected secret or sensitive-data exposure is found;
- validation cannot establish safety for a material change;
- rollback is not credible;
- user instructions would cause destructive, irreversible, or materially broader action.

Existing ADR and API inconsistencies are escalation conditions only. An AI tool must not correct those files unless a later task explicitly approves them.

## Handoff standard

At completion, report the outcome first, followed by changed files, validation, unresolved risks, rollback, and the next required human action. Never imply that a commit, Pull Request, merge, release, or deployment occurred when it did not.

