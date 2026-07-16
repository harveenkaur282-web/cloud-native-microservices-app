from enum import Enum


class ProductStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    OUT_OF_STOCK = "OUT_OF_STOCK"