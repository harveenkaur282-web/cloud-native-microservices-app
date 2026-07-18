from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, OrderItem, OrderStatus
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate, OrderPaymentRequest


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
            status=OrderStatus.PENDING,
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


# Allowed status transitions in production order lifecycle:
# PENDING -> CONFIRMED -> PAID -> SHIPPED -> DELIVERED
# Cancellations (CANCELLED) are allowed from PENDING, CONFIRMED, or PAID.
# Terminal states (DELIVERED, CANCELLED) cannot transition further.
ALLOWED_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.CONFIRMED, OrderStatus.CANCELLED},
    OrderStatus.CONFIRMED: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}


@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse
)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    # 1. Fetch order
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

    # 2. Validate that the provided status is a valid OrderStatus enum value
    try:
        target_status = OrderStatus(status_update.status.upper())
    except ValueError:
        allowed_values = [s.value for s in OrderStatus]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status: '{status_update.status}'. Allowed values are: {allowed_values}"
        )

    # 3. Validate transition from current order status to target status
    current_status = order.status
    allowed_next_states = ALLOWED_TRANSITIONS.get(current_status, set())

    # We allow transitioning to the same status as a no-op
    if target_status != current_status and target_status not in allowed_next_states:
        raise HTTPException(
            status_code=400,
            detail=f"Transition from {current_status.value} to {target_status.value} is not allowed."
        )

    # 4. Handle cancellation preparation documentation
    if target_status == OrderStatus.CANCELLED:
        # DOCUMENTATION: Inventory Reservation Release Preparation
        # In a complete production scenario, when an order is cancelled, we must release
        # the reserved stock back to available inventory.
        # This should be implemented by calling the Inventory Service's release endpoint:
        #
        #   PUT /api/v1/inventory/{product_id}/release?quantity={quantity}
        #
        # For each item in the cancelled order (order.items), we would execute:
        #   from app.services.inventory_client import release_stock
        #   for item in order.items:
        #       release_stock(product_id=item.product_id, quantity=item.quantity)
        #
        # Currently, this is documented per assignment requirements without live implementation.
        pass

    # 5. Update order status and commit
    order.status = target_status
    db.commit()
    db.refresh(order)

    return order


@router.post(
    "/{order_id}/pay",
    response_model=OrderResponse
)
def pay_order(
    order_id: int,
    payment_request: OrderPaymentRequest,
    db: Session = Depends(get_db)
):
    # 1. Fetch order
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

    # 2. Reject transitions for terminal states
    if order.status in {OrderStatus.DELIVERED, OrderStatus.CANCELLED}:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot pay for order in terminal state: {order.status.value}"
        )

    # 3. Simulate processing mock transaction logs
    print(f"[Payment Interface] Received simulation charge ({payment_request.payment_method}) for Order #{order.id} totaling ${order.total_amount}")

    # 4. Advance status directly to PAID (bypassing CONFIRMED or moving through it)
    order.status = OrderStatus.PAID
    db.commit()
    db.refresh(order)

    return order