from fastapi import APIRouter, Request
from fastapi.responses import Response, JSONResponse
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
        "PATCH",
        "DELETE"
    ]
)
async def gateway(
    service: str,
    path: str,
    request: Request
):

    if service not in SERVICE_MAP:

        return JSONResponse(
            status_code=404,
            content={"error": "Service not found"}
        )


    # Build downstream URL while preserving query parameters
    url = f"{SERVICE_MAP[service]}/api/v1/{service}/{path}"
    if request.url.query:
        url = f"{url}?{request.url.query}"


    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=dict(request.headers),
                content=await request.body(),
                timeout=5.0
            )
    except httpx.HTTPError:
        return JSONResponse(
            status_code=503,
            content={"error": "Service unavailable"}
        )


    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers)
    )