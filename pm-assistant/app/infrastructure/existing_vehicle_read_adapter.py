"""Load an existing PM Assistant-local Vehicle from SQLAlchemy persistence."""

from collections.abc import Callable

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.get_existing_vehicle import (
    ExistingVehicleReadPort,
    VehicleReadUnavailableError,
)
from app.domain.original_vehicle_number import OriginalVehicleNumber
from app.domain.vehicle import Vehicle
from database import VehicleMaster


class ExistingVehicleReadAdapter(ExistingVehicleReadPort):
    """Implement the focused read port without adding Vehicle write semantics."""

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    def get_by_local_vehicle_id(self, local_vehicle_id: int) -> Vehicle | None:
        """Return the exact locally identified Vehicle or ``None`` when absent."""
        try:
            with self._session_factory() as session:
                row = session.execute(
                    select(VehicleMaster.id, VehicleMaster.vehicle_no).where(
                        VehicleMaster.id == local_vehicle_id
                    )
                ).one_or_none()
        except SQLAlchemyError as exc:
            raise VehicleReadUnavailableError("Vehicle read unavailable.") from exc

        if row is None:
            return None

        stored_local_vehicle_id, stored_vehicle_number = row
        try:
            return Vehicle(
                local_vehicle_id=stored_local_vehicle_id,
                original_vehicle_number=OriginalVehicleNumber(
                    stored_vehicle_number
                ),
            )
        except (TypeError, ValueError) as exc:
            raise VehicleReadUnavailableError("Vehicle read unavailable.") from exc
