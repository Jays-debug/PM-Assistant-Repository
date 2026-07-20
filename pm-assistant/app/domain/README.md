# Domain Layer Skeleton

This package reserves the PM Assistant domain boundary. Phase 5.1 adds no entities,
aggregates, value objects, status transitions, identity rules, or business logic.

Phase 5.2 adds only the approved `OriginalVehicleNumber` value object. Phase 5.3
adds the minimal `Vehicle` Aggregate with storage-agnostic `local_vehicle_id`
identity and one `OriginalVehicleNumber`. This local identity has no enterprise,
cross-system, canonical, or public API meaning. The aggregate provides no mutation,
matching, normalization, alias, grouping, reconciliation, lifecycle, event,
repository, or persistence behavior.

Future separately approved work in this layer may implement approved domain meaning,
invariants, and inward-owned interfaces. The domain must remain independent of HTTP,
FastAPI, Pydantic transport models, SQLAlchemy, database engines, schedulers,
notification providers, environment access, deployment tooling, and AutoPM source.
The mileage, workflow, completion, and notification status domains must remain
separate.
