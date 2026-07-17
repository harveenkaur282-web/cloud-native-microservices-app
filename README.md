# CloudCart — Cloud-Native Microservices E-Commerce Platform

A production-style, cloud-native e-commerce application built with independently deployable microservices, a centralized API Gateway, and a modern Next.js management dashboard.

---

## Architecture Overview

```
┌────────────────────┐
│   Next.js Frontend │  Port 3000
│   (App Router)     │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   FastAPI Gateway   │  Port 8000
│   (Reverse Proxy)   │
└────────┬───────────┘
         │
    ┌────┼────┬────────────┐
    ▼    ▼    ▼            ▼
┌──────┐┌──────┐┌────────┐┌───────────┐
│ User ││ Prod ││ Order  ││ Inventory │
│ Svc  ││ Svc  ││ Svc    ││ Svc       │
│ 8001 ││ 8002 ││ 8003   ││ 8004      │
└──┬───┘└──┬───┘└──┬─────┘└──┬────────┘
   │       │       │         │
   ▼       ▼       ▼         ▼
┌──────┐┌──────┐┌──────┐┌──────┐
│ PG   ││ PG   ││ PG   ││ PG   │
│ DB   ││ DB   ││ DB   ││ DB   │
└──────┘└──────┘└──────┘└──────┘
```

The frontend communicates **exclusively** through the API Gateway (port 8000). The Gateway forwards requests to downstream microservices based on the URL path prefix:

| Frontend Request Path | Downstream Service | Downstream URL |
|---|---|---|
| `/users/*` | User Service | `http://localhost:8001/api/v1/users/*` |
| `/products/*` | Product Service | `http://localhost:8002/api/v1/products/*` |
| `/orders/*` | Order Service | `http://localhost:8003/api/v1/orders/*` |
| `/inventory/*` | Inventory Service | `http://localhost:8004/api/v1/inventory/*` |

---

## Microservices

### User Service (Port 8001)
- **Framework**: FastAPI + SQLAlchemy + PostgreSQL
- **Responsibilities**: User registration, login (username/password), JWT token generation (HS256), user profile retrieval and updates.
- **Auth Flow**: Issues JWT access tokens on login. The `sub` claim contains the username.

### Product Service (Port 8002)
- **Framework**: FastAPI + SQLAlchemy + PostgreSQL
- **Responsibilities**: Product CRUD (create, list, get, update, archive). Supports filtering by `category`, `search`, and `page`/`limit` pagination. On product creation, calls Inventory Service to initialize stock.

### Order Service (Port 8003)
- **Framework**: FastAPI + SQLAlchemy + PostgreSQL
- **Responsibilities**: Order creation (validates products via Product Service, reserves stock via Inventory Service), order listing, order details, and status lifecycle transitions via PATCH.
- **Status Lifecycle**: `PENDING` → `CONFIRMED` → `PAID` → `SHIPPED` → `DELIVERED` (or `CANCELLED` from PENDING/CONFIRMED/PAID).

### Inventory Service (Port 8004)
- **Framework**: FastAPI + SQLAlchemy + PostgreSQL
- **Responsibilities**: Stock tracking per product. Maintains `available_quantity` and `reserved_quantity`. Supports stock reservation (for orders) and release (for cancellations).

### API Gateway (Port 8000)
- **Framework**: FastAPI + httpx
- **Responsibilities**: Reverse proxy routing. Forwards all methods (GET, POST, PUT, PATCH, DELETE) to downstream services. Preserves query parameters and request headers.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| UI Components | shadcn/ui, Lucide React icons |
| HTTP Client | Axios (with JWT interceptor) |
| Backend Services | Python, FastAPI, SQLAlchemy ORM |
| Databases | PostgreSQL (one per service) |
| Authentication | JWT (HS256) via User Service |
| API Gateway | FastAPI reverse proxy with httpx |

---

## Service Ports

| Service | Port | Purpose |
|---|---|---|
| Frontend | 3000 | Next.js development server |
| API Gateway | 8000 | Reverse proxy / request router |
| User Service | 8001 | Authentication & user profiles |
| Product Service | 8002 | Product catalog management |
| Order Service | 8003 | Order lifecycle management |
| Inventory Service | 8004 | Warehouse stock tracking |

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (4 databases, one per service)

### 1. Backend Services

Each service lives in `services/<service-name>/`. For each service:

```bash
cd services/user-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Repeat for `product-service` (port 8002), `order-service` (port 8003), `inventory-service` (port 8004), and `api-gateway` (port 8000).

> Configure each service's `.env` file with the correct `DATABASE_URL` and inter-service URLs.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and communicates through the Gateway at `http://localhost:8000`.

---

## Implemented Features

- ✅ JWT-based authentication (register, login, session restoration, logout)
- ✅ Protected dashboard routes with client-side route guards
- ✅ Live microservice health monitoring dashboard
- ✅ Product catalog browsing with search, category filters, and pagination
- ✅ Product detail viewer with metadata JSON explorer
- ✅ Warehouse inventory dashboard combining Product + Inventory Service data
- ✅ Low stock warning indicators (≤ 5 units)
- ✅ Customer order listing with color-coded status badges
- ✅ Order detail viewer with visual lifecycle timeline
- ✅ Order status transition controls (Advance / Cancel) with backend validation
- ✅ Cloud architecture topology showcase page
- ✅ Subtle page transition animations (Framer Motion)
- ✅ Responsive layouts (desktop + mobile)
- ✅ Skeleton loaders, error boundaries, and empty state illustrations

## Future Roadmap

- 🚧 API Gateway JWT enforcement middleware
- 🚧 Kafka event-driven communication between services
- 🚧 Kubernetes deployment manifests
- 🚧 Prometheus / Grafana monitoring stack
- 🚧 Docker Compose orchestration
- 🚧 End-to-end integration tests

---

## Project Structure

```
cloud-native-microservices-app/
├── frontend/                    # Next.js 16 App Router client
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/     # Protected route group
│       │   │   ├── dashboard/   # Health monitoring
│       │   │   ├── products/    # Catalog + [id] detail
│       │   │   ├── inventory/   # Stock levels table
│       │   │   ├── orders/      # Orders + [id] lifecycle
│       │   │   ├── architecture/# System topology
│       │   │   └── profile/     # User profile + logout
│       │   ├── login/           # Authentication
│       │   └── register/        # User registration
│       ├── components/layout/   # Sidebar, Navbar, PageContainer, AnimatedPage
│       ├── hooks/               # useAuth (AuthProvider + context)
│       ├── services/            # Axios API client + interceptors
│       └── types/               # TypeScript interfaces
├── services/
│   ├── api-gateway/             # FastAPI reverse proxy
│   ├── user-service/            # Auth + user management
│   ├── product-service/         # Product catalog
│   ├── order-service/           # Order lifecycle
│   └── inventory-service/       # Stock tracking
├── databases/                   # Database configurations
├── kubernetes/                  # Future K8s manifests
└── docs/                        # Documentation
    └── demo-flow.md             # Demo walkthrough guide
```

---

## License

See [LICENSE](LICENSE) for details.
