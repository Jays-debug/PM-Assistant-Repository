# 🚛 Fleet Management Platform

Unified Fleet Management System developed by Piyapun Sommee.

This repository contains two major systems:

- 🚛 AutoPM Dashboard (Fleet PM Dashboard)
- 🛠 PM Assistant (Maintenance Management System)

---

# Project Structure

```
PM-Assistant-Repository/
│
├── autopm/
│   ├── assets/
│   ├── app.js
│   ├── style.css
│   ├── index.html
│   └── data.csv
│
├── pm-assistant/
│   ├── app/
│   ├── static/
│   ├── logs/
│   ├── database.py
│   ├── notifier.py
│   ├── main.py
│   └── requirements.txt
│
├── AGENTS.md
├── ROADMAP.md
├── PROJECT_CONTEXT.md
├── CHANGELOG.md
└── README.md
```

---

# Project Overview

## AutoPM

Fleet Preventive Maintenance Dashboard

Current Features

- PM Dashboard
- Vehicle Status
- KPI
- PM Calendar
- Google Sheets API
- Fleet Statistics
- Business Unit Filter
- Executive Dashboard

Technology

- HTML
- CSS
- JavaScript
- Google Apps Script

---

## PM Assistant

Maintenance Management Platform

Current Features

- PM Planning
- Calendar
- Notification
- LINE Notify
- Vehicle Master
- Location Master
- PM History
- Scheduler
- Import / Export
- FastAPI Backend

Technology

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Railway (planned)
- PostgreSQL (planned)

---

# Future Architecture

```
AutoPM
      │
      ▼
 REST API
      │
      ▼
PM Assistant
      │
      ▼
 PostgreSQL
      │
      ▼
 Railway
```

---

# Repository Goal

Create one complete Fleet Management Platform including

- Preventive Maintenance
- Corrective Maintenance
- Vehicle Database
- Dashboard
- KPI
- Cost Analysis
- Tire Management
- Notification
- Executive Dashboard

---

# Current Status

| Module | Status |
|---------|--------|
| AutoPM | Stable |
| PM Assistant | Development |
| Railway | Planned |
| PostgreSQL | Planned |
| Merge Project | Planning |

---

# Development Workflow

```
GitHub

↓

Codex

↓

Analyze

↓

Planning

↓

Develop

↓

Commit

↓

Railway Deploy
```

---

# Maintainer

**Piyapun Sommee**

Senior Maintenance Planning Officer

Fleet Management System Developer

Thailand