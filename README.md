# CloudCart — Production-Grade Kubernetes Microservices Platform

CloudCart is a modern, decoupled cloud-native e-commerce application structured into independently scaling microservices, a reverse-proxy API Gateway, and an interactive Next.js management dashboard.

---

## System Architecture

```
                                     [ Browser Client ]
                                             │ (Port 80 / localhost)
                                             ▼
                                 ┌──────────────────────┐
                                 │     NGINX Ingress    │
                                 └───────────┬──────────┘
                                             │
                         ┌───────────────────┴───────────────────┐
                         ▼ (Path: /)                             ▼ (Path: /api/v1/*)
               ┌───────────────────┐                   ┌───────────────────┐
               │ Next.js Frontend  │                   │    API Gateway    │
               │   (Port 3000)     │                   │    (Port 8000)    │
               └───────────────────┘                   └─────────┬─────────┘
                                                                 │
         ┌───────────────────────────────┬───────────────────────┼───────────────────────┐
         ▼                               ▼                       ▼                       ▼
┌───────────────────┐           ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   User Service    │           │  Product Service  │   │   Order Service   │   │ Inventory Service │
│    (Port 8001)    │           │    (Port 8002)    │   │    (Port 8003)    │   │    (Port 8004)    │
└─────────┬─────────┘           └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
          │                               │                       │                       │
          ▼                               ▼                       ▼                       ▼
┌───────────────────┐           ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ PostgreSQL (Users)│           │ PostgreSQL + JSONB│   │PostgreSQL (Orders)│   │ PostgreSQL (Inv)  │
│                   │           │    (Products)     │   │                   │   │                   │
└───────────────────┘           └───────────────────┘   └───────────────────┘   └───────────────────┘
```

The system separates concerns at the database layer (Database-per-Service pattern). Product Service leverages PostgreSQL JSONB columns to enable schema flexibility for catalogs. Services communicate internally within the cluster DNS space, and traffic is routed dynamically using path prefixes matching the target endpoint signatures.

---

## Repository File Structure

```
cloud-native-microservices-app/
├── frontend/                    # Next.js 16 App Router dashboard client
│   ├── src/                     # React core components and pages
│   └── public/                  # Static assets and icons
├── services/
│   ├── api-gateway/             # FastAPI reverse proxy gateway
│   ├── user-service/            # Auth and user profile management service
│   ├── product-service/         # Product catalog service
│   ├── order-service/           # Order processing and lifecycle service
│   └── inventory-service/       # Stock tracking and inventory reservation
├── kubernetes/
│   ├── secrets/                 # Base64 configuration credentials (template-provided)
│   ├── configmaps/              # Shared non-sensitive environment variables
│   ├── postgres/                # PVC-backed local database deployments
│   ├── ingress/                 # Split routing ingress paths
│   └── [service]/               # Individual service deployment & service files
├── .env.template                # Local configuration environment variable template
└── docker-compose.yml.template  # Docker Compose orchestration template
```

---

## Configuration & Secrets Isolation

To prevent credential leaks, sensitive configurations are kept separate:
1. **ConfigMaps (`kubernetes/configmaps/app-config.yaml`)**: Manages endpoints, token expiration limits, and public variables.
2. **Secrets (`kubernetes/secrets/postgres-secret.yaml`)**: Stores raw passwords, connection strings, and encryption keys. This file is explicitly excluded via `.gitignore`.
3. **Template Helper**: Fill out values in `postgres-secret.template.yaml`, encode them to base64, and save as `postgres-secret.yaml` before running deploy pipelines.

---

## 1. Local Process Deployment (Open Ports - Bare Metal)

For fast prototyping and code modifications, you can run all services directly on your host machine:

### A. Run PostgreSQL Database
Start a local PostgreSQL instance on port `5432` and create the required databases:
```sql
CREATE DATABASE cloudcart_users;
CREATE DATABASE cloudcart_products;
CREATE DATABASE cloudcart_orders;
CREATE DATABASE cloudcart_inventory;
```

### B. Run Backend Services (FastAPI + Uvicorn)
Open separate terminal instances for each service folder under `services/`, configure their environment variables, and start:

```bash
# 1. API Gateway (Port 8000)
export USER_SERVICE_URL=http://localhost:8001
export PRODUCT_SERVICE_URL=http://localhost:8002
export ORDER_SERVICE_URL=http://localhost:8003
export INVENTORY_SERVICE_URL=http://localhost:8004
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. User Service (Port 8001)
export DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cloudcart_users
export SECRET_KEY=your_secret_key
uvicorn app.main:app --host 0.0.0.0 --port 8001

# 3. Product Service (Port 8002)
export DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cloudcart_products
export INVENTORY_SERVICE_URL=http://localhost:8004
uvicorn app.main:app --host 0.0.0.0 --port 8002

# 4. Order Service (Port 8003)
export DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cloudcart_orders
export PRODUCT_SERVICE_URL=http://localhost:8002
export INVENTORY_SERVICE_URL=http://localhost:8004
uvicorn app.main:app --host 0.0.0.0 --port 8003

# 5. Inventory Service (Port 8004)
export DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cloudcart_inventory
uvicorn app.main:app --host 0.0.0.0 --port 8004
```

### C. Run Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the dashboard.

---

## 2. Docker Compose Deployment

