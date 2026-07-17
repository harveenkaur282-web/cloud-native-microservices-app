from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict
from app.models import OrderStatus

class OrderItemCreate(BaseModel):

    product_id:int
    quantity:int



class OrderCreate(BaseModel):

    # DEVELOPMENT FALLBACK ONLY: This field is only for local Swagger testing
    # and must be removed before production deployment in favor of the X-User-ID header.
    user_id: int | None = None
    items: list[OrderItemCreate]



class OrderItemResponse(BaseModel):

    id:int
    product_id:int
    quantity:int

    model_config = ConfigDict(
        from_attributes=True
    )



class OrderResponse(BaseModel):

    id:int
    user_id:int
    total_amount:Decimal
    status:str
    created_at:datetime

    items:list[OrderItemResponse]


    model_config = ConfigDict(
        from_attributes=True
    )



class OrderStatusUpdate(BaseModel):

    status: OrderStatus