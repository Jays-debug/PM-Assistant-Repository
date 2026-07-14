# FleetOS v1.0 User Roles and Personas

## Purpose

This document defines evidence-supported FleetOS users, their goals, responsibilities, product boundaries, and unresolved authorization decisions. Personas describe product needs; they do not claim that authentication, authorization, enterprise identities, or role enforcement are operational.

## Role principles

1. AutoPM users do not gain maintenance workflow write authority.
2. PM Assistant remains the authoritative maintenance workflow boundary.
3. Display names, free-text responsibility labels, and the current local username are not enterprise identities.
4. Product roles and runtime service identities are different concepts.
5. Least privilege and separation of duties are target requirements, but the exact permission matrix requires Product Owner approval.
6. No persona authorizes direct shared-database access.

## Role summary

| Role | Primary module | Primary responsibility | Authority boundary | Evidence status |
| --- | --- | --- | --- | --- |
| Fleet and executive user | AutoPM | Understand fleet PM condition, priorities, trends, calendars, and freshness. | Read-only for maintenance workflow information. | Fleet/executive actor and dashboard behavior are evidenced. |
| Maintenance planner/operator | PM Assistant | Plan, prioritize, follow, complete, and review maintenance work. | Operates authoritative workflows through approved PM Assistant boundaries. | Maintenance actor and workflow behavior are evidenced. |
| Maintenance system administrator/operator | PM Assistant | Manage controlled configuration, masters, imports, scheduling, notifications, and diagnostics. | Elevated operational capability subject to an approved permission matrix. | Current settings and diagnostic functions are evidenced; enforced role separation is not. |
| Product Owner | FleetOS governance | Approve product scope, decisions, acceptance, release, and external actions. | Governance authority; not a substitute for an application user identity. | Established by repository governance. |

## Persona 1 — Fleet and executive user

### Context

This user needs a rapid, trustworthy view of fleet preventive-maintenance exposure. Repository evidence shows AutoPM dashboard, summary, tracking, calendar, filter, drill-down, export, and synchronization-state capabilities.

### Goals

- Understand the overall fleet condition quickly.
- Identify overdue, call-in, prepare, and other approved mileage-condition groups.
- Identify vehicles requiring attention and the responsible grouping.
- Review PM distribution by time, business grouping, fleet, model, and vehicle type.
- Distinguish live, cached, stale, and unavailable data.
- Export or copy presentation-safe information for operational follow-up.

### Responsibilities

- Interpret dashboard values in their stated status domain.
- Observe source and freshness before acting on a report.
- Use filters and drill-down to investigate, not to change authoritative maintenance state.
- Escalate discrepancies rather than editing or reverse-synchronizing presentation data.

### Product permissions direction

- Read approved vehicle, plan, history, location, summary, mileage, notification, and synchronization projections according to authorization.
- Filter, sort, navigate, export, and use temporary presentation cache.
- No create, update, complete, cancel, import, schedule, notification-send, or persistence access through AutoPM in v1.

### Pain points addressed

- Different status meanings presented as one generic status
- Data that appears current when it is cached or stale
- Unclear vehicle identity or grouping
- Inability to distinguish a true empty result from unavailable authoritative data

### Acceptance outcomes

- The user can identify the data source and freshness.
- The user can distinguish all four status domains where displayed.
- The user cannot change maintenance workflow data through AutoPM.
- Unknown or unavailable values are visible and not guessed.

## Persona 2 — Maintenance planner/operator

### Context

This user manages preventive-maintenance work through PM Assistant. Current evidence includes My Today, priority queues, plan management, calendars, completion, pause/resume, follow-up, weekly control, history, imports, and reports.

### Goals

- Know which maintenance work needs attention today.
- Create and maintain valid PM plans.
- Track weekly vehicle groups and follow-up work.
- Record completion once work is actually completed.
- Correct or reopen work under an approved policy.
- Review maintenance history and discrepancies.
- Initiate approved reports or notifications when authorized.

### Responsibilities

- Select the correct vehicle and location.
- Resolve or escalate ambiguous identity rather than guessing.
- Maintain accurate plan dates and workflow state.
- Record explicit completion and required evidence.
- Preserve history and explain corrections.
- Review import exceptions and partial outcomes.

### Product permissions direction

- Create and change PM plans through approved PM Assistant interfaces.
- Perform approved workflow, completion, correction, and follow-up actions.
- Read maintenance history and operational summaries within authorized scope.
- Use controlled import workflows if assigned.
- No direct database writes, unrestricted diagnostic access, or security-configuration authority.

### Pain points addressed

- Scattered priority information
- Duplicate or mismatched vehicle records
- Completion inferred from indirect signals
- Imports that obscure rejected or partial outcomes
- History that cannot explain how a state was reached

### Acceptance outcomes

- The user can complete critical planning and completion workflows without AutoPM.
- Important state changes create traceable evidence.
- Invalid, ambiguous, and conflicting inputs produce actionable, safe feedback.
- Completion is never inferred from mileage, time, sheet status, or notification outcome.

## Persona 3 — Maintenance system administrator/operator

### Context

Current PM Assistant behavior includes location management, vehicle synchronization, imports, scheduler settings, LINE targets, reports, webhook functions, health information, logs, simulation, and diagnostics. These functions support a candidate administrative or operational role, but repository evidence does not establish enforced production permissions.

### Goals

- Maintain controlled master and configuration data.
- Monitor imports, schedules, notification delivery, and system readiness.
- Diagnose failures without exposing secrets or sensitive data.
- Recover safely from dependency, import, scheduler, or notification failures.
- Supply validation and release evidence to the Product Owner.

### Responsibilities

- Use approved non-production and production boundaries correctly.
- Keep secrets outside source, browser assets, logs, exports, and documentation.
- Confirm recipient and scheduler settings before enablement.
- Review ambiguity, failure, replay, and duplicate-prevention evidence.
- Follow approved backup, restore, incident, and rollback procedures.

### Product permissions direction

- Manage approved location, import, scheduler, notification, and diagnostic capabilities according to least privilege.
- Access safe operational status and audit evidence.
- No automatic authority to approve release, migration, credential changes, or external-service changes.
- No access to raw secret values through the product UI or logs.

### Pain points addressed

- Scheduler duplication or silent failure
- Notification attempts without clear terminal outcome
- Diagnostics that reveal sensitive provider information
- Imports without replay or reconciliation evidence
- Configuration differences between environments

### Acceptance outcomes

- The user can detect and diagnose supported failures using redacted evidence.
- Privileged actions are authorized, auditable, and separated from ordinary planning where approved.
- Unsafe schedules, imports, or notifications can be stopped without deleting evidence.

## Persona 4 — Product Owner

### Context

Repository governance establishes the Product Owner as decision owner for scope, product contracts, release, deployment, migration, and external-system actions.

### Goals

- Maintain an evidence-based product boundary.
- Approve or reject unresolved product decisions.
- Review acceptance, risk, rollback, and release evidence.
- Prevent unsupported operational claims and unapproved scope expansion.

### Responsibilities

- Approve product scope and file-level implementation scope separately.
- Resolve or explicitly defer blocking decisions.
- Approve release and each deployment, migration, credential, or external-service action separately.
- Own stop/go and rollback decisions or delegate them through an approved operating model.

### Product permissions direction

Product governance authority does not automatically define a runtime superuser account. The Product Owner's application access and any break-glass behavior require a separate security decision.

## Responsibility boundaries

| Activity | Fleet/executive user | Maintenance planner/operator | System administrator/operator | Product Owner |
| --- | --- | --- | --- | --- |
| View dashboards and reports | Primary | As authorized | As authorized | Review evidence |
| Create or change PM plans | No through AutoPM | Proposed primary role | Only if assigned | Approves policy |
| Record completion | No through AutoPM | Proposed primary role | Only if assigned | Approves policy |
| Manage imports | View safe status | If assigned | Proposed operational role | Approves policy and thresholds |
| Configure scheduler/notifications | No | No unless assigned | Proposed operational role | Approves policy and external action |
| Access diagnostics | No by default | No by default | Redacted, least-privilege access | Reviews evidence as needed |
| Approve release/deployment/migration | No | No | No unless separately delegated | Yes |

This matrix is product direction, not an implemented authorization matrix.

## User and responsibility data

- Current PM Assistant usernames and roles are local records, not enterprise identities.
- Current AutoPM responsibility fields are free-text presentation labels.
- Display-name equality must not automatically link a person to a user account.
- Responsibility assignments should become explicit, reviewed, and effective-dated after the identity model is approved.
- User lifecycle, role changes, and assignment changes require audit evidence.

## Unresolved Product Owner decisions

- Identity provider and authentication mechanism
- Human, service, administrator, and support identity separation
- Canonical role vocabulary and permission matrix
- Whether planner and operator are one role or separate roles
- Whether import, completion correction, notification send, and scheduler management require separate privileges
- Person versus team responsibility assignment
- Role approval, provisioning, review, revocation, and emergency-access processes
- Row-level or field-level authorization
- Actor visibility in maintenance history
- Access to diagnostics, import errors, notification metadata, and audit records
- Retention and privacy policy for user and responsibility data

These decisions must be approved before production authorization behavior is treated as complete.

