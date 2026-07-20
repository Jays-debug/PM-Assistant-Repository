"""Verify the focused SQLAlchemy adapter for existing Vehicle reads."""

import unittest

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.application.get_existing_vehicle import VehicleReadUnavailableError
from app.domain.vehicle import Vehicle
from app.infrastructure.existing_vehicle_read_adapter import (
    ExistingVehicleReadAdapter,
)
from database import Base, VehicleMaster


class TrackingSession(Session):
    """Record resource closure without changing SQLAlchemy behavior."""

    close_called: bool

    def __init__(self, *args: object, **kwargs: object) -> None:
        super().__init__(*args, **kwargs)
        self.close_called = False

    def close(self) -> None:
        self.close_called = True
        super().close()


class ExistingVehicleReadAdapterTests(unittest.TestCase):
    """Exercise only exact local-identity reads and safe failure behavior."""

    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.session_maker = sessionmaker(bind=self.engine, class_=TrackingSession)
        self.created_sessions: list[TrackingSession] = []

        def session_factory() -> TrackingSession:
            session = self.session_maker()
            self.created_sessions.append(session)
            return session

        self.adapter = ExistingVehicleReadAdapter(session_factory)

    def tearDown(self) -> None:
        self.engine.dispose()

    def _store_vehicle(self, local_vehicle_id: int, vehicle_no: str) -> None:
        with Session(self.engine) as session:
            session.add(
                VehicleMaster(id=local_vehicle_id, vehicle_no=vehicle_no)
            )
            session.commit()

    def test_reads_exact_local_identity_and_preserves_stored_number(self) -> None:
        stored_number = "  รถ-๑๒๓ / A  "
        self._store_vehicle(7, stored_number)

        vehicle = self.adapter.get_by_local_vehicle_id(7)

        self.assertIsInstance(vehicle, Vehicle)
        self.assertEqual(vehicle.local_vehicle_id, 7)
        self.assertEqual(vehicle.original_vehicle_number.value, stored_number)

    def test_returns_none_when_local_identity_is_missing(self) -> None:
        self.assertIsNone(self.adapter.get_by_local_vehicle_id(999))

    def test_translates_database_failure_to_read_unavailable(self) -> None:
        Base.metadata.drop_all(self.engine)

        with self.assertRaises(VehicleReadUnavailableError):
            self.adapter.get_by_local_vehicle_id(1)

    def test_translates_invalid_stored_local_identity(self) -> None:
        self._store_vehicle(-1, "VH-001")

        with self.assertRaises(VehicleReadUnavailableError):
            self.adapter.get_by_local_vehicle_id(-1)

    def test_translates_invalid_stored_vehicle_number(self) -> None:
        self._store_vehicle(1, " \t ")

        with self.assertRaises(VehicleReadUnavailableError):
            self.adapter.get_by_local_vehicle_id(1)

    def test_executes_only_a_select_and_does_not_mutate_persistence(self) -> None:
        self._store_vehicle(1, "VH-001")
        statements: list[str] = []

        def record_statement(
            _connection: object,
            _cursor: object,
            statement: str,
            _parameters: object,
            _context: object,
            _executemany: bool,
        ) -> None:
            statements.append(statement)

        event.listen(self.engine, "before_cursor_execute", record_statement)
        try:
            self.adapter.get_by_local_vehicle_id(1)
        finally:
            event.remove(self.engine, "before_cursor_execute", record_statement)

        self.assertEqual(len(statements), 1)
        self.assertTrue(statements[0].lstrip().upper().startswith("SELECT"))
        with Session(self.engine) as session:
            self.assertEqual(session.query(VehicleMaster).count(), 1)

    def test_closes_session_after_success_missing_and_failure(self) -> None:
        self._store_vehicle(1, "VH-001")
        self.adapter.get_by_local_vehicle_id(1)
        self.adapter.get_by_local_vehicle_id(999)
        Base.metadata.drop_all(self.engine)

        with self.assertRaises(VehicleReadUnavailableError):
            self.adapter.get_by_local_vehicle_id(1)

        self.assertEqual(len(self.created_sessions), 3)
        self.assertTrue(all(session.close_called for session in self.created_sessions))


if __name__ == "__main__":
    unittest.main()
