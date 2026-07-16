from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class OrderItemCreate(BaseModel):

    product_id:int
    quantity:int



class OrderCreate(BaseModel):

    user_id:int
    items:list[OrderItemCreate]



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