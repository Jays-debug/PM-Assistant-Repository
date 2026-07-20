"""Verify the Product Owner-approved Phase 5.3 minimal Vehicle Aggregate."""

import unittest
from dataclasses import FrozenInstanceError

from app.domain.original_vehicle_number import OriginalVehicleNumber
from app.domain.vehicle import Vehicle


class VehicleTests(unittest.TestCase):
    """Verify only local identity, preserved evidence, and approved exclusions."""

    def test_constructs_with_minimum_approved_state(self) -> None:
        original_vehicle_number = OriginalVehicleNumber("VH-001")

        vehicle = Vehicle(
            local_vehicle_id=1,
            original_vehicle_number=original_vehicle_number,
        )

        self.assertEqual(vehicle.local_vehicle_id, 1)
        self.assertIs(vehicle.original_vehicle_number, original_vehicle_number)

    def test_exposes_only_the_approved_domain_state(self) -> None:
        self.assertEqual(
            set(Vehicle.__dataclass_fields__),
            {"local_vehicle_id", "original_vehicle_number"},
        )

    def test_rejects_non_integer_and_boolean_local_vehicle_id(self) -> None:
        original_vehicle_number = OriginalVehicleNumber("VH-001")

        for invalid_value in (None, "1", 1.0, True, False, object()):
            with self.subTest(invalid_value=invalid_value):
                with self.assertRaises(TypeError):
                    Vehicle(
                        local_vehicle_id=invalid_value,  # type: ignore[arg-type]
                        original_vehicle_number=original_vehicle_number,
                    )

    def test_rejects_non_positive_local_vehicle_id(self) -> None:
        original_vehicle_number = OriginalVehicleNumber("VH-001")

        for invalid_value in (0, -1):
            with self.subTest(invalid_value=invalid_value):
                with self.assertRaises(ValueError):
                    Vehicle(
                        local_vehicle_id=invalid_value,
                        original_vehicle_number=original_vehicle_number,
                    )

    def test_requires_original_vehicle_number_value_object(self) -> None:
        for invalid_value in (None, "VH-001", 123, object()):
            with self.subTest(invalid_value=invalid_value):
                with self.assertRaises(TypeError):
                    Vehicle(
                        local_vehicle_id=1,
                        original_vehicle_number=invalid_value,  # type: ignore[arg-type]
                    )

    def test_entity_equality_uses_only_local_vehicle_id(self) -> None:
        first = Vehicle(1, OriginalVehicleNumber("VH-001"))
        same_identity_different_evidence = Vehicle(
            1, OriginalVehicleNumber("OTHER-999")
        )

        self.assertEqual(first, same_identity_different_evidence)
        self.assertEqual(hash(first), hash(same_identity_different_evidence))

    def test_equal_vehicle_number_does_not_establish_entity_identity(self) -> None:
        first = Vehicle(1, OriginalVehicleNumber("VH-001"))
        different_identity = Vehicle(2, OriginalVehicleNumber("VH-001"))

        self.assertNotEqual(first, different_identity)

    def test_is_immutable(self) -> None:
        vehicle = Vehicle(1, OriginalVehicleNumber("VH-001"))

        with self.assertRaises(FrozenInstanceError):
            vehicle.local_vehicle_id = 2  # type: ignore[misc]
        with self.assertRaises(FrozenInstanceError):
            vehicle.original_vehicle_number = OriginalVehicleNumber(  # type: ignore[misc]
                "VH-002"
            )

    def test_does_not_compare_equal_to_raw_local_identity(self) -> None:
        vehicle = Vehicle(1, OriginalVehicleNumber("VH-001"))

        self.assertNotEqual(vehicle, 1)


if __name__ == "__main__":
    unittest.main()
