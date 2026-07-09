from pydantic import BaseModel, EmailStr
class UserCreate(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone_number: str
    address: str
    password: str