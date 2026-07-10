PM Tracking v1.4 Refactor staging structure
- app/api: future API routers
- app/services: business services
- app/line: LINE integration module
- app/scheduler: scheduler module
- app/database: database connector/migration module
- app/models: SQLAlchemy/Pydantic models
- app/utils: shared utilities/logging

For v1.4 compatibility, main.py/database.py/notifier.py remain at root.
V2.0 can migrate code into this app package step-by-step without breaking current run.bat.
