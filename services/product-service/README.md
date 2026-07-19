# FastAPI Product Catalog Service

The Product Service manages items, product pricing, details, and updates the catalog listings. When a product is created, this service communicates with the **Inventory Service** internally to register starting warehouses stock levels.

---

## Tech Stack Features

* **Framework**: FastAPI, SQLAlchemy, Uvicorn.
* **Integrations**: Makes downstream API client calls to `http://inventory-service:8004` to create stock logs on catalog updates.
* **Database**: Dedicated table schemas running on PostgreSQL.

---

## Configuration Variables

* `DATABASE_URL`: Connection string to dedicated database instance `cloudcart_products`.
* `INVENTORY_SERVICE_URL`: Inter-service URL to talk to Inventory Service (defaults to `http://inventory-service:8004` in Kubernetes).

---

## Local Development (Docker-less)

To run the Product Service locally:

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
   export DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cloudcart_products"
   export INVENTORY_SERVICE_URL="http://localhost:8004"
   uvicorn app.main:app --host 0.0.0.0 --port 8002
   ```