We use environment file interpolation to keep credentials out of the docker-compose manifest.

1. **Create your local environment file**:
   ```bash
   cp .env.template .env
   ```
2. **Populate `.env`**: Open the newly created `.env` file and insert your passwords and keys (e.g. `POSTGRES_PASSWORD=your_secure_password`).
3. **Instantiate the docker-compose file**:
   ```bash
   cp docker-compose.yml.template docker-compose.yml
   ```
4. **Deploy the application stack**:
   ```bash
   docker-compose up --build -d
   ```
5. **Access the application**: Open `http://localhost:3000` to load the application.

---

## 3. Advanced Kubernetes Deploy Steps (Minikube / Local)

Follow this deployment path to instantiate the cluster from local builds:

### A. Initialize Minikube & Load Ingress addon
```bash
minikube start
minikube addons enable ingress
```

### B. Import Images Locally
Compile application layers and load them into the container runtime namespace:
```bash
# Build frontend and user-service locally
docker build -t harveen421/cloudcart-frontend:v5 frontend
docker build -t harveen421/cloudcart-user-service:v1 services/user-service

# Load into Minikube cache
minikube image load harveen421/cloudcart-frontend:v5
minikube image load harveen421/cloudcart-user-service:v1
minikube image load harveen421/cloudcart-product-service:v1
minikube image load harveen421/cloudcart-order-service:v1
minikube image load harveen421/cloudcart-inventory-service:v1
minikube image load harveen421/cloudcart-api-gateway:v1
minikube image load postgres:16
```

### C. Apply Resources
```bash
# 1. Namespaces and configs
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/secrets/postgres-secret.yaml

# 2. Database volumes & pods
kubectl apply -f kubernetes/postgres/

# 3. Create service databases (Connect to psql to bootstrap schemas)
# Get the active postgres pod name first:
kubectl get pods -n cloudcart -l app=postgres
kubectl exec -i [POSTGRES_POD_NAME] -n cloudcart -- psql -U postgres -c "CREATE DATABASE cloudcart_users; CREATE DATABASE cloudcart_products; CREATE DATABASE cloudcart_orders; CREATE DATABASE cloudcart_inventory;"

# 4. Apply deployments
kubectl apply -f kubernetes/user-service/
kubectl apply -f kubernetes/product-service/
kubectl apply -f kubernetes/inventory-service/
kubectl apply -f kubernetes/order-service/
kubectl apply -f kubernetes/api-gateway/
kubectl apply -f kubernetes/frontend/

# 5. Apply Ingress
kubectl apply -f kubernetes/ingress/
```

### D. Patch Ingress & Access
By default, the Ingress controller is deployed as `NodePort`. Patch it to `LoadBalancer` to enable tunnel binding:
```powershell
Set-Content patch.json '{"spec": {"type": "LoadBalancer"}}'
kubectl patch svc ingress-nginx-controller -n ingress-nginx --patch-file patch.json
Remove-Item patch.json
```
Start the tunnel in a separate terminal:
```bash
minikube tunnel
```
Now browse to `http://localhost` (or configure your Windows hosts file to point `cloudcart.local` to `127.0.0.1` and open `http://cloudcart.local`).

---

---

## DevOps Automation & CI/CD Workflows

![DevOps Workflows Diagram](docs/workflows_diagram.png)

The repository includes a production-grade DevOps automation suite structured in GitHub Actions.

### Active Workflows (Run automatically on pushes/PRs)
* **Continuous Integration (ci.yml)**: Validates code health by running Ruff checks (lint/format), executing pytest suites for Python services, running npm lint/build for Next.js, and verify-compiling all Dockerfiles.
* **DevSecOps Security Scan (security-scan.yml)**: Scans for credential leaks (Gitleaks), validates Node/Python package security (npm audit / pip-audit), and analyzes container image vulnerabilities using Trivy.
* **Kubernetes Manifest Validation (kubernetes-validation.yml)**: Conforms YAML configuration formats via `kubeconform` and validates manifests using dry-run tests in a local `Kind` cluster.
* **Database Operations Check (database-check.yml)**: Spins up a temporary PostgreSQL instance to validate SQLAlchemy structures and Alembic migration scripts.
* **Release Manager (release.yml)**: Automates Git tag-based releases and generates release changelogs.

### Production-Ready Templates (Configured as .disabled files)
To enable these, configure your credentials in GitHub Secrets and rename the files to `.yml`:
* **Docker Registry Publish (docker-build-push.disabled)**: Builds and pushes versioned images to Docker Hub. Requires `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets.
* **Cluster Deployment (deploy.disabled)**: Deploys updated images to your cluster with rolling rollouts and automatic rollback on failure. Requires `KUBECONFIG_DATA` secret.

---

## Future Roadmap & Improvements

* **Production Cloud Migration**: Target managed public cloud clusters (such as Amazon EKS, Google GKE, or Azure AKS) using Helm Charts.
* **Observability Stack**: Deploy Prometheus and Grafana operators inside the Kubernetes namespace to scrape FastAPI endpoint metrics and visualize load parameters.
* **Centralized Log Aggregation**: Set up Grafana Loki or ELK agents to collect stdout logs from all microservice pods.
* **Horizontal Pod Autoscaling (HPA)**: Configure automatic scaling rules to dynamically adjust microservice pod counts based on CPU threshold spikes.

