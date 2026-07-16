from fastapi import APIRouter, Request
from fastapi.responses import Response
import httpx
import os


router = APIRouter()


SERVICE_MAP = {

    "users": os.getenv(
        "USER_SERVICE_URL"
    ),

    "products": os.getenv(
        "PRODUCT_SERVICE_URL"
    ),

    "orders": os.getenv(
        "ORDER_SERVICE_URL"
    ),

    "inventory": os.getenv(
        "INVENTORY_SERVICE_URL"
    )
}



@router.api_route(
    "/{service}/{path:path}",
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE"
    ]
)
async def gateway(
    service: str,
    path: str,
    request: Request
):

    if service not in SERVICE_MAP:

        return {
            "error": "Service not found"
        }


    url = (
        f"{SERVICE_MAP[service]}"
        f"/api/v1/{service}/{path}"
    )


    async with httpx.AsyncClient() as client:

        response = await client.request(

            method=request.method,

            url=url,

            headers=dict(request.headers),

            content=await request.body()

        )


    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers)
    )