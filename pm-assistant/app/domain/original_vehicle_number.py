"""Preserve an original vehicle number under the Phase 5.2 authority.

The controlling authority is the Product Owner-approved ``VO-020`` definition
and its rules in the canonical FleetOS domain documentation.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class OriginalVehicleNumber:
    """Represent an original vehicle number exactly as supplied by its source.

    This is NOT FleetOS Vehicle Identity.
    This is NOT a normalization object.
    This is a raw source-preserved Value Object.
    """

    value: str

    def __post_init__(self) -> None:
        """Reject inputs outside the Product Owner-approved raw-value boundary."""
        if not isinstance(self.value, str):
            raise TypeError("OriginalVehicleNumber value must be a string.")
        if not self.value.strip():
            raise ValueError(
                "OriginalVehicleNumber value must not be empty or whitespace-only."
            )
