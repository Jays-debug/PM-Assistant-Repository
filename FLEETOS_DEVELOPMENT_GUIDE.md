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