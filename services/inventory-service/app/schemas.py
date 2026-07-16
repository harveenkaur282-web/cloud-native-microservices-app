from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class InventoryCreate(BaseModel):

    product_id: int
    available_quantity: int = Field(default=0)



class InventoryResponse(BaseModel):

    id: int
    product_id: int
    available_quantity: int
    reserved_quantity: int
    created_at: datetime
    updated_at: datetime


    model_config = ConfigDict(
        from_attributes=True
    )