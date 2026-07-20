# Application Layer Skeleton

This package reserves the PM Assistant application and use-case boundary. Phase 5.1
adds no services, commands, queries, entities, repositories, or business behavior.

Future separately approved work in this layer may coordinate use cases, domain
policies, inward-owned interfaces, transactions, and safe application results. It
may depend on the domain layer but must not depend directly on presentation details,
ORM entities, database sessions, provider SDKs, AutoPM source, or browser state.

Phase 5.4 adds one internal, read-only application query for retrieving an existing
Vehicle by immutable PM Assistant-local `local_vehicle_id`. Its immutable result
contains only `local_vehicle_id` and the exact raw `original_vehicle_number` text.

The query depends on `ExistingVehicleReadPort`, an inward application port. The
name deliberately combines `Existing`, which excludes creation and lifecycle
authority, with `VehicleReadPort`, which identifies both the subject, read-only
capability, and dependency direction. The more generic `VehicleReader` would not
make the architectural port role explicit, while `VehicleReadPort` alone would not
make the existing-record-only boundary explicit.

Phase 5.4 adds no list or Vehicle Number lookup, normalization, matching, alias,
grouping, reconciliation, command, mutation, event, repository implementation,
persistence adapter, ORM mapping, API, presentation behavior, AutoPM change, or new
dependency. Missing and unavailable reads remain distinct internal outcomes.
