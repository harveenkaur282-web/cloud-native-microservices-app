from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class UserCreate(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone_number: str
    address: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    phone_number: str
    address: str
    is_active: bool

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, description="Full name of the user, cannot be empty")
    phone_number: str | None = Field(default=None, description="Phone number of the user")
    address: str | None = Field(default=None, description="Address of the user")

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Phone number cannot be empty")
            if not re.match(r"^\+?[\d\s\-()]{7,20}$", cleaned):
                raise ValueError("Invalid phone number format")
            return cleaned
        return v