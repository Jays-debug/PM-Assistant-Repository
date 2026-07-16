# FleetOS Recommended Phase 5 Implementation Roadmap

## Purpose and status

This document recommends an implementation sequence after the Phase 4.9 enterprise review.

It is derived from:

- the existing FleetOS v1.0 Implementation Roadmap;
- product and release criteria;
- domain, database, API, application, frontend, backend, infrastructure, security, and operations validation documents;
- the unresolved decisions and readiness findings recorded in this review.

It does not:

- create a new architecture;
- authorize implementation;
- approve unresolved decisions;
- select a vendor, framework, datastore, identity provider, security mechanism, or deployment topology;
- authorize source, database, configuration, credential, infrastructure, deployment, migration, or external-service changes.

Each workstream requires separate analysis, architecture impact, risk analysis, exact file plan, Product Owner approval, validation, summary, and rollback evidence.

## Phase 5 objective

Implement only approved FleetOS v1.0 capabilities in a controlled sequence while:

- preserving AutoPM and PM Assistant boundaries;
- preserving PM Assistant maintenance authority;
- keeping AutoPM read-only;
- prohibiting direct shared-database access;
- retaining transitional identity safeguards;
- keeping the four status domains separate;
- maintaining independent deployment and rollback;
- preventing Proposed or unresolved direction from becoming an accidental implementation decision.

## Recommended sequence

```text
Decision and contract entry gate
        ↓
Identity, ownership, and traceability readiness
        ↓
Runtime, security, persistence, and operational foundation
        ↓
PM Assistant backend read models and approved API boundary
        ↓
Controlled imports, scheduler, notifications, and audit
        ↓
AutoPM read-only shadow integration
        ↓
Enterprise validation and production-readiness evidence
        ↓
Separately approved rollout and stabilization
```

Parallel work is appropriate only when dependencies, ownership, validation, and rollback boundaries remain independent.

## Workstream 1 — Decision and contract entry gate

### Objective

Establish the accepted documentation baseline for the first implementation scope.

### Required decisions and evidence

- accept, revise, or supersede the applicable ADRs;
- correct ADR-0003 through a separately approved documentation task before using it as implementation authority;
- approve or revise the controlling API Contract and API Error Model if the first scope includes the API;
- identify the exact source-qualified decisions that block the selected scope;
- explicitly record approved deferrals;
- map selected product requirements to acceptance and validation evidence;
- identify exact implementation and documentation files;
- define rollback and stop conditions.

### Entry criteria

- Phase 4.9 review accepted for planning use;
- no source modification authorized merely by this roadmap.

### Exit evidence

- accepted controlling decisions;
- exact approved scope;
- decision disposition list;
- requirement/acceptance/validation map;
- architecture impact and rollback plan.

### Stop conditions

- required ADR or contract remains Proposed without explicit scope approval;
- a blocking decision lacks an approved disposition;
- file scope is not exact;
- implementation would change ownership or module boundaries.

### Rollback

Documentation decisions are reverted or superseded through an approved documentation change. No implementation continues under a withdrawn decision.

## Workstream 2 — Identity, ownership, and traceability readiness

### Objective

Make the selected data and workflows safely identifiable and testable without inventing canonical identity.

### Existing decision dependencies

- `domain:DEC-001` through `domain:DEC-005`;
- applicable API/backend identity decisions;
- applicable security identity decisions;
- data-ownership and Identity Contract gates.

### Required work direction

- inventory approved source identities and labels;
- preserve original values and provenance;
- approve the normalization rule and reviewed Thai/Unicode/date corpus needed by scope;
- classify exact, normalized, ambiguous, conflicting, missing, and rejected outcomes;
- approve exception ownership and acceptance thresholds;
- define reversible mapping and crosswalk behavior;
- resolve only the enterprise identities required by the selected v1 scope;
- map product requirements and acceptance criteria for identity behavior.

### Exit evidence

- no guessed identity match;
- reviewed ambiguity/conflict reports;
- approved mapping version and rollback behavior;
- scope-required identity decisions accepted or explicitly deferred;
- accepted source-to-target reconciliation criteria.

### Stop conditions

- registration, vehicle code, row order, timestamp, or local database ID is used as an unapproved shared identity;
- `fleetos_vehicle_id` is fabricated;
- unresolved records are silently merged;
- identity scope expands beyond approved need.

### Rollback

Restore the previous mapping version while retaining raw source values, issued references, decisions, and audit evidence. Never reverse-sync AutoPM cache.

## Workstream 3 — Runtime, security, persistence, and operational foundation

### Objective

Prepare the minimum approved isolated foundation required by the selected implementation workstream.

### Existing decision dependencies

- applicable `backend:DEC-015` through `018`;
- `IDEC-001` through `012`;
- applicable `SDEC-*`;
- applicable `ODEC-*`;
- database migration and recovery gates.

### Required work direction

- select only the required approved environment and runtime topology;
- define environment separation and configuration validation;
- approve applicable human/service identity, authentication, authorization, CORS, TLS, proxy, secret, and redaction behavior;
- approve the persistence and migration direction required by the selected scope;
- define backup, restore, recovery, and reconciliation evidence;
- define health/readiness dependencies and safe disclosure;
- assign operational owners and escalation for the selected scope;
- establish required logs, metrics, alerts, audit, and retention;
- isolate external recipients and production data from non-production testing.

