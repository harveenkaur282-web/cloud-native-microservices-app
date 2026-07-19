# FastAPI Order Processing Service

The Order Service handles the transaction purchase workflows, tracking order states (Pending, Confirmed, Shipped) and validating transactions against the product inventory reserves.

---

## Tech Stack Features

* **Framework**: FastAPI, SQLAlchemy, Uvicorn.
* **Integrations**: Checks catalog prices dynamically by calling the Product Service, and reserves warehouse quantities by calling the Inventory Service.
* **Database**: Dedicated database schemas running on PostgreSQL.

---

## Configuration Variables

* `DATABASE_URL`: Connection string to dedicated database instance `cloudcart_orders`.
* `PRODUCT_SERVICE_URL`: Inter-service URL to talk to Product Service (defaults to `http://product-service:8002` in Kubernetes).
* `INVENTORY_SERVICE_URL`: Inter-service URL to talk to Inventory Service (defaults to `http://inventory-service:8004` in Kubernetes).

---

## Local Development (Docker-less)

> **Important**: This service requires its own isolated virtual environment created within this directory. Do not share a single virtual environment across different microservices.

To run the Order Service locally:

1. **Activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run local server**:
   ```bash
    export DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cloudcart_orders"
   export PRODUCT_SERVICE_URL="http://localhost:8002"
   export INVENTORY_SERVICE_URL="http://localhost:8004"
   uvicorn app.main:app --host 0.0.0.0 --port 8003
   ```
