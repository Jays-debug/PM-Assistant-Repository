"""Verify VO-020 invariants approved by the FleetOS Product Owner.

The controlling authority is the Phase 5.2 Original Vehicle Number decision
recorded in the canonical FleetOS domain documentation.
"""

import unittest
from dataclasses import FrozenInstanceError

from app.domain.original_vehicle_number import OriginalVehicleNumber


class OriginalVehicleNumberTests(unittest.TestCase):
    """Verify only the approved raw-value preservation boundary."""

    def test_accepts_non_empty_text(self) -> None:
        vehicle_number = OriginalVehicleNumber("VH-001")

        self.assertEqual(vehicle_number.value, "VH-001")

    def test_preserves_leading_and_trailing_whitespace(self) -> None:
        original = "  VH-001\t"

        vehicle_number = OriginalVehicleNumber(original)

        self.assertEqual(vehicle_number.value, original)

    def test_preserves_unicode_digits_punctuation_and_separators(self) -> None:
        original = "รถ-๑๒٣/٤٥:Ａ"

        vehicle_number = OriginalVehicleNumber(original)

        self.assertEqual(vehicle_number.value, original)

    def test_rejects_none_and_other_non_string_values(self) -> None:
        for invalid_value in (None, 123, True, object()):
            with self.subTest(invalid_value=invalid_value):
                with self.assertRaises(TypeError):
                    OriginalVehicleNumber(invalid_value)  # type: ignore[arg-type]

    def test_rejects_empty_text(self) -> None:
        with self.assertRaises(ValueError):
            OriginalVehicleNumber("")

    def test_rejects_whitespace_only_text(self) -> None:
        for invalid_value in (" ", "\t", "\n", " \t\r\n "):
            with self.subTest(invalid_value=repr(invalid_value)):
                with self.assertRaises(ValueError):
                    OriginalVehicleNumber(invalid_value)

    def test_uses_exact_python_string_equality(self) -> None:
        self.assertEqual(
            OriginalVehicleNumber("VH-001"),
            OriginalVehicleNumber("VH-001"),
        )

        for different_value in ("vh-001", " VH-001", "VH-001 ", "VH–001"):
            with self.subTest(different_value=different_value):
                self.assertNotEqual(
                    OriginalVehicleNumber("VH-001"),
                    OriginalVehicleNumber(different_value),
                )

    def test_is_immutable(self) -> None:
        vehicle_number = OriginalVehicleNumber("VH-001")

        with self.assertRaises(FrozenInstanceError):
            vehicle_number.value = "VH-002"  # type: ignore[misc]

    def test_class_docstring_preserves_approved_boundary_statements(self) -> None:
        class_docstring = OriginalVehicleNumber.__doc__ or ""

        self.assertIn("This is NOT FleetOS Vehicle Identity.", class_docstring)
        self.assertIn("This is NOT a normalization object.", class_docstring)
        self.assertIn(
            "This is a raw source-preserved Value Object.",
            class_docstring,
        )


if __name__ == "__main__":
    unittest.main()
