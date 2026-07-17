import os
import httpx
from dotenv import load_dotenv

load_dotenv()

INVENTORY_SERVICE_URL = os.getenv(
    "INVENTORY_SERVICE_URL",
    "http://localhost:8004"
)


def create_inventory_record(product_id: int, available_quantity: int = 0) -> dict | None:
    """
    Calls the Inventory Service to create a stock record for a newly created product.

    This is a synchronous REST call. In the future, this should be replaced
    by an event-driven approach (e.g., ProductCreated event via a message broker).
    """
    url = f"{INVENTORY_SERVICE_URL}/api/v1/inventory/"

    try:
        response = httpx.post(
            url,
            json={
                "product_id": product_id,
                "available_quantity": available_quantity
            },
            timeout=5.0
        )

        if response.status_code in (200, 201):
            return response.json()

        return None

    except Exception as e:
        print("Inventory Service Error:", e)
        return None