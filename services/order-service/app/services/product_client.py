import os
import httpx

from dotenv import load_dotenv

load_dotenv()


PRODUCT_SERVICE_URL = os.getenv(
    "PRODUCT_SERVICE_URL"
)


def get_product(product_id:int):

    response = httpx.get(
        f"{PRODUCT_SERVICE_URL}/api/v1/products/{product_id}"
    )


    if response.status_code != 200:
        return None


    return response.json()