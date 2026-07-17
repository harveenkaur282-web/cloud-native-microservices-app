from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas import ProductCreate, ProductUpdate, ProductResponse

from app.models import Product, ProductStatus
from app.database import get_db
from app.inventory_client import create_inventory_record

router = APIRouter(
    prefix="/api/v1/products",
    tags=["Products"]
)


@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
        image_url=product.image_url,
        status=ProductStatus.DRAFT,
        product_metadata=product.product_metadata
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Trigger inventory record creation in the Inventory Service.
    # This is a synchronous REST call for now.
    # Future improvement: replace with a ProductCreated event via message broker.
    inventory_result = create_inventory_record(
        product_id=new_product.id,
        available_quantity=product.initial_quantity
    )

    if inventory_result is None:
        print("Inventory record could not be created.")

    return new_product


@router.get("/", response_model=list[ProductResponse])
def list_products(
    category: str | None = Query(None, description="Filter products by category"),
    search: str | None = Query(None, description="Search products by name (case-insensitive)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.status != ProductStatus.ARCHIVED)

    if category:
        query = query.filter(Product.category.ilike(category))

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product_update.model_dump(exclude_unset=True).items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def archive_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.status = ProductStatus.ARCHIVED

    db.commit()
    db.refresh(product)

    return {
        "message": "Product archived successfully",
        "product_id": product.id,
        "status": product.status
    }