# FastAPI API Gateway Service

The API Gateway acts as the single entrypoint and reverse proxy for all backend microservices. Built with FastAPI and leveraging asynchronous requests, it proxies incoming requests to downstream services, isolating the database-connected microservices from the external network.

---

## Tech Stack Features

* **Framework**: FastAPI (Python 3.14) & Uvicorn (ASGI server).
* **HTTP Client**: Asynchronous HTTP request forwarding using `httpx`.
* **Cors Middleware**: Set up to allow dashboard client request handshakes.
* **Probes**: Exposes `/health` path checks for Kubernetes liveness/readiness probes.

---

## Routing Logic Configuration

The gateway retrieves service addresses dynamically on start using environment variables:
* `USER_SERVICE_URL`: Internally routes requests from `/api/v1/users/*` to `http://user-service:8001`.
* `PRODUCT_SERVICE_URL`: Internally routes requests from `/api/v1/products/*` to `http://product-service:8002`.
* `ORDER_SERVICE_URL`: Internally routes requests from `/api/v1/orders/*` to `http://order-service:8003`.
* `INVENTORY_SERVICE_URL`: Internally routes requests from `/api/v1/inventory/*` to `http://inventory-service:8004`.

---

## Local Development (Docker-less)

> **Important**: This service requires its own isolated virtual environment created within this directory. Do not share a single virtual environment across different microservices.

To run the API Gateway locally without Docker:

1. **Activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Set env variables & Run**:
   ```bash
   export USER_SERVICE_URL=http://localhost:8001
   export PRODUCT_SERVICE_URL=http://localhost:8002
   export ORDER_SERVICE_URL=http://localhost:8003
   export INVENTORY_SERVICE_URL=http://localhost:8004
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
