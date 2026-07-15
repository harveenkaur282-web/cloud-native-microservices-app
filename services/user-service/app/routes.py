from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import UserCreate
from app.database import get_db
from app.models import User
from app.security import get_password_hash
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)


@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
    username= user.username,
    full_name=user.full_name,
    email=user.email,
    password_hash =get_password_hash(user.password),
    phone_number=user.phone_number,
    address=user.address
)
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
        return {
            "username": new_user.username,
            "email": new_user.email
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists"
        )
