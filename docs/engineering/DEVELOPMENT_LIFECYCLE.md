# FleetOS Development Lifecycle

Version 1.0

## Mandatory lifecycle

Every task that may modify repository files follows this sequence:

1. **Analyze** — inspect governing instructions, relevant documentation, current implementation evidence, repository state, and affected dependencies.
2. **Explain** — state the proposed outcome, why it is needed, assumptions, and what will not change.
3. **Architecture impact** — identify affected modules, ownership boundaries, contracts, persistence, deployment units, integrations, and current-versus-target-state implications.
4. **Risk and rollback analysis** — identify technical, data, security, operational, compatibility, and delivery risks; define a credible rollback.
5. **File-level plan** — list every file to create, modify, rename, move, or delete and the responsibility of each change.
6. **Approval** — stop and obtain explicit Product Owner approval for scope before modifying project files.
7. **Modify** — change only approved files and preserve unrelated work.
8. **Validate** — run checks proportional to the change and record results and limitations.
9. **Review** — show the exact changed-file list, summarize the diff, identify residual risks, and stop at any required approval gate.

Git, release, deployment, migration, and external-service actions occur only under the responsibilities and approvals defined in [Git and branch standard](GIT_AND_BRANCH_STANDARD.md).

## Analysis requirements

Analysis must establish:

- applicable `AGENTS.md` instructions and task-specific Product Owner direction;
- whether AutoPM, PM Assistant, shared documentation, or more than one boundary is affected;
- current behavior based on direct evidence;
- applicable architecture, data, identity, API, error, security, and ADR constraints;
- existing user changes that must be preserved;
- operational claims that are proven, proposed, unresolved, or out of scope;
- validation capabilities that exist in the repository.

Implementation evidence may explain current behavior. It does not become an approved cross-module contract merely because it exists.

## Approval rules

Approval must be explicit and must identify or clearly accept:

- the intended outcome;
- files and directories in scope;
- architecture and data effects;
- external systems, if any;
- validation expectations;
- whether Git, release, migration, deployment, or other irreversible actions are authorized.

Approval for analysis is not approval to modify files. Approval for local edits is not approval to commit, merge, release, deploy, migrate data, rotate credentials, or change an external service.

If new information requires an unapproved file or materially changes the design, stop, explain the change, and request expanded approval.

## Architecture impact review

For every change, state whether it affects:

- AutoPM or PM Assistant module boundaries;
- authoritative data ownership;
- cross-module reads or writes;
- API schemas, versions, errors, or compatibility;
- identity matching or status semantics;
- database schema, data, imports, or migration;
- scheduler, notification, webhook, authentication, or authorization behavior;
- hosting, networking, environment variables, or deployment topology;
- logging, audit, monitoring, privacy, or retention.

“No impact” must be supported by the bounded scope, not assumed.

## Risk and rollback requirements

Risk analysis must cover applicable failure modes, affected users or data, detection, mitigation, rollback trigger, rollback owner, and retained evidence.

A rollback plan must:

- identify the last-known-good state;
- avoid transferring maintenance data authority away from PM Assistant;
- avoid reverse-synchronizing AutoPM cache or legacy display data;
- preserve raw source and audit evidence;
- define database backup and restore requirements before a future migration;
- account for forward-only security actions such as secret revocation;
- be tested when the risk justifies it, or record why testing is not possible.

Documentation-only changes may be rolled back by reverting only the isolated documentation change set.

## Modification discipline

During implementation:

- change only approved paths;
- preserve module names, paths, tables, URLs, and screens unless explicitly approved;
- do not expose `.env` values, tokens, credentials, or sensitive records;
- do not clean up unrelated code opportunistically;
- do not overwrite unrelated user changes;
- keep current-state and target-state statements distinct;
- pause if an authoritative document conflicts with the proposed implementation.

## Documentation and ADR requirements

Update documentation when a change affects user-visible behavior, setup, configuration contracts, public or cross-module interfaces, data semantics, operations, or rollback procedures.

Create or supersede an ADR when a decision materially changes:

- module boundaries or ownership;
- shared identity or status meaning;
- integration style or API versioning;
- persistence or migration strategy;
- deployment topology;
- security or authentication architecture;
- a previously accepted architecture decision.

Do not change the status of an ADR without Product Owner approval.

## Review handoff

The review report must include:

- outcome achieved;
- exact changed-file list;
- concise diff summary;
- validation commands or checks and results;
- tests not run and why;
- secret-safety result;
- architecture and compatibility result;
- residual risks and unresolved decisions;
- rollback approach;
- confirmation that no unapproved Git or external action occurred.

Use the [review and release checklists](REVIEW_RELEASE_CHECKLISTS.md) to determine completion.

