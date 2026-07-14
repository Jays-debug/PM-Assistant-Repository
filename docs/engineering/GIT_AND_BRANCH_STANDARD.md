# FleetOS Git and Branch Standard

Version 1.0

## Responsibility model

### Product Owner

Product Owner approval is required for:

- task scope;
- merge;
- release;
- deployment;
- database or data migration;
- external-service changes.

The Product Owner may perform Git and GitHub work directly or authorize a human contributor to perform an allowed action. GitHub Desktop is the Product Owner's preferred local interface and review source for FleetOS Git operations.

### Human contributors

Human contributors may:

- create and switch branches;
- commit approved changes;
- push branches;
- open Pull Requests.

They must follow [CONTRIBUTING.md](../../CONTRIBUTING.md), this standard, repository governance, code ownership, and the approved task scope. Human permission to open a Pull Request does not include permission to merge, release, deploy, migrate data, or change external services.

### Codex and other AI tools

Codex and other AI tools may inspect repository state, modify explicitly approved local files, run approved local validation, and propose branch names, commit messages, and Pull Request text.

They must not:

- create or switch branches;
- commit;
- push or pull;
- open Pull Requests;
- merge;
- deploy;
- rewrite Git history.

An AI tool must stop before these actions even when local file work is complete.

## Branch naming

Use lowercase ASCII letters and numbers, with short hyphen-separated descriptions. Avoid spaces, underscores, personal names, and issue text containing sensitive information.

| Work type | Pattern | Example |
| --- | --- | --- |
| Phase work | `phase-X-Y-description` | `phase-3-4-api-gateway` |
| Non-phase documentation | `docs/description` | `docs/engineering-standard` |
| Feature | `feature/description` | `feature/pm-calendar` |
| Bug fix | `bugfix/description` | `bugfix/vehicle-filter` |
| Urgent production fix | `hotfix/description` | `hotfix/api-timeout` |

`X` and `Y` identify the approved phase and subphase. A branch must represent one coherent approved scope.

## Commit-message convention

Commit messages use a concise imperative subject that explains the outcome:

```text
Add FleetOS engineering standard
Fix vehicle filter behavior
Improve dashboard accessibility
Refactor notification scheduling
```

Rules:

- Begin with an action verb such as `Add`, `Fix`, `Improve`, `Update`, `Document`, `Refactor`, `Remove`, or `Revert`.
- Keep the subject specific and normally no longer than 72 characters.
- Do not end the subject with a period.
- Use a body when the reason, architecture impact, migration, validation, or rollback is not obvious.
- Reference an issue, phase, or ADR when relevant.
- Never place secrets, credentials, personal data, or sensitive operational details in a commit message.
- Keep unrelated changes in separate commits.

Commit creation is a human action.

## Pull Request convention

Every phase requires a Pull Request. Other repository changes intended for integration should also use a Pull Request unless the Product Owner explicitly approves a different workflow.

A Pull Request must include:

- purpose and approved scope;
- exact functional or documentation outcome;
- architecture and data impact;
- changed-file summary;
- validation evidence and checks not run;
- security and secret-safety result;
- migration and rollback details when applicable;
- screenshots or rendered evidence for user-interface changes;
- linked issue, phase, ADR, or contract where relevant;
- unresolved risks and follow-up work.

The title should follow the commit subject style. Draft status is appropriate while required validation or review remains incomplete.

## Review rules

- The author performs a self-review before requesting review.
- Reviewers verify scope, behavior, boundaries, tests, security, documentation, and rollback.
- Changes affecting owned paths require review consistent with [CODEOWNERS](../../.github/CODEOWNERS).
- Review comments must be resolved through code changes, explanation, or an explicitly accepted exception.
- Material scope expansion requires renewed Product Owner approval.
- API, identity, data-ownership, migration, and security changes require review against their authoritative contracts.
- A passing check does not override an unresolved architecture or approval concern.

## Merge and release rules

- Only the Product Owner approves merge.
- Required review and validation evidence must be complete before merge approval.
- The merge method and branch deletion are Product Owner decisions.
- Releases require a defined version or release identifier, change summary, validation evidence, rollback plan, and Product Owner approval.
- Deployment, migration, and external-service changes require separate explicit approval even after merge.
- Never rewrite shared history to hide review or validation evidence.

## Prohibited repository practices

- Committing `.env` files, credentials, tokens, generated logs, local databases, or unapproved sensitive exports.
- Mixing unrelated cleanup into an approved change.
- Bypassing review by pushing directly to a protected or release branch.
- Treating branch creation or a Pull Request as approval to deploy.
- Deleting or rewriting another contributor's work without explicit coordination.

