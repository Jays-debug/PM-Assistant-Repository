"""Compose approved PM Assistant application dependencies.

Entry points may call the focused builders in this module without owning
infrastructure construction or persistence configuration.
"""

import database
from app.application.get_existing_vehicle import (
    GetExistingVehicleByLocalIdentityHandler,
)
from app.infrastructure.existing_vehicle_read_adapter import (
    ExistingVehicleReadAdapter,
)


def build_get_existing_vehicle_by_local_identity_handler(
) -> GetExistingVehicleByLocalIdentityHandler:
    """Build the approved read-only Vehicle query dependency graph."""
    vehicle_read_adapter = ExistingVehicleReadAdapter(database.SessionLocal)
    return GetExistingVehicleByLocalIdentityHandler(vehicle_read_adapter)
