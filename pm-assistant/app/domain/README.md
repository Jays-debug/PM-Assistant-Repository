# Domain Layer Skeleton

This package reserves the PM Assistant domain boundary. Phase 5.1 adds no entities,
aggregates, value objects, status transitions, identity rules, or business logic.

Future separately approved work in this layer may implement approved domain meaning,
invariants, and inward-owned interfaces. The domain must remain independent of HTTP,
FastAPI, Pydantic transport models, SQLAlchemy, database engines, schedulers,
notification providers, environment access, deployment tooling, and AutoPM source.
The mileage, workflow, completion, and notification status domains must remain
separate.
