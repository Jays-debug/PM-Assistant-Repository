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
