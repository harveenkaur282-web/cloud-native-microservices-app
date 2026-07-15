from pwdlib import PasswordHash

password_handler = PasswordHash.recommended()

def get_password_hash(plain_password: str) -> str:
    return password_handler.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_handler.verify(plain_password, hashed_password)