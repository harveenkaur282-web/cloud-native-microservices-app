from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, OrderItem
from app.schemas import OrderCreate, OrderResponse

from app.services.product_client import get_product
from app.services.inventory_client import reserve_stock


router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"]
)


@router.post(
    "/",
    response_model=OrderResponse
)
def create_order(
    order: OrderCreate,
    x_user_id: int | None = Header(None, alias="X-User-ID"),
    db: Session = Depends(get_db)
):

    # 1. Resolve user ID from X-User-ID header or fallback to request body user_id
    user_id = x_user_id
    if user_id is None:
        # DEVELOPMENT FALLBACK ONLY: This allows testing via Swagger UI.
        # It must be removed before production deployment to prevent identity spoofing.
        user_id = order.user_id

    if user_id is None:
        raise HTTPException(
            status_code=400,
            detail="User identity is missing. Provide X-User-ID header."
        )

    total = 0
    order_items = []


    try:

        for item in order.items:

            # 1. Get product details
            product = get_product(
                item.product_id
            )


            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {item.product_id} not found"
                )


            price = float(product["price"])


            # 2. Reserve inventory
            try:

                reserve_stock(
                    product_id=item.product_id,
                    quantity=item.quantity
                )


            except Exception as exc:

                raise HTTPException(
                    status_code=400,
                    detail=f"Inventory error: {str(exc)}"
                )


            # 3. Calculate total

            total += price * item.quantity


            # 4. Create order item

            order_items.append(
                OrderItem(
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price_at_purchase=price
                )
            )


        # 5. Create order

        new_order = Order(

            user_id=user_id,

            total_amount=total,

            items=order_items

        )


        db.add(new_order)

        db.commit()

        db.refresh(new_order)


        return new_order



    except HTTPException:

        db.rollback()
        raise


    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not create order: {str(exc)}"
        )



@router.get(
    "/",
    response_model=list[OrderResponse]
)
def get_orders(
    db: Session = Depends(get_db)
):

    return db.query(Order).all()



@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )


    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )


    return order