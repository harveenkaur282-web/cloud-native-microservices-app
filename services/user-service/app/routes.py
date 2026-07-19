from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.schemas import UserCreate, LoginRequest, UserResponse, UserUpdate
from app.database import get_db
from app.models import User
from app.security import get_password_hash, verify_password, create_access_token, verify_access_token
from sqlalchemy.exc import IntegrityError
router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)


security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
        
    try:
        token = credentials.credentials
        payload = verify_access_token(token)
        username = payload.get("sub")
        if not username:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise credentials_exception
        
    return user


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
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig)
        if "phone_number" in error_msg:
            detail = "Phone number already registered"
        elif "email" in error_msg:
            detail = "Email address already registered"
        elif "username" in error_msg:
            detail = "Username already exists"
        else:
            detail = "Username, email, or phone number already exists"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
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


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)

    if "phone_number" in update_data and update_data["phone_number"] != current_user.phone_number:
        existing_phone = db.query(User).filter(User.phone_number == update_data["phone_number"]).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number already in use"
            )

    for key, value in update_data.items():
        setattr(current_user, key, value)

    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict updating user profile details"
        )

