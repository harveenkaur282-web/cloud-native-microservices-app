from fastapi import APIRouter
from app.schemas import UserCreate

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)


@router.post("/register")
def register_user(user: UserCreate):
    return {
        "username": user.username,
        "email": user.email
    }
