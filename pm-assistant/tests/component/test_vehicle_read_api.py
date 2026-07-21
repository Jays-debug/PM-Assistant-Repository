"""Verify the focused FastAPI boundary for the existing-Vehicle read slice."""

import asyncio
import builtins
import json
import unittest
from dataclasses import dataclass
from unittest.mock import patch
from urllib.parse import quote

from fastapi import FastAPI

from app.application.get_existing_vehicle import (
    ExistingVehicleDetails,
    GetExistingVehicleByLocalIdentityQuery,
    VehicleNotFoundError,
    VehicleReadUnavailableError,
)
import app.presentation.vehicle_read as vehicle_read_presentation
from app.presentation.vehicle_read import (
    provide_get_existing_vehicle_handler,
    router,
)


class StubExistingVehicleHandler:
    """Return or raise a configured application-layer outcome."""

    def __init__(self, outcome: object) -> None:
        self.outcome = outcome
        self.received_query: GetExistingVehicleByLocalIdentityQuery | None = None

    def execute(
        self, query: GetExistingVehicleByLocalIdentityQuery
    ) -> ExistingVehicleDetails:
        self.received_query = query
        if isinstance(self.outcome, Exception):
            raise self.outcome
        if not isinstance(self.outcome, ExistingVehicleDetails):
            raise TypeError("Stub outcome must follow the application result contract.")
        return self.outcome


@dataclass(frozen=True)
class AsgiResponse:
    """Capture the small response surface needed by these component tests."""

    status_code: int
    body: bytes

    @property
    def text(self) -> str:
        return self.body.decode("utf-8")

    def json(self) -> object:
        return json.loads(self.body)


class ExistingVehicleReadApiTests(unittest.TestCase):
    """Exercise routing, validation, projection, and typed error translation."""

    def setUp(self) -> None:
        self.app = FastAPI()
        self.app.include_router(router)

    def _request_with(
        self, handler: StubExistingVehicleHandler, path: str
    ) -> AsgiResponse:
        self.app.dependency_overrides[
            provide_get_existing_vehicle_handler
        ] = lambda: handler

        async def request() -> AsgiResponse:
            messages: list[dict[str, object]] = []
            request_received = False

            async def receive() -> dict[str, object]:
                nonlocal request_received
                if request_received:
                    return {"type": "http.disconnect"}
                request_received = True
                return {"type": "http.request", "body": b"", "more_body": False}

            async def send(message: dict[str, object]) -> None:
                messages.append(message)

            raw_path = quote(path, safe="/%").encode("ascii")
            await self.app(
                {
                    "type": "http",
                    "asgi": {"version": "3.0"},
                    "http_version": "1.1",
                    "method": "GET",
                    "scheme": "http",
                    "path": path,
                    "raw_path": raw_path,
                    "query_string": b"",
                    "root_path": "",
                    "headers": [(b"host", b"testserver")],
                    "client": ("testclient", 50000),
                    "server": ("testserver", 80),
                },
                receive,
                send,
            )

            response_start = next(
                message
                for message in messages
                if message["type"] == "http.response.start"
            )
            body = b"".join(
                message.get("body", b"")
                for message in messages
                if message["type"] == "http.response.body"
            )
            return AsgiResponse(status_code=int(response_start["status"]), body=body)

        return asyncio.run(request())

    def test_returns_only_approved_fields_and_preserves_raw_number(self) -> None:
        raw_number = " \tทะเบียน-๐๑ / A\n "
        handler = StubExistingVehicleHandler(
            ExistingVehicleDetails(
                local_vehicle_id=7,
                original_vehicle_number=raw_number,
            )
        )

        response = self._request_with(handler, "/api/vehicles/7")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "local_vehicle_id": 7,
                "original_vehicle_number": raw_number,
            },
        )
        self.assertEqual(
            handler.received_query,
            GetExistingVehicleByLocalIdentityQuery(local_vehicle_id=7),
        )

    def test_accepts_leading_zeros_as_the_same_integer_identity(self) -> None:
        handler = StubExistingVehicleHandler(ExistingVehicleDetails(7, "VH-007"))

        response = self._request_with(handler, "/api/vehicles/007")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(handler.received_query.local_vehicle_id, 7)

    def test_maps_missing_vehicle_to_404(self) -> None:
        handler = StubExistingVehicleHandler(VehicleNotFoundError(11))

        response = self._request_with(handler, "/api/vehicles/11")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.json(),
            {
                "detail": {
                    "code": "VEHICLE_NOT_FOUND",
                    "message": "Vehicle was not found.",
                    "retryable": False,
                }
            },
        )

    def test_maps_read_unavailable_to_503(self) -> None:
        handler = StubExistingVehicleHandler(
            VehicleReadUnavailableError("database details must not escape")
        )

        response = self._request_with(handler, "/api/vehicles/11")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json(),
            {
                "detail": {
                    "code": "DEPENDENCY_UNAVAILABLE",
                    "message": "The Vehicle read dependency is unavailable.",
                    "retryable": True,
                }
            },
        )
        self.assertNotIn("database", response.text.lower())

    def test_invalid_path_input_returns_400_without_invoking_handler(self) -> None:
        invalid_values = (
            "0",
            "-1",
            "+1",
            "1.0",
            "true",
            "abc",
            "๑",
            " ",
            "9" * 5000,
        )

        for invalid_value in invalid_values:
            with self.subTest(invalid_value=invalid_value):
                handler = StubExistingVehicleHandler(
                    ExistingVehicleDetails(1, "VH-001")
                )
                response = self._request_with(
                    handler, f"/api/vehicles/{invalid_value}"
                )

                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    response.json(),
                    {
                        "detail": {
                            "code": "INVALID_REQUEST",
                            "message": "local_vehicle_id must be a positive integer.",
                            "details": [
                                {
                                    "field": "local_vehicle_id",
                                    "reason": "must_be_positive_integer",
                                }
                            ],
                            "retryable": False,
                        }
                    },
                )
                self.assertIsNone(handler.received_query)

    def test_dependency_override_does_not_load_composition_or_infrastructure(
        self,
    ) -> None:
        self.assertNotIn("composition", vars(vehicle_read_presentation))
        handler = StubExistingVehicleHandler(ExistingVehicleDetails(7, "VH-007"))
        original_import = builtins.__import__

        def reject_outward_imports(name: str, *args: object, **kwargs: object) -> object:
            if name == "composition" or name.startswith("app.infrastructure"):
                raise AssertionError(f"Unexpected outward import: {name}")
            return original_import(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=reject_outward_imports):
            response = self._request_with(handler, "/api/vehicles/7")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(handler.received_query.local_vehicle_id, 7)

    def test_openapi_documents_the_complete_vehicle_read_contract(self) -> None:
        document = self.app.openapi()

        operation = document["paths"]["/api/vehicles/{local_vehicle_id}"]["get"]
        self.assertNotIn("requestBody", operation)
        self.assertEqual(len(operation["parameters"]), 1)
        path_parameter = operation["parameters"][0]
        self.assertEqual(path_parameter["name"], "local_vehicle_id")
        self.assertEqual(path_parameter["in"], "path")
        self.assertIs(path_parameter["required"], True)
        self.assertEqual(path_parameter["schema"]["type"], "string")

        response_schema = operation["responses"]["200"]["content"][
            "application/json"
        ]["schema"]
        schema_name = response_schema["$ref"].rsplit("/", 1)[-1]
        response_properties = document["components"]["schemas"][schema_name][
            "properties"
        ]

        self.assertEqual(
            set(response_properties),
            {"local_vehicle_id", "original_vehicle_number"},
        )

        expected_error_schemas = {
            "400": (
                "InvalidRequestResponse",
                {"code", "message", "details", "retryable"},
            ),
            "404": (
                "VehicleNotFoundResponse",
                {"code", "message", "retryable"},
            ),
            "503": (
                "DependencyUnavailableResponse",
                {"code", "message", "retryable"},
            ),
        }
        for status_code, (
            expected_schema_name,
            expected_detail_properties,
        ) in expected_error_schemas.items():
            with self.subTest(status_code=status_code):
                error_schema = operation["responses"][status_code]["content"][
                    "application/json"
                ]["schema"]
                self.assertEqual(
                    error_schema["$ref"],
                    f"#/components/schemas/{expected_schema_name}",
                )
                self.assertEqual(
                    set(
                        document["components"]["schemas"][expected_schema_name][
                            "properties"
                        ]
                    ),
                    {"detail"},
                )
                detail_reference = document["components"]["schemas"][
                    expected_schema_name
                ]["properties"]["detail"]["$ref"]
                detail_schema_name = detail_reference.rsplit("/", 1)[-1]
                self.assertEqual(
                    set(
                        document["components"]["schemas"][detail_schema_name][
                            "properties"
                        ]
                    ),
                    expected_detail_properties,
                )

        self.assertIn("422", operation["responses"])


if __name__ == "__main__":
    unittest.main()
