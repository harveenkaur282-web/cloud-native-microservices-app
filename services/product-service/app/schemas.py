from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.enums import ProductStatus


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: str | None = None
    price: Decimal
    category: str = Field(..., min_length=1)
    product_metadata: dict | None = None
    image_url: str | None = None
    # Initial stock quantity — forwarded to Inventory Service on product creation.
    # Not stored in the Product model.
    initial_quantity: int = Field(default=0, ge=0)

    @field_validator("name", "category")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("value cannot be empty")
        return cleaned

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("price")
    @classmethod
    def validate_price(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("Price must be greater than zero")
        return value


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    category: str | None = None
    status: ProductStatus | None = None
    product_metadata: dict | None = None
    image_url: str | None = None

    @field_validator("name", "category")
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("value cannot be empty")
        return cleaned

    @field_validator("description")
    @classmethod
    def validate_optional_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("price")
    @classmethod
    def validate_optional_price(cls, value: Decimal | None) -> Decimal | None:
        if value is None:
            return None
        if value <= 0:
            raise ValueError("Price must be greater than zero")
        return value


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: Decimal
    category: str
    status: ProductStatus
    created_at: datetime
    updated_at: datetime
    product_metadata: dict | None
    image_url: str | None

    model_config = ConfigDict(from_attributes=True)
