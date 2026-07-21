"""Expose the approved existing-Vehicle read application slice over HTTP."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.application.get_existing_vehicle import (
    GetExistingVehicleByLocalIdentityHandler,
    GetExistingVehicleByLocalIdentityQuery,
    VehicleNotFoundError,
    VehicleReadUnavailableError,
)


router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


class ExistingVehicleResponse(BaseModel):
    """Return only the fields approved by the Vehicle read application contract."""

    local_vehicle_id: int
    original_vehicle_number: str


class InvalidRequestFieldDetail(BaseModel):
    """Document the approved invalid local-identity validation detail."""

    field: Literal["local_vehicle_id"]
    reason: Literal["must_be_positive_integer"]


class InvalidRequestDetail(BaseModel):
    """Document the existing INVALID_REQUEST payload without changing it."""

    code: Literal["INVALID_REQUEST"]
    message: Literal["local_vehicle_id must be a positive integer."]
    details: list[InvalidRequestFieldDetail]
    retryable: Literal[False]


class InvalidRequestResponse(BaseModel):
    """Represent FastAPI's existing detail wrapper for invalid input."""

    detail: InvalidRequestDetail


class VehicleNotFoundDetail(BaseModel):
    """Document the existing VEHICLE_NOT_FOUND payload."""

    code: Literal["VEHICLE_NOT_FOUND"]
    message: Literal["Vehicle was not found."]
    retryable: Literal[False]


class VehicleNotFoundResponse(BaseModel):
    """Represent FastAPI's existing detail wrapper for a missing Vehicle."""

    detail: VehicleNotFoundDetail


class DependencyUnavailableDetail(BaseModel):
    """Document the existing DEPENDENCY_UNAVAILABLE payload."""

    code: Literal["DEPENDENCY_UNAVAILABLE"]
    message: Literal["The Vehicle read dependency is unavailable."]
    retryable: Literal[True]


class DependencyUnavailableResponse(BaseModel):
    """Represent FastAPI's existing detail wrapper for read unavailability."""

    detail: DependencyUnavailableDetail


def provide_get_existing_vehicle_handler(
) -> GetExistingVehicleByLocalIdentityHandler:
    """Obtain the handler through the approved composition root."""
    import composition

    return composition.build_get_existing_vehicle_by_local_identity_handler()


def _invalid_local_vehicle_id() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "code": "INVALID_REQUEST",
            "message": "local_vehicle_id must be a positive integer.",
            "details": [
                {
                    "field": "local_vehicle_id",
                    "reason": "must_be_positive_integer",
                }
            ],
            "retryable": False,
        },
    )


def _parse_local_vehicle_id(raw_local_vehicle_id: str) -> int:
    """Parse the endpoint-local positive integer transport representation."""
    if not raw_local_vehicle_id.isascii() or not raw_local_vehicle_id.isdecimal():
        raise _invalid_local_vehicle_id()

    try:
        local_vehicle_id = int(raw_local_vehicle_id)
    except ValueError as exc:
        raise _invalid_local_vehicle_id() from exc
    if local_vehicle_id <= 0:
        raise _invalid_local_vehicle_id()
    return local_vehicle_id


@router.get(
    "/{local_vehicle_id}",
    response_model=ExistingVehicleResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": InvalidRequestResponse,
            "description": "The local Vehicle identity is invalid.",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": VehicleNotFoundResponse,
            "description": "The Vehicle was not found.",
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": DependencyUnavailableResponse,
            "description": "The Vehicle read dependency is unavailable.",
        },
    },
)
def get_existing_vehicle(
    local_vehicle_id: str,
    handler: GetExistingVehicleByLocalIdentityHandler = Depends(
        provide_get_existing_vehicle_handler
    ),
) -> ExistingVehicleResponse:
    """Read one existing Vehicle by its PM Assistant-local identity."""
    parsed_local_vehicle_id = _parse_local_vehicle_id(local_vehicle_id)
    try:
        query = GetExistingVehicleByLocalIdentityQuery(parsed_local_vehicle_id)
    except (TypeError, ValueError) as exc:
        raise _invalid_local_vehicle_id() from exc

    try:
        result = handler.execute(query)
    except VehicleNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "VEHICLE_NOT_FOUND",
                "message": "Vehicle was not found.",
                "retryable": False,
            },
        ) from exc
    except VehicleReadUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "DEPENDENCY_UNAVAILABLE",
                "message": "The Vehicle read dependency is unavailable.",
                "retryable": True,
            },
        ) from exc

    return ExistingVehicleResponse(
        local_vehicle_id=result.local_vehicle_id,
        original_vehicle_number=result.original_vehicle_number,
    )
