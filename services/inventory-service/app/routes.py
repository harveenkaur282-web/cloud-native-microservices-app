from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Inventory
from app.schemas import InventoryCreate, InventoryResponse


router = APIRouter(
    prefix="/api/v1/inventory",
    tags=["Inventory"]
)


@router.post(
    "/",
    response_model=InventoryResponse
)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db)
):

    # Prevent duplicate inventory records for the same product
    existing = db.query(Inventory)\
        .filter(
            Inventory.product_id == inventory.product_id
        ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Inventory record already exists for product {inventory.product_id}"
        )

    new_inventory = Inventory(
        product_id=inventory.product_id,
        available_quantity=inventory.available_quantity
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory



@router.get(
    "/{product_id}",
    response_model=InventoryResponse
)
def get_inventory(
    product_id: int,
    db: Session = Depends(get_db)
):

    inventory = db.query(Inventory)\
        .filter(
            Inventory.product_id == product_id
        ).first()


    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )


    return inventory



@router.put(
    "/{product_id}/reserve"
)
def reserve_stock(
    product_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):

    inventory = db.query(Inventory)\
        .filter(
            Inventory.product_id == product_id
        ).first()


    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )


    if inventory.available_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail="Not enough stock"
        )


    inventory.available_quantity -= quantity
    inventory.reserved_quantity += quantity


    db.commit()


    return {
        "message": "Stock reserved",
        "product_id": product_id,
        "remaining_stock": inventory.available_quantity
    }


@router.put(
    "/{product_id}/release"
)
def release_stock(
    product_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    """
    Release previously reserved stock back to available inventory.
    Used when an order is cancelled or a payment fails.
    """

    inventory = db.query(Inventory)\
        .filter(
            Inventory.product_id == product_id
        ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    if inventory.reserved_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail="Cannot release more than reserved quantity"
        )

    inventory.reserved_quantity -= quantity
    inventory.available_quantity += quantity

    db.commit()

    return {
        "message": "Stock released",
        "product_id": product_id,
        "available_stock": inventory.available_quantity,
        "reserved_stock": inventory.reserved_quantity
    }