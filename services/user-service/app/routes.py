from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import UserCreate, LoginRequest
from app.database import get_db
from app.models import User
from app.security import get_password_hash, verify_password, create_access_token
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
    
@router.post("/login")
def login_user(login_request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_request.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not verify_password(login_request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            
            detail="Incorrect username or password"
        )
    access_token = create_access_token(data={"sub": user.username})
    token_type = "bearer"
    return {
        "message": "Login successful",
        "username": user.username,
        "access_token": access_token,
        "token_type": token_type,
        "email": user.email
    }
