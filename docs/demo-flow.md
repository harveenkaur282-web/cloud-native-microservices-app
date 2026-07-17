# CloudCart — Demo Flow Guide

This document traces the complete end-to-end demo journey through the CloudCart frontend, demonstrating how it integrates with the cloud-native microservices backend.

---

## Prerequisites

Before starting the demo, ensure all services are running:

| Service | Command | Port |
|---|---|---|
| User Service | `uvicorn app.main:app --port 8001 --reload` | 8001 |
| Product Service | `uvicorn app.main:app --port 8002 --reload` | 8002 |
| Order Service | `uvicorn app.main:app --port 8003 --reload` | 8003 |
| Inventory Service | `uvicorn app.main:app --port 8004 --reload` | 8004 |
| API Gateway | `uvicorn app.main:app --port 8000 --reload` | 8000 |
| Frontend | `npm run dev` (in `frontend/`) | 3000 |

Seed some test data using the Swagger UIs at each service's `/docs` endpoint, or use `curl` / Postman to create products, inventory records, and orders.

---

## Step 1: Authentication — Register & Login

1. Open `http://localhost:3000` in your browser.
2. You are automatically redirected to `/login` (dashboard routes are protected).
3. Click **"create a new account"** to navigate to `/register`.
4. Fill in the registration form:
   - **Username**: `demo_user`
   - **Full Name**: `Demo User`
   - **Email**: `demo@cloudcart.io`
   - **Phone Number**: `+1 555-012-3456`
   - **Address**: `123 Cloud Avenue, San Francisco, CA 94105`
   - **Password**: `SecurePass123`
5. Click **Create Account**. On success, you're redirected to `/login`.
6. Log in with `demo_user` / `SecurePass123`.
7. Verify the JWT token is stored and the dashboard loads.

**What to verify:**
- Registration calls `POST /users/register` through the Gateway.
- Login calls `POST /users/login` and stores the JWT token.
- Refreshing the browser restores the session via `GET /users/me`.

---

## Step 2: Dashboard — Service Health Monitoring

1. After login, you land on `/dashboard`.
2. The dashboard queries health endpoints for each microservice:
   - API Gateway (`/health`)
   - User, Product, Inventory, Order Services
3. Each service displays an **ONLINE** (green) or **OFFLINE** (red) status card.

**What to verify:**
- All four services + gateway show ONLINE status.
- Stopping a service (e.g., Inventory) causes its card to flip to OFFLINE with a red indicator.

---

## Step 3: Product Catalog — Browsing & Filtering

1. Navigate to **Products** in the sidebar.
2. The product grid loads from `GET /products/` through the Gateway.
3. Use the **Search** bar to filter by name (e.g., "laptop").
4. Use the **Category** dropdown to filter by category (e.g., "Electronics").
5. Use **Previous / Next** pagination controls to browse pages.
6. Click any product card to view `/products/[id]`.

**What to verify:**
- Search and category filters update the product grid dynamically.
- Product detail page shows name, description, price, category, status badge, creation date, and metadata JSON.
- No stock/quantity information appears on product pages.

---

## Step 4: Inventory Dashboard — Stock Levels

1. Navigate to **Inventory** in the sidebar.
2. The page first fetches all products from the Product Service, then queries `GET /inventory/{product_id}` for each product.
3. The table displays:
   - Product ID and Name (resolved from Product Service)
   - Available Quantity (stock ready for orders)
   - Reserved Quantity (stock locked for active orders)
   - Last Updated timestamp
4. Products with available stock ≤ 5 display a **Low Stock** warning badge.
5. Products with 0 available stock display an **Out of Stock** danger badge.

**What to verify:**
- The info cards explain what Available vs Reserved stock means.
- Low stock indicators appear for items with ≤ 5 available units.
- If the Inventory Service is offline, individual rows show error indicators gracefully.

---

## Step 5: Order Lifecycle — Creating & Advancing Orders

### Viewing Orders
1. Navigate to **Orders** in the sidebar.
2. The orders table loads from `GET /orders/` through the Gateway.
3. Each row shows Order ID, User ID, Status Badge, Item Count, Total Amount, and Created Date.

### Viewing Order Details
4. Click **Details** on any order to open `/orders/[id]`.
5. The detail page displays:
   - A **Fulfillment Timeline** showing the progress through `PENDING → CONFIRMED → PAID → SHIPPED → DELIVERED`.
   - The current stage highlighted in blue, completed stages in green, and future stages in gray.
   - A list of ordered items with resolved product names.
   - An **Order Summary** card with pricing and metadata.

### Advancing Status
6. Click **"Advance to CONFIRMED"** to transition the order.
7. The timeline updates live to reflect the new state.
8. Continue advancing: `CONFIRMED → PAID → SHIPPED → DELIVERED`.

### Cancellation Flow
9. On a PENDING, CONFIRMED, or PAID order, click **"Cancel Order"**.
10. The timeline is replaced with a red cancellation alert card.
11. Try clicking Advance on a DELIVERED or CANCELLED order — no action buttons appear (terminal states).

### Backend Validation
12. If you attempt an invalid transition (e.g., manually sending PENDING → SHIPPED via API), the frontend displays the backend's validation error message.

**What to verify:**
- Status badges use distinct Tailwind design token colors per state.
- The backend is the single source of truth for allowed transitions.
- Invalid transitions display graceful error messages, not crashes.

---

## Step 6: User Profile & Logout

1. Navigate to **Profile** in the sidebar.
2. The profile page shows:
   - Avatar initial, full name, username
   - Email, phone number, account status
   - Delivery address
3. Click **"Sign Out"** to clear the JWT and redirect to `/login`.
4. Try navigating to `/dashboard` directly — you are redirected back to `/login`.

---

## Step 7: Architecture Showcase

1. Navigate to **Architecture** in the sidebar.
2. The topology diagram shows the request flow: Frontend → Gateway → Microservices.
3. Below, two panels clearly separate:
   - **Currently Implemented**: All active services and databases.
   - **Future Roadmap**: JWT middleware enforcement, Kafka, Kubernetes, Prometheus/Grafana.

**What to verify:**
- API Gateway JWT enforcement is listed under Future, not Implemented.
- The topology correctly represents the current architecture.

---

## Known Limitations

1. **No Gateway-level JWT enforcement**: JWT validation only happens inside the User Service. Other services accept unauthenticated requests directly.
2. **No list endpoint for Inventory**: The frontend queries inventory per-product, which is less efficient at scale.
3. **Synchronous inter-service calls**: Order creation calls Product + Inventory Services synchronously (no message broker).
4. **No real payment integration**: The PAID status is set manually, not via a payment processor.
5. **Category list is hardcoded**: The product category filter uses a static list, not a dynamic API endpoint.
6. **No Docker Compose**: Services must be started individually.
