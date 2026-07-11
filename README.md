# FleetOS — Fleet Operating System

FleetOS is the parent fleet-management platform developed by Piyapun Sommee. It brings together two existing modules whose names remain unchanged:

- **AutoPM** — Fleet preventive-maintenance dashboard
- **PM Assistant** — Maintenance-management system

## Project structure

```text
PM-Assistant-Repository/
├── autopm/                 # AutoPM
├── pm-assistant/           # PM Assistant
├── docs/
│   └── PHASE_2_PLAN.md
├── AGENTS.md
├── PROJECT_CONTEXT.md
├── ROADMAP.md
├── CHANGELOG.md
└── README.md
```

Phase 2.0 changes the parent-platform name and establishes development governance only. It does not rename folders, Python modules, API paths, database tables, URLs, Netlify or Railway projects, or application screens.

## Modules

### AutoPM

AutoPM is the fleet preventive-maintenance dashboard. Its current capabilities include PM dashboards, vehicle status, KPI reporting, PM calendars, Google Sheets integration, fleet statistics, business-unit filters, and executive dashboards.

Technology: HTML, CSS, JavaScript, and Google Apps Script.

### PM Assistant

PM Assistant is the maintenance-management system. Its current capabilities include PM planning, calendars, notifications, LINE integration, vehicle and location masters, PM history, scheduling, import/export, and a FastAPI backend.

Technology: Python, FastAPI, SQLAlchemy, SQLite, with Railway and PostgreSQL readiness planned.

## Target architecture

```text
FleetOS
├── AutoPM
└── PM Assistant
    ├── REST API
    └── Data persistence
```

Deployment and database decisions are governed by the Phase 2 plan and must pass their approval gates before implementation.

## Development governance

Every task that may modify code or project files must follow this sequence:

```text
Analyze
→ Explain
→ Architecture Impact
→ Risk Analysis
→ Plan
→ Wait Approval
→ Modify Code
→ Run Tests
→ Create Summary
→ Commit
```

No application source code may be modified before explicit human approval.

## Current status

| Area | Status |
| --- | --- |
| AutoPM | Stable |
| PM Assistant | Development |
| Phase 1 — Repository Foundation and Architecture Audit | Complete |
| Phase 2 — FleetOS Architecture and Deployment Readiness | In progress |

See [ROADMAP.md](ROADMAP.md) and [docs/PHASE_2_PLAN.md](docs/PHASE_2_PLAN.md) for the approved direction and gates.

## Maintainer

**Piyapun Sommee**  
Senior Maintenance Planning Officer  
Fleet Management System Developer  
Thailand