### Exit evidence

- approved environment and security design;
- no secret exposure;
- isolated validation environment;
- tested configuration failure behavior;
- tested backup/restore or approved recovery evidence where persistence changes are included;
- assigned monitoring and incident ownership;
- explicit stop/go and rollback authority.

### Stop conditions

- production data or recipients can be reached unintentionally;
- secrets appear in source, browser assets, logs, fixtures, screenshots, or documents;
- authentication or authorization is assumed from UI state;
- persistence changes lack tested recovery;
- scheduler topology permits uncontrolled duplicate work.

### Rollback

Return to a known compatible environment, configuration, and application state. Preserve evidence and never restore revoked credentials.

## Workstream 4 — PM Assistant backend read models and approved API boundary

### Objective

Implement the approved subset of purpose-built read models behind PM Assistant authority before changing AutoPM consumption.

### Existing decision dependencies

- accepted ADR-0003 or approved replacement direction;
- accepted API Contract/Error Model for the selected endpoints;
- relevant domain, API, backend, security, infrastructure, and operations decisions;
- selected `EP-*`, `REQ-*`, `RSP-*`, `ERR-*`, `COMP-*`, and validation gates.

### Required work direction

- implement only approved endpoints and fields;
- separate API models from ORM and persistence models;
- preserve opaque local resource IDs and transitional identity behavior;
- serialize each status domain separately;
- implement approved empty, missing, ambiguous, conflicting, stale, unavailable, and authorization behavior;
- apply common safe success/error/correlation/freshness behavior;
- enforce approved projection and redaction;
- implement applicable pagination, filtering, sorting, caching, timeouts, and rate behavior;
- add contract, unit, integration, security, performance, readiness, and compatibility checks.

### Exit evidence

- selected API validation gates pass;
- no persistence or sensitive detail leaks;
- ambiguous identity is never auto-selected;
- legacy unversioned routes remain outside the v1 guarantee unless separately approved;
- current PM Assistant workflows remain compatible;
- provider rollback is tested.

### Stop conditions

- an endpoint or field is added because it is convenient rather than approved;
- a directional candidate is treated as part of the accepted contract;
- ORM/table shapes become public models;
- AutoPM receives write authority;
- a generic status replaces the four domains.

### Rollback

Disable or withdraw unsafe new exposure while retaining authoritative PM Assistant data and a compatible prior application state. Follow the approved schema recovery procedure if persistence changed.

## Workstream 5 — Controlled imports, scheduler, notifications, and audit

### Objective

Implement only approved background and side-effect behavior with deterministic identity, duplicate prevention, evidence, and recovery.

### Existing decision dependencies

- `domain:DEC-011` through `015`;
- `backend:DEC-008` through `010`, `012`, `014`;
- relevant security, infrastructure, and operations decisions.

### Required work direction

- define approved batch, job, occurrence, notification-intent, and attempt identities;
- implement preview and confirmation where required;
- preserve partial, rejected, ambiguous, failed, cancelled, and interrupted outcomes;
- implement approved replay/idempotency and concurrency behavior;
- enforce one approved scheduler execution owner;
- separate notification intent from attempts and provider outcomes;
- apply recipient authorization, redaction, retry, retention, and safe diagnostics;
- correlate actions with safe audit evidence;
- test restart, overlap, dependency failure, provider failure, timeout, and recovery.

### Exit evidence

- replays and overlaps do not duplicate accepted business outcomes;
- partial outcomes remain visible;
- notification failure is never reported as success;
- skipped duplicate execution remains observable;
- audit evidence contains required lineage without secrets;
- stop and recovery procedures are tested.

### Stop conditions

- filename, timestamp, or correlation ID is used as unapproved business identity;
- retries are unbounded;
- multiple scheduler owners can execute the same business occurrence;
- notification content or targets leak;
- failure evidence is overwritten or hidden.

### Rollback

Stop unsafe jobs, retries, and imports while preserving batch, occurrence, attempt, raw source, mapping, and audit evidence. Revert rule/mapping versions without rewriting original records.

## Workstream 6 — AutoPM read-only shadow integration

### Objective

Integrate AutoPM as a reversible consumer of the approved read boundary without changing authority.

### Existing decision dependencies

- selected frontend decisions;
- accepted API behavior;
- security/proxy/browser topology;
- KPI and freshness decisions;
- feature-switch and shadow acceptance decisions.

### Required work direction

- implement the approved client/proxy path;
- keep privileged credentials out of the browser;
- validate response models and unknown enum values;
- render source, `as_of`, freshness, stale, fallback, ambiguity, and unavailable states;
- keep status domains separate in presentation and filtering;
- run legacy and target paths in shadow mode;
- compare identities, plans, dates, statuses, counts, KPI populations, and freshness;
- place target consumption behind the approved reversible switch;
- validate responsive, accessibility, Thai/Unicode, failure, and recovery behavior.

### Exit evidence

