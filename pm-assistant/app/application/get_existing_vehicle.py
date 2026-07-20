"""Retrieve one existing Vehicle through a minimal inward application port.

This module implements only the Product Owner-approved Phase 5.4 application
slice. It does not define persistence, API, matching, normalization, creation,
mutation, or Vehicle lifecycle behavior.
"""

from dataclasses import dataclass
from typing import Protocol

from app.domain.vehicle import Vehicle


def _validate_local_vehicle_id(local_vehicle_id: int) -> None:
    """Validate the approved PM Assistant-local identity boundary."""
    if isinstance(local_vehicle_id, bool) or not isinstance(local_vehicle_id, int):
        raise TypeError("local_vehicle_id must be an integer.")
    if local_vehicle_id <= 0:
        raise ValueError("local_vehicle_id must be positive.")


@dataclass(frozen=True)
class GetExistingVehicleByLocalIdentityQuery:
    """Request one existing PM Assistant-local Vehicle by its local identity."""

    local_vehicle_id: int

    def __post_init__(self) -> None:
        _validate_local_vehicle_id(self.local_vehicle_id)


@dataclass(frozen=True)
class ExistingVehicleDetails:
    """Expose only the two fields approved for the minimal Vehicle Aggregate."""

    local_vehicle_id: int
    original_vehicle_number: str


class VehicleNotFoundError(LookupError):
    """Report that an exact PM Assistant-local Vehicle identity does not exist."""

    def __init__(self, local_vehicle_id: int) -> None:
        self.local_vehicle_id = local_vehicle_id
        super().__init__(f"Vehicle {local_vehicle_id} was not found.")


class VehicleReadUnavailableError(RuntimeError):
    """Report that the inward read dependency could not complete the query."""


class ExistingVehicleReadPort(Protocol):
    """Inward application port for loading one already-existing Vehicle.

    ``Existing`` excludes creation authority, while ``ReadPort`` makes the
    architectural direction explicit. Implementations belong to a later,
    separately approved infrastructure scope.
    """

    def get_by_local_vehicle_id(self, local_vehicle_id: int) -> Vehicle | None:
        """Return the exact local Vehicle or ``None`` without hidden mutation."""
        ...


class GetExistingVehicleByLocalIdentityHandler:
    """Coordinate the approved read-only Vehicle application query."""

    def __init__(self, vehicle_read_port: ExistingVehicleReadPort) -> None:
        self._vehicle_read_port = vehicle_read_port

    def execute(
        self, query: GetExistingVehicleByLocalIdentityQuery
    ) -> ExistingVehicleDetails:
        """Return approved Vehicle state while preserving the raw number exactly."""
        if not isinstance(query, GetExistingVehicleByLocalIdentityQuery):
            raise TypeError(
                "query must be a GetExistingVehicleByLocalIdentityQuery."
            )

        vehicle = self._vehicle_read_port.get_by_local_vehicle_id(
            query.local_vehicle_id
        )
        if vehicle is None:
            raise VehicleNotFoundError(query.local_vehicle_id)
        if not isinstance(vehicle, Vehicle):
            raise TypeError(
                "ExistingVehicleReadPort must return a Vehicle or None."
            )

        return ExistingVehicleDetails(
            local_vehicle_id=vehicle.local_vehicle_id,
            original_vehicle_number=vehicle.original_vehicle_number.value,
        )
