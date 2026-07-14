# FleetOS Engineering Standard

Version 1.0  
Status: Product Owner review

## Purpose

The FleetOS Engineering Standard defines practical, repeatable rules for engineering work performed by the Product Owner, human contributors, ChatGPT, Codex, future AI development tools, and future project contributors.

FleetOS is the parent platform. **AutoPM** and **PM Assistant** retain their existing names and remain separate bounded modules.

This standard consolidates working practices. It does not replace architecture decisions, data and identity contracts, API contracts, repository governance, or contribution rules.

## Authority and precedence

Apply requirements in this order:

1. Explicit Product Owner direction for the current task.
2. Repository-wide governance in [AGENTS.md](../../AGENTS.md).
3. Approved architecture decisions and specialized contracts relevant to the change.
4. This Engineering Standard.
5. Supporting workflow guidance in [FLEETOS_DEVELOPMENT_GUIDE.md](../../FLEETOS_DEVELOPMENT_GUIDE.md) and [CONTRIBUTING.md](../../CONTRIBUTING.md).
6. Existing implementation patterns, when they do not conflict with a higher authority.

The status written in each source remains controlling. A document or ADR marked `Proposed` describes direction for review; it is not evidence of an operational capability. If authoritative sources conflict or required context is unavailable, stop and escalate to the Product Owner. Do not resolve the conflict through implementation guesswork.

## Authoritative references

- [FleetOS architecture](../FLEETOS_ARCHITECTURE.md)
- [Data ownership](../DATA_OWNERSHIP.md)
- [Identity contract](../IDENTITY_CONTRACT.md)
- [API contract](../API_CONTRACT.md)
- [API error model](../API_ERROR_MODEL.md)
- [Architecture decision records](../adr/)
- [Contribution guide](../../CONTRIBUTING.md)
- [Code ownership](../../.github/CODEOWNERS)

## Engineering principles

1. Preserve AutoPM and PM Assistant as separate bounded modules.
2. Keep changes small, explicit, reviewable, testable, and reversible.
3. Establish evidence before making claims or changing behavior.
4. Separate current state, transitional state, and proposed target state.
5. Obtain Product Owner scope approval before modifying project files.
6. Modify only approved files and preserve unrelated work.
7. Treat PM Assistant as authoritative for maintenance workflow data.
8. Keep AutoPM read-only for maintenance workflow information.
9. Prohibit direct shared-database access between modules.
10. Use approved contracts at module boundaries; source code alone is not a cross-module contract.
11. Preserve the distinct meanings of mileage, workflow, completion, and notification status.
12. Never expose secrets or claim unverified infrastructure is operational.
13. Validate in proportion to risk and retain evidence for review.
14. Define rollback before any change that can affect behavior, data, users, or external systems.
15. Record significant architecture decisions through an ADR.

## Standard map

| Document | Primary subject |
| --- | --- |
| [Development lifecycle](DEVELOPMENT_LIFECYCLE.md) | Approval-based workflow, responsibilities, architecture review, rollback, and documentation |
| [Git and branch standard](GIT_AND_BRANCH_STANDARD.md) | Human and AI Git boundaries, branches, commits, Pull Requests, review, and merge |
| [Coding standard](CODING_STANDARD.md) | Repository boundaries and Python, FastAPI, HTML, CSS, and JavaScript practices |
| [API and data standard](API_AND_DATA_STANDARD.md) | API design, error envelopes, ownership, identity, status domains, persistence, and migration |
| [Testing and quality standard](TESTING_AND_QUALITY_STANDARD.md) | Testing levels, validation evidence, quality gates, and exceptions |
| [Security and observability standard](SECURITY_AND_OBSERVABILITY_STANDARD.md) | Secrets, configuration, security controls, logging, correlation, health, and audit |
| [AI collaboration standard](AI_COLLABORATION_STANDARD.md) | Rules for ChatGPT, Codex, future AI tools, and human oversight |
| [Review and release checklists](REVIEW_RELEASE_CHECKLISTS.md) | Operational checklists, rollback checks, release approval, and Definition of Done |

## Current capability guardrail

Repository evidence currently shows a static HTML/CSS/JavaScript-oriented AutoPM module and a Python/FastAPI/SQLAlchemy PM Assistant module using SQLite. PostgreSQL, Railway deployment, production authentication, Docker, CI/CD, and a production FleetOS API must not be described as operational unless later repository evidence proves that state.

## Repository technical debt

At version 1.0, `PROJECT_CONTEXT.md`, `ROADMAP.md`, and `CHANGELOG.md` are empty directory placeholders. They contain no policy for this standard. They must not be modified, renamed, deleted, or treated as Markdown files without a separately approved task.

Known inconsistencies among existing ADR and API documents are escalation conditions. This standard does not silently correct or reinterpret them.

## Maintenance of this standard

- Changes to this standard follow the same approval lifecycle as other project changes.
- A rule that changes module ownership, identity, API compatibility, deployment boundaries, or data authority requires review against the relevant contract and may require an ADR.
- Links and status statements must be revalidated whenever this standard changes.
- The version and change summary must be updated when normative behavior changes.

