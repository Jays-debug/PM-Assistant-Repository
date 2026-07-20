# Infrastructure Layer

This package reserves the PM Assistant infrastructure-adapter boundary. Phase 5.1
adds no persistence adapter, ORM mapping, database schema, SQL, provider integration,
scheduler, configuration, environment handling, or runtime wiring.

Phase 5.5 adds only `ExistingVehicleReadAdapter`, a focused SQLAlchemy implementation
of the Phase 5.4 inward `ExistingVehicleReadPort`. It reads an existing
PM Assistant-local Vehicle by exact `local_vehicle_id`, maps only the stored local
identifier and exact stored Vehicle Number into the Phase 5.3 Aggregate, and returns
`None` when that local record is absent. It owns a short-lived injected session,
closes it reliably, performs no commit or hidden write, and translates database or
malformed-persistence failures into the approved read-unavailable application error.

This adapter does not provide lookup by Vehicle Number, normalization, trimming,
fallback data access, candidate matching, aliases, grouping, reconciliation,
creation, mutation, lifecycle authority, API exposure, or AutoPM integration.

Future separately approved adapters may implement interfaces owned by the application
or domain layers and translate implementation-specific failures into safe internal
classifications. Infrastructure must not expose persistence models across module
boundaries, grant AutoPM persistence access, independently define business rules, or
turn provider payloads into domain contracts.
