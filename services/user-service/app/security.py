from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
load_dotenv()  
import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
password_handler = PasswordHash.recommended()
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-for-jwt-signing-fallback")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def get_password_hash(plain_password: str) -> str:
    return password_handler.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_handler.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except InvalidTokenError:
        raise ValueError("Invalid token")