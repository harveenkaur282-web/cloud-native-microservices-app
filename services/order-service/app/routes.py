
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, OrderItem
from app.schemas import OrderCreate, OrderResponse
from app.services.product_client import get_product

router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"]
)



@router.post(
    "/",
    response_model=OrderResponse
)
def create_order(
    order:OrderCreate,
    db:Session=Depends(get_db)
):


    total = 0


    order_items=[]


    for item in order.items:

        product = get_product(item.product_id)


        if not product:
            raise HTTPException(
            status_code=404,
            detail=f"Product {item.product_id} not found"
            )


        price = product["price"]


        total += float(price) * item.quantity


        order_items.append(
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=price
            )
        )


    new_order = Order(

        user_id=order.user_id,

        total_amount=total,

        items=order_items
    )


    db.add(new_order)

    db.commit()

    db.refresh(new_order)


    return new_order




@router.get(
    "/",
    response_model=list[OrderResponse]
)
def get_orders(
    db:Session=Depends(get_db)
):

    return db.query(Order).all()



@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def get_order(
    order_id:int,
    db:Session=Depends(get_db)
):

    order = db.query(Order)\
        .filter(Order.id==order_id)\
        .first()


    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )


    return order