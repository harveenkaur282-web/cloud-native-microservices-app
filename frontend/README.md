# Next.js 16 Frontend Client Dashboard

This is the user-facing web dashboard of the CloudCart platform. Built using Next.js 16 (App Router), it provides customer registration, catalog navigation, cart management, and order submission flows.

---

## Tech Stack Features

* **Framework**: Next.js 16 (React 19, App Router, TypeScript, Client & Server Components).
* **Styling**: Vanilla CSS structure styled with custom Tailwind variables for a modern layout.
* **API Requests**: Axios client configured with relative routing matching the Nginx Ingress routes (`/api/v1`).
* **Route Guards**: In-memory state tracking for user login sessions.

---

## File Structure Highlights

```
frontend/
├── src/
│   └── app/
│       ├── page.tsx          # Interactive Landing page
│       ├── login/            # User authentication route
│       ├── register/         # Signup registration route
│       ├── dashboard/        # Customer metrics dashboard
│       ├── products/         # Product collection list
│       └── layout.tsx        # Global theme configuration
└── package.json              # Client runtime scripts
```

---

## Environment Variables

The Next.js client routes all downstream requests to the gateway via:
* `NEXT_PUBLIC_API_GATEWAY_URL`: Configured through `cloudcart-config` ConfigMap. In development/Ingress contexts, this defaults to `/api/v1` to allow relative proxying, preventing CORS blocking issues in host browsers.

---

## Local Development (Docker-less)

To run the frontend client locally for development:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch dev server**:
   ```bash
   npm run dev
   ```
3. **Build production build**:
   ```bash
   npm run build
   ```
