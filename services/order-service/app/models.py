from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Integer,
    String,
    DateTime,
    Numeric,
    ForeignKey,
    Enum as SQLEnum
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base



class OrderStatus(str, Enum):

    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PAID = "PAID"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"



class Order(Base):

    __tablename__ = "orders"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )


    total_amount: Mapped[float] = mapped_column(
        Numeric(10,2),
        nullable=False
    )


    status: Mapped[OrderStatus] = mapped_column(
        SQLEnum(OrderStatus),
        default=OrderStatus.PENDING
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete"
    )



class OrderItem(Base):

    __tablename__="order_items"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )


    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id")
    )


    product_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )


    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )


    price_at_purchase: Mapped[float] = mapped_column(
        Numeric(10,2),
        nullable=False
    )


    order = relationship(
        "Order",
        back_populates="items"
    )