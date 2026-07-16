import httpx
import os

INVENTORY_SERVICE_URL = os.getenv(
    "INVENTORY_SERVICE_URL"
)


def reserve_stock(product_id: int, quantity: int):

    url = (
        f"{INVENTORY_SERVICE_URL}"
        f"/api/v1/inventory/{product_id}/reserve"
    )

    response = httpx.put(
        url,
        params={
            "quantity": quantity
        }
    )


    if response.status_code != 200:
        raise Exception(
            response.json().get(
                "detail",
                "Inventory reservation failed"
            )
        )


    return response.json()