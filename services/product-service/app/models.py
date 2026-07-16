
from enum import Enum

from sqlalchemy import Column, Integer, String, DateTime, Boolean, text, Float, DECIMAL, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Enum as SQLEnum
from app.enums import ProductStatus



class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    price: Mapped[Numeric] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    status: Mapped[ProductStatus] = mapped_column(
        SQLEnum(ProductStatus),
        default=ProductStatus.DRAFT,
        nullable=False
    )

    product_metadata: Mapped[dict | None] = mapped_column(
    JSONB,
    nullable=True
    )


