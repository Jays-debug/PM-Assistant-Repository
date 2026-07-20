"""Define the minimal Vehicle Aggregate approved for Phase 5.3.

The aggregate represents only PM Assistant-local entity continuity. It does not
define enterprise or cross-system Vehicle identity.
"""

from dataclasses import dataclass

from .original_vehicle_number import OriginalVehicleNumber


@dataclass(frozen=True, eq=False)
class Vehicle:
    """Represent a Vehicle by local identity and preserved source evidence.

    ``local_vehicle_id`` is storage-agnostic and scoped only to PM Assistant.
    It is not ``vehicle_no``, FleetOS Vehicle identity, or a public API identity.
    """

    local_vehicle_id: int
    original_vehicle_number: OriginalVehicleNumber

    def __post_init__(self) -> None:
        """Enforce only the Product Owner-approved minimal aggregate boundary."""
        if isinstance(self.local_vehicle_id, bool) or not isinstance(
            self.local_vehicle_id, int
        ):
            raise TypeError("local_vehicle_id must be an integer.")
        if self.local_vehicle_id <= 0:
            raise ValueError("local_vehicle_id must be positive.")
        if not isinstance(self.original_vehicle_number, OriginalVehicleNumber):
            raise TypeError(
                "original_vehicle_number must be an OriginalVehicleNumber."
            )

    def __eq__(self, other: object) -> bool:
        """Compare Vehicle entity identity using only ``local_vehicle_id``."""
        if not isinstance(other, Vehicle):
            return NotImplemented
        return self.local_vehicle_id == other.local_vehicle_id

    def __hash__(self) -> int:
        """Hash the immutable PM Assistant-local entity identity."""
        return hash(self.local_vehicle_id)
