# FastAPI User Authentication Service

The User Service handles user registration, credentials validation, password hashing, and issues HS256 JWT access tokens for authorization.

---

## Tech Stack Features

* **Framework**: FastAPI, SQLAlchemy ORM, Uvicorn.
* **Security Hashing**: Cryptographic password salting using `passlib` with `bcrypt`.
* **Token Auth**: Generates tokens using `jose` JWT helper engines.
* **Database**: Exposes routes reading from dedicated PostgreSQL instances.

---

## Configuration Variables

The service reads the following variables from ConfigMaps & Secrets:
* `DATABASE_URL`: Connection string (e.g., `postgresql://postgres:your_password@postgres:5432/cloudcart_users`).
* `SECRET_KEY`: Signature verification key for generating secure JWT signatures.
* `ALGORITHM`: Signature method (e.g., `HS256`).
* `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiration time limit for active sessions (default: `30`).

---

## Local Development (Docker-less)

> **Important**: This service requires its own isolated virtual environment created within this directory. Do not share a single virtual environment across different microservices.

To run the User Service locally:

1. **Activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run local migration / server**:
   ```bash
   export DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cloudcart_users"
   export SECRET_KEY="your_secret_key"
   uvicorn app.main:app --host 0.0.0.0 --port 8001
   ```
