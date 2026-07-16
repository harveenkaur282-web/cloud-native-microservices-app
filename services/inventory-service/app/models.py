from datetime import datetime

from sqlalchemy import Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Inventory(Base):

    __tablename__ = "inventory"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )


    product_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=True
    )


    available_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )


    reserved_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
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