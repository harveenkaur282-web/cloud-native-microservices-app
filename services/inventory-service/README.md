# FastAPI Inventory Reservation Service

The Inventory Service tracks product stock, handles stock replenishments, and locks item quantities during the checkout order reservation phase.

---

## 🛠️ Tech Stack Features

* **Framework**: FastAPI, SQLAlchemy, Uvicorn.
* **Concurrency Protection**: Implements basic database row checks during volume reservation transactions to prevent double-booking issues.
* **Database**: Dedicated database schemas running on PostgreSQL.

---

## ⚙️ Configuration Variables

* `DATABASE_URL`: Connection string to dedicated database instance `cloudcart_inventory`.

---

## 🚀 Local Development (Docker-less)

To run the Inventory Service locally:

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
   export DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cloudcart_inventory"
   uvicorn app.main:app --host 0.0.0.0 --port 8004
   ```
