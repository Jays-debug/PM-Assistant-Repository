"""Verify the focused dependency composition for the Vehicle read query."""

import inspect
import unittest
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

import composition
from app.application.get_existing_vehicle import (
    ExistingVehicleDetails,
    GetExistingVehicleByLocalIdentityHandler,
    GetExistingVehicleByLocalIdentityQuery,
    VehicleNotFoundError,
)
from database import Base, VehicleMaster


class ExistingVehicleDependencyCompositionTests(unittest.TestCase):
    """Exercise the composed graph without using production persistence."""

    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.session_factory = sessionmaker(bind=self.engine)

    def tearDown(self) -> None:
        self.engine.dispose()

    def _build_handler(self) -> GetExistingVehicleByLocalIdentityHandler:
        with patch.object(
            composition.database,
            "SessionLocal",
            self.session_factory,
        ):
            return composition.build_get_existing_vehicle_by_local_identity_handler()

    def test_builds_and_executes_the_approved_read_graph(self) -> None:
        stored_number = "  ทะเบียน-๐๑ / A  "
        with Session(self.engine) as session:
            session.add(VehicleMaster(id=7, vehicle_no=stored_number))
            session.commit()

        handler = self._build_handler()

        result = handler.execute(GetExistingVehicleByLocalIdentityQuery(7))

        self.assertIsInstance(handler, GetExistingVehicleByLocalIdentityHandler)
        self.assertEqual(
            result,
            ExistingVehicleDetails(
                local_vehicle_id=7,
                original_vehicle_number=stored_number,
            ),
        )
        with Session(self.engine) as session:
            self.assertEqual(session.query(VehicleMaster).count(), 1)

    def test_builder_is_parameterless_and_creates_independent_graphs(self) -> None:
        signature = inspect.signature(
            composition.build_get_existing_vehicle_by_local_identity_handler
        )

        first_handler = self._build_handler()
        second_handler = self._build_handler()

        self.assertEqual(tuple(signature.parameters), ())
        self.assertIsNot(first_handler, second_handler)
        with self.assertRaises(VehicleNotFoundError):
            first_handler.execute(GetExistingVehicleByLocalIdentityQuery(999))


if __name__ == "__main__":
    unittest.main()
