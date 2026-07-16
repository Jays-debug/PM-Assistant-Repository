# FleetOS Logging and Audit Observability

## Purpose

This document defines proposed structured logging, correlation, audit operations, security-event relationships, redaction, access, correction, and incident reconstruction. It does not select a log, audit, trace, storage, search, or retention product.

## Requirement registry

| ID | Requirement |
| --- | --- |
| `LOG-001` | Operational logs use stable structured fields where supported and avoid dependence on free-form message text. |
| `LOG-002` | Log records identify explicit-timezone timestamp, severity, environment, FleetOS module, component, event, result, duration, safe version, and validated correlation where applicable. |
| `LOG-003` | Credentials, authorization material, cookies, connection strings, raw payloads, notification targets, personal data, sensitive rows, paths, and internal topology are excluded or redacted. |
| `LOG-004` | Exceptions are recorded once at the layer with actionable safe context while preserving the internal cause without repeated exposure. |
| `LOG-005` | Operational logs, domain audit, security events, business history, and provider-attempt evidence remain distinct by purpose, access, integrity, correction, and retention. |
| `LOG-006` | Audit access, export, correction, and administrative action are protected and themselves auditable. |
| `LOG-007` | Correlation is validated and propagated but never treated as authentication, authorization, causation, ordering, or idempotency. |
| `LOG-008` | Audit evidence preserves actor/process, protected action, safe resource, result, time, environment, reason classification, and applicable versions. |
| `LOG-009` | Corrections preserve original and superseding evidence rather than silently rewriting history where governing policy permits. |
| `LOG-010` | Logging or audit failure is observable and cannot silently permit a required protected action to appear fully evidenced. |
| `LOG-011` | Access and retention follow approved data classification, privacy, deletion, legal-hold, and incident requirements. |
| `LOG-012` | No centralized logging or operational audit capability is claimed before implementation, access, redaction, retention, correction, and recovery validation. |

## Evidence separation

| Evidence class | Primary question | Example direction |
| --- | --- | --- |
| Operational log | What happened inside a runtime or dependency? | Request failed with a safe classification and correlation. |
| Metric | How often, how long, or how much? | Count or distribution of classified outcomes. |
| Trace/correlation | Which operations may be related? | Request to read service to persistence diagnostic. |
| Domain audit | Who or what performed a business-significant action? | Plan changed or completion corrected. |
| Security event | What protected access or threat-relevant action occurred? | Authorization denial or credential revocation. |
| Business history | What domain sequence should an authorized user understand? | Ordered PM plan and completion history. |
| Provider attempt | What happened to an external delivery attempt? | Notification attempt classified without exposing recipient or body. |

These records may share safe references but do not replace one another.

## Structured log direction

Proposed common fields, used only when relevant:

- `observed_at` with explicit timezone;
- `severity`;
- `environment`;
- `fleetos_module`;
- `component`;
- `event_name`;
- `result`;
- `duration`;
- safe application, contract, rule, mapping, or configuration version;
- safe operation or resource reference;
- validated correlation and approved causation reference;
- safe error classification;
- readiness, degraded, job, import, notification, rollout, or recovery disposition.

Field names and physical schema remain `ODEC-001` and `ODEC-007`. Logs must not serialize ORM objects, unrestricted exceptions, full request/response bodies, configuration dumps, environment values, or raw database/provider output.

## Event naming and severity direction

- Event names should be stable, specific, and outcome-aware.
- Severity reflects operational significance, not business priority or PM status.
- Business statuses remain the four exact domain concepts and are not inferred from log severity.
- Severity vocabulary, mapping, and alert relationship remain unresolved.
- Debug output follows the same secret, privacy, access, and retention restrictions as all other evidence.

## Correlation and causation

Correlation connects diagnostics across approved boundaries. Causation links a downstream operation to its initiating action when the relationship is known. Separate references remain required for:

- business commands and expected versions;
- import batches and row outcomes;
- job definitions, occurrences, and attempts;
- notification intents and provider attempts;
- deployment/change identifiers;
- incidents and recovery actions;
- audit corrections and superseding evidence.

Timestamp proximity, process identity, filename, or correlation alone is insufficient proof of causation or duplicate safety.

## Audit operations

Audit operations include:

1. creating required domain or security evidence;
2. protecting evidence from unauthorized access, alteration, or deletion;
3. authorizing purpose-limited search and review;
4. recording audit access and export;
5. preserving safe evidence for incident and recovery review;
6. applying approved correction, supersession, retention, and deletion behavior;
7. validating that business and security actions remain reconstructable.

Audit is not a substitute for PM history, import row outcomes, job execution records, notification attempts, or incident records.

## Minimum audit evidence

Where applicable:

- safe actor or process reference;
- approved authority or policy reference;
- protected action and safe resource reference;
- environment;
- effective/event time and recorded time;
- success, failure, denial, partial, skipped, or uncertain result;
- safe before/after or version evidence;
- correlation, causation, batch, occurrence, attempt, deployment, or incident references;
- approver/reviewer reference for privileged action;
- correction or supersession relationship.

Actor display names, free-text responsibility labels, and current local usernames are not promoted to enterprise identities.

## Redaction and minimization

Default exclusion applies to:

- secrets, tokens, passwords, keys, sessions, cookies, authorization headers, and recovery material;
- database credentials, connection strings, hosts, schemas, local paths, and topology;
- raw webhook payloads, provider responses, recipient identifiers, and message bodies;
- raw import rows, uploaded contents, unrestricted filenames, and sensitive row errors;
- unnecessary personal information, addresses, notes, responsibility text, and actor names;
- SQL, stack traces at public boundaries, ORM dumps, and unrestricted before/after snapshots.

Masking does not automatically make a value safe. Collection must have an approved purpose.

## Access, retention, and integrity

Operational log, audit, security-event, incident, and recovery evidence may require different:

- readers and exporters;
- write and correction paths;
- integrity protection;
- retention start events and periods;
- deletion, archival, legal-hold, and backup interaction;
- privacy and access-review rules.

All remain unresolved under `ODEC-006`. Evidence access must follow least privilege, and bulk export requires explicit purpose and approval.

## Failure and recovery

If logging or audit evidence is unavailable:

- distinguish optional diagnostic loss from failure of required business/security evidence;
- prevent or contain protected actions when their required evidence cannot be safely recorded under the approved policy;
- avoid logging sensitive fallback data merely to compensate;
- preserve local safe evidence where approved;
- restore the evidence path, assess gaps, and reconcile affected actions;
- open or update an incident when integrity, security, or business traceability may be affected.

## Incident reconstruction

Reconstruction should connect, without exposing secrets:

- application and configuration versions;
- health and readiness transitions;
- requests and dependency outcomes;
- imports, jobs, notification attempts, and persistence results;
- protected access and security events;
- deployment, maintenance, rollback, backup, restore, and recovery actions;
- authoritative business history and audit;
- decisions, owners, residual risk, and missing evidence.

## Validation direction

Later implementation should test schema consistency, redaction, duplicate exception handling, correlation validation, access control, audit access logging, correction lineage, evidence-loss behavior, retention/deletion interaction, backup/restore of required evidence, and reconstruction using synthetic or approved sanitized data.
