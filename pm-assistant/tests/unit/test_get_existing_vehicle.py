"""Verify the Product Owner-approved Phase 5.4 Vehicle query slice."""

import unittest
from dataclasses import FrozenInstanceError

from app.application.get_existing_vehicle import (
    ExistingVehicleDetails,
    GetExistingVehicleByLocalIdentityHandler,
    GetExistingVehicleByLocalIdentityQuery,
    VehicleNotFoundError,
    VehicleReadUnavailableError,
)
from app.domain.original_vehicle_number import OriginalVehicleNumber
from app.domain.vehicle import Vehicle


class FakeExistingVehicleReadPort:
    """Provide deterministic existing Vehicles without persistence behavior."""

    def __init__(self, vehicle: Vehicle | None) -> None:
        self.vehicle = vehicle
        self.received_local_vehicle_id: int | None = None

    def get_by_local_vehicle_id(self, local_vehicle_id: int) -> Vehicle | None:
        self.received_local_vehicle_id = local_vehicle_id
        return self.vehicle


class UnavailableExistingVehicleReadPort:
    """Represent a typed inability to complete the inward read."""

    def get_by_local_vehicle_id(self, local_vehicle_id: int) -> Vehicle | None:
        raise VehicleReadUnavailableError("Vehicle read is unavailable.")


class InvalidExistingVehicleReadPort:
    """Return an invalid boundary object to verify ORM-like objects cannot leak."""

    def get_by_local_vehicle_id(self, local_vehicle_id: int) -> Vehicle | None:
        return object()  # type: ignore[return-value]


class GetExistingVehicleByLocalIdentityTests(unittest.TestCase):
    """Verify retrieval, projection, validation, and typed read outcomes."""

    def test_retrieves_by_local_identity_and_preserves_raw_number(self) -> None:
        vehicle = Vehicle(
            local_vehicle_id=7,
            original_vehicle_number=OriginalVehicleNumber("  ทะเบียน-๐๑ / A  "),
        )
        read_port = FakeExistingVehicleReadPort(vehicle)
        handler = GetExistingVehicleByLocalIdentityHandler(read_port)

        result = handler.execute(GetExistingVehicleByLocalIdentityQuery(7))

        self.assertEqual(
            result,
            ExistingVehicleDetails(
                local_vehicle_id=7,
                original_vehicle_number="  ทะเบียน-๐๑ / A  ",
            ),
        )
        self.assertEqual(read_port.received_local_vehicle_id, 7)

    def test_result_is_immutable(self) -> None:
        result = ExistingVehicleDetails(7, "VH-007")

        with self.assertRaises(FrozenInstanceError):
            result.local_vehicle_id = 8  # type: ignore[misc]

    def test_query_rejects_non_integer_and_boolean_local_identity(self) -> None:
        for invalid_value in (None, "1", 1.0, True, False, object()):
            with self.subTest(invalid_value=invalid_value):
                with self.assertRaises(TypeError):
                    GetExistingVehicleByLocalIdentityQuery(
                        invalid_value  # type: ignore[arg-type]
                    )

    def test_query_rejects_non_positive_local_identity(self) -> None:
        for invalid_value in (0, -1):
            with self.subTest(invalid_value=invalid_value):
                with self.assertRaises(ValueError):
                    GetExistingVehicleByLocalIdentityQuery(invalid_value)

    def test_reports_missing_vehicle_distinctly(self) -> None:
        handler = GetExistingVehicleByLocalIdentityHandler(
            FakeExistingVehicleReadPort(None)
        )

        with self.assertRaises(VehicleNotFoundError) as error:
            handler.execute(GetExistingVehicleByLocalIdentityQuery(11))

        self.assertEqual(error.exception.local_vehicle_id, 11)

    def test_propagates_typed_read_unavailable_error(self) -> None:
        handler = GetExistingVehicleByLocalIdentityHandler(
            UnavailableExistingVehicleReadPort()
        )

        with self.assertRaises(VehicleReadUnavailableError):
            handler.execute(GetExistingVehicleByLocalIdentityQuery(11))

    def test_rejects_non_vehicle_result_from_read_port(self) -> None:
        handler = GetExistingVehicleByLocalIdentityHandler(
            InvalidExistingVehicleReadPort()
        )

        with self.assertRaisesRegex(TypeError, "must return a Vehicle or None"):
            handler.execute(GetExistingVehicleByLocalIdentityQuery(11))

    def test_requires_the_approved_query_contract(self) -> None:
        handler = GetExistingVehicleByLocalIdentityHandler(
            FakeExistingVehicleReadPort(None)
        )

        with self.assertRaises(TypeError):
            handler.execute(11)  # type: ignore[arg-type]


if __name__ == "__main__":
    unittest.main()
