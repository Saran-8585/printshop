# PrintShop - Setup Guide

A full-stack e-commerce system for stickers and posters built with React, Express, and MongoDB.

---

## Prerequisites

- **Node.js v22+**
- **npm v10+**
- **Docker & Docker Compose** (recommended) or **MongoDB 7+** (local)

---

## Quick Start (Docker - Recommended)

```bash
# 1. Start all services
docker compose up -d

# 2. Seed the database with sample data
docker compose exec backend node db/seed.js

# 3. Open in browser
#    Frontend: http://localhost:3000
#    API:      http://localhost:5000/api/health
```

### Demo Credentials

| Role     | Email                    | Password |
|----------|--------------------------|----------|
| Admin    | admin@printshop.com      | admin123 |
| Customer | customer1@printshop.com  | cust123  |

---

## Development (Local, No Docker)

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Start MongoDB

Make sure MongoDB is running locally on port `27017`.

### 3. Seed the Database

```bash
npm run seed
```

### 4. Start the Backend

```bash
npm run dev:server
# API at http://localhost:5000
```

### 5. Start the Frontend (in a separate terminal)

```bash
npm run dev:client
# Frontend at http://localhost:3000
```

---

## Production Build

```bash
# Build and run with Docker
docker compose -f docker-compose.prod.yml up -d

# Seed database
docker compose -f docker-compose.prod.yml exec app node server/db/seed.js

# Open http://localhost:5000
```

The production Docker image serves both the API and the built frontend from a single container.

---

## Project Structure

```
printshop/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── pages/           # Page components
│   │   └── utils/           # Axios config
│   ├── vite.config.js
│   └── Dockerfile.dev
├── server/                  # Express API backend
│   ├── controllers/         # Route handlers (Mongoose)
│   ├── db/                  # Database connection & seed
│   ├── middleware/          # Auth, file upload
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   └── uploads/             # User-uploaded files
├── Dockerfile               # Multi-stage production build
├── Dockerfile.dev           # Dev backend image
├── docker-compose.yml       # Dev environment (3 services)
├── docker-compose.prod.yml  # Production environment
└── .env                     # Environment variables
```

---

## Environment Variables

Located in `server/.env`:

| Variable      | Default                          | Description              |
|---------------|----------------------------------|--------------------------|
| `PORT`        | `5000`                           | API server port          |
| `JWT_SECRET`  | `printshop_jwt_secret_key_2024`  | JWT signing secret       |
| `UPLOAD_DIR`  | `uploads`                        | File upload directory    |
| `MONGODB_URI` | `mongodb://localhost:27017/printshop` | MongoDB connection string |

---

## API Endpoints

| Method | Endpoint                     | Auth    | Description              |
|--------|------------------------------|---------|--------------------------|
| POST   | `/api/auth/register`         | No      | Register new user        |
| POST   | `/api/auth/login`            | No      | Login, returns JWT       |
| GET    | `/api/auth/me`               | JWT     | Current user profile     |
| GET    | `/api/products`              | No      | List products            |
| GET    | `/api/products/:id`          | No      | Product details          |
| GET    | `/api/products/:id/reviews`  | No      | Product reviews          |
| POST   | `/api/products`              | Admin   | Create product           |
| PUT    | `/api/products/:id`          | Admin   | Update product           |
| PATCH  | `/api/products/:id/status`   | Admin   | Toggle active/inactive   |
| GET    | `/api/pricing/:productId`    | No      | Price calculation        |
| POST   | `/api/orders`                | JWT     | Create order             |
| GET    | `/api/orders/my`             | JWT     | User's orders            |
| GET    | `/api/orders/`               | Admin   | All orders               |
| GET    | `/api/orders/:id`            | JWT     | Order detail             |
| PATCH  | `/api/orders/:id/status`     | Admin   | Update order status      |
| PATCH  | `/api/orders/:id/cancel`     | JWT     | Cancel order             |
| GET    | `/api/orders/:id/invoice`    | JWT     | Download PDF invoice     |
| POST   | `/api/coupons/validate`      | No      | Validate coupon          |
| POST   | `/api/upload/design`         | JWT     | Upload design file       |
| GET    | `/api/dashboard/admin`       | Admin   | Dashboard analytics      |
| GET    | `/api/addresses`             | JWT     | User's addresses         |
| GET    | `/api/health`                | No      | Health check             |

---

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router 6
- **Backend**: Node.js, Express 4, Mongoose 9
- **Database**: MongoDB 7
- **Auth**: JWT (bcryptjs)
- **File Storage**: Local filesystem (Multer)
- **PDF**: jsPDF (invoices)
