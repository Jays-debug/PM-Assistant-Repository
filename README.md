# FleetOS — Fleet Operating System

FleetOS is the parent fleet-management platform developed by Piyapun Sommee. It preserves two existing modules whose names and implementation boundaries remain unchanged:

- **AutoPM** — fleet preventive-maintenance dashboard and reporting presentation
- **PM Assistant** — maintenance planning, workflow, history, notification, scheduling, import, and persistence

## Repository status

The repository contains the FleetOS documentation baseline through:

- Phase 4.8 architecture-area documentation;
- Phase 4.9 Enterprise Architecture Review and Implementation Readiness assessment;
- Phase 4.9.1 documentation-only repository remediation.

Phase 5 implementation remains on **hold** until its applicable proposed decisions, contracts, unresolved decisions, validation evidence, rollback direction, and exact file scope receive separate Product Owner approval.

## Project structure

```text
PM-Assistant-Repository/
├── autopm/                  # AutoPM implementation
├── pm-assistant/            # PM Assistant implementation
├── docs/                    # FleetOS architecture and review documentation
│   ├── README.md            # Documentation index
│   ├── adr/                 # Architecture Decision Records
│   ├── review/              # Enterprise review and readiness evidence
│   └── ...                  # Architecture-area documentation
├── AGENTS.md                # Repository governance
├── FLEETOS_DEVELOPMENT_GUIDE.md
├── PROJECT_CONTEXT.md
├── ROADMAP.md
├── CHANGELOG.md
└── README.md
```

## Architecture guardrails

- FleetOS is the parent platform.
- AutoPM and PM Assistant remain separate bounded modules, deployment units, and rollback units.
- PM Assistant remains authoritative for maintenance workflow information and persistence.
- AutoPM remains read-only for maintenance workflow information and owns presentation.
- Direct shared-database access is prohibited.
- `vehicle_no` remains a transitional matching key.
- `fleetos_vehicle_id` remains proposed and unimplemented.
- `pm_mileage_status`, `pm_workflow_status`, `completion_status`, and `notification_status` remain separate domains.

Target, proposed, planned, and unresolved documentation must not be interpreted as implemented or operational.

## Current implementation evidence

### AutoPM

Current repository evidence includes HTML, CSS, JavaScript, Google Apps Script, Google Sheets/CSV consumption, dashboards, filters, calendars, and KPI presentation.

### PM Assistant

Current repository evidence includes Python, FastAPI, SQLAlchemy, SQLite, APScheduler, LINE integration, planning, history, imports, notifications, and maintenance persistence.

These technologies and behaviors are current implementation evidence. They do not approve a target production topology, datastore, authentication model, or deployment platform.

## Documentation navigation

- [FleetOS documentation index](docs/README.md)
- [Project context](PROJECT_CONTEXT.md)
- [Repository roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [FleetOS Development Guide](FLEETOS_DEVELOPMENT_GUIDE.md)
- [Enterprise Architecture Review](docs/review/README.md)
- [Unresolved Decisions Register](docs/review/UNRESOLVED_DECISIONS_REGISTER.md)
- [Implementation Readiness Report](docs/review/IMPLEMENTATION_READINESS_REPORT.md)

Historical Phase 2 direction remains available in [docs/PHASE_2_PLAN.md](docs/PHASE_2_PLAN.md), but it is not the current repository status index.

## Development governance

Every task that may modify project files follows:

```text
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
Modify Approved Files
↓
Validate
↓
Create Summary
↓
Commit only when explicitly authorized
```

No application source code may be modified before explicit human approval.

## Maintainer

**Piyapun Sommee**  
Senior Maintenance Planning Officer  
Fleet Management System Developer  
Thailand