- AutoPM remains unable to mutate maintenance workflow;
- no browser secret exists;
- shadow differences meet approved thresholds;
- exceptions have reviewed dispositions;
- consumer contract and failure tests pass;
- PM Assistant remains usable when AutoPM is unavailable;
- consumer rollback is tested.

### Stop conditions

- AutoPM duplicates authoritative business rules;
- stale cache becomes a synchronization source;
- target and legacy differences are hidden;
- a missing authoritative dataset is displayed as a valid zero;
- credentials or protected audit data reach browser storage.

### Rollback

Disable the target consumer and restore the labeled last-known-good path. Do not reverse-sync cache or transfer authority. Keep compatible provider behavior available for the approved fallback period.

## Workstream 7 — Enterprise validation and production-readiness evidence

### Objective

Demonstrate that the implemented approved scope meets its product, architecture, security, data, operational, recovery, and user-acceptance obligations.

### Required work direction

- execute requirement-linked unit, component, integration, contract, security, migration, operational, and end-to-end tests;
- reconcile identities, counts, statuses, history, imports, notifications, and KPIs;
- rehearse rollback, fallback, restore, recovery, and compatible deployment ordering;
- validate monitoring, alerts, runbooks, incident ownership, and access review;
- review secrets, dependencies, privacy, retention, logs, diagnostics, and permissions;
- document limitations and approved exceptions;
- confirm no unresolved production-blocking decision remains.

### Exit evidence

- requirement-to-acceptance-to-test traceability;
- passed validation gates or explicit Product Owner exceptions;
- recovery and rollback evidence;
- reviewed operational dashboards and alerts;
- user acceptance;
- release evidence without secrets;
- separately approved release recommendation.

### Stop conditions

- a critical/high requirement lacks test evidence;
- backup restore or fallback is unproven where required;
- operators cannot detect or respond to selected failure modes;
- unresolved identity or reconciliation gaps exceed approved thresholds;
- a target capability is claimed operational without evidence.

### Rollback

Use the approved component rollback or forward-recovery plan. Preserve PM Assistant authority, source evidence, identity mappings, audit, and compatibility.

## Workstream 8 — Separately approved rollout and stabilization

### Objective

Promote only the validated scope through controlled rollout after separate external-action approval.

### Preconditions

- Workstream 7 evidence accepted;
- separate deployment, migration, credential, data, provider, and production approvals;
- named rollout and rollback authority;
- approved cohorts, stop/go thresholds, stabilization window, and fallback.

### Required work direction

- deploy provider-compatible behavior before enabling consumers;
- apply approved configuration and migration in the authorized order;
- enable the target path for the approved cohort;
- monitor correctness, freshness, latency, errors, identity exceptions, jobs, imports, notifications, and security signals;
- stop at every approved promotion gate;
- retain fallback for the approved stabilization period.

### Exit evidence

- thresholds remain satisfied;
- no unresolved production-blocking incident remains;
- operational ownership and runbooks are active;
- Product Owner records release acceptance.

### Rollback

Invoke the approved stop/go and component rollback process. Rollback never makes AutoPM or a legacy feed authoritative.

## Phase 5 dependency matrix

| Workstream | Required predecessor | Primary governing areas |
| --- | --- | --- |
| Decision and contract gate | Phase 4.9 review | Governance, ADR, architecture, product |
| Identity and traceability | Decision gate | Ownership, identity, domain, product |
| Runtime/security/persistence | Decision gate; identity where schema depends on it | Backend, database, infrastructure, security, operations |
| Backend/API read models | Decision, identity, runtime/security foundation | Domain, API, application, backend |
| Background side effects | Decision, identity, runtime/security foundation | Domain, application, backend, security, operations |
| AutoPM shadow integration | Approved provider and frontend/security decisions | API, frontend, security, operations |
| Enterprise validation | Implemented selected scope | All areas |
| Rollout and stabilization | Accepted validation evidence and external approvals | Infrastructure, security, operations, Product Owner |

## Minimum file-plan rule

Every implementation proposal must list:

- exact source files;
- exact documentation files requiring synchronized updates;
- affected scoped identifiers and decisions;
- product requirements and acceptance criteria;
- tests and validation gates;
- architecture, data, security, and operations impact;
- migration or compatibility impact;
- rollback files and actions;
- external actions requiring separate approval.

No phase or workstream title is sufficient authorization.

## Recommended Phase 5 entry decision

The first Phase 5 approval should be a narrow decision-and-contract workstream, not a full target implementation.

The Product Owner should select the smallest implementation slice whose:

- architecture is already established;
- required decisions can be closed;
- file scope is exact;
- data and identity impact is bounded;
- tests and rollback are demonstrable;
- deployment, migration, credentials, and external actions can remain separately gated.

## Roadmap completion criteria

Phase 5 implementation is complete only when the approved scope:

- preserves all fixed FleetOS guardrails;
- has accepted decisions and traceability;
- is implemented and validated;
- has tested rollback or approved forward recovery;
- has no unresolved production-blocking decision;
- has accepted operational evidence;
- receives separate Product Owner release approval.

This roadmap is implementation-readiness guidance, not implementation or release approval.
