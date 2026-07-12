# JARAVIEA - Enterprise Women's Footwear E-Commerce Platform

JARAVIEA is a world-class, enterprise-grade, full-stack women's footwear e-commerce platform. Built with a modern, modular multi-service architecture, it offers a premium, high-performance shopping experience with a clean minimalist aesthetic, beautiful product presentation, and robust administrative tools.

---

## 🏗️ Architecture & Folder Structure

The project is structured as a monorepos-style codebase divided into two primary services:

```
jaraviea/
├── frontend/             # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI (Navbar, Footer, CartDrawer, etc.)
│   │   ├── pages/        # Storefront & Admin pages (Home, Catalog, Admin, etc.)
│   │   ├── store/        # Zustand state stores (Auth, Cart, Wishlist)
│   │   └── utils/        # Axios API instances with automatic JWT rotation
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/              # Node.js + Express + Prisma + PostgreSQL Backend
│   ├── prisma/           # Database schema & seeding scripts
│   ├── src/
│   │   ├── lib/          # Helper clients (Prisma, Redis with fallbacks)
│   │   ├── middleware/   # JWT Authentication, RBAC, and error boundaries
│   │   └── routes/       # API endpoints (Auth, Products, Orders, Admin)
│   └── Dockerfile
│
├── docker-compose.yml    # Main orchestration configuration
└── README.md             # Project Guide
```

---

## ⚡ Tech Stack Specifications

### Frontend
- **React 19 & Vite:** Next-generation rendering speeds and bundle sizes.
- **Tailwind CSS v4:** Modern variables-based styling and luxury layouts.
- **Framer Motion:** Smooth, fluid 120fps visual animations.
- **Zustand:** Lightweight state stores for authentication, carts, and wishlists.
- **TanStack React Query:** Data fetching caching layers.
- **Axios:** Fully custom HTTP client featuring JWT interceptors and auto-refresh token rotation.

### Backend
- **Node.js & Express.js:** Fast, rate-limited REST API server.
- **Prisma ORM & PostgreSQL:** Fully normalized relational schemas with transactional consistency.
- **Redis:** Session storage and token status checks (with resilient in-memory caching failbacks).
- **Security Protocols:** JWT auth, bcrypt password hashing, CORS validation, Helmet headers protection, and request rate limiting.

### Deployment & Infrastructure
- **Docker & Docker Compose:** Standard containerization of all frontend, backend, PostgreSQL, and Redis layers.
- **Nginx:** Production web serving for compiled frontend assets.

---

## 🚀 Local Run Guide (via Docker Compose)

To launch the entire platform, including database and cache, run:

```bash
docker compose up --build
```

This command will:
1. Initialize the **PostgreSQL** database.
2. Initialize the **Redis** cache container.
3. Build and launch the **Express Backend** API service on port `5000`.
4. Compile the **React Frontend** and host it via Nginx on port `3000`.

### 🗄️ Database Migrations & Seeding
Once the PostgreSQL database container is running, execute migrations and database seeding inside the backend service container:

```bash
# Apply database migrations
docker compose exec backend npx prisma db push

# Seed the database with sample products and credentials
docker compose exec backend npx prisma db seed
```

---

## 🔑 Access Credentials & Portals

### 🛍️ Client Storefront
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the customer interface.

- **Customer Login:**
  - **Email:** `customer@jaraviea.com`
  - **Password:** `password123`

### 👑 Administrative Portal
Access the Admin Dashboard by clicking the User icon in the top header or navigating directly to **[http://localhost:3000/admin](http://localhost:3000/admin)** (requires administrator credentials).

- **Administrator Login:**
  - **Email:** `admin@jaraviea.com`
  - **Password:** `rifat991`

---

## 🔌 API Documentation Outline

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Create customer profile |
| `/api/auth/login` | `POST` | Public | Verify details and issue JWTs |
| `/api/auth/refresh` | `POST` | Public | Issue new access tokens via refresh |
| `/api/auth/profile` | `GET` | User | Fetch active profile and addresses |
| `/api/products` | `GET` | Public | Filter and list footwear products |
| `/api/products/:slug` | `GET` | Public | View individual product details |
| `/api/products` | `POST` | Admin | Create product with variants |
| `/api/orders/checkout` | `POST` | Public | Execute order checkout |
| `/api/orders` | `GET` | User/Admin | List customer or system orders |
| `/api/admin/reports/sales` | `GET` | Admin | Fetch sales totals and revenue chart |
| `/api/admin/inventory/low-stock`| `GET` | Admin | Fetch variants low on inventory stock |
| `/api/upload` | `POST` | Admin | Upload image assets to local directory |
