# PrintShop - Print Products E-Commerce System

A full-stack e-commerce platform for custom print products (Posters, Stickers, Visiting Cards) built with React, Node.js, Express, and SQLite.

## Tech Stack

- **Frontend**: React.js (Vite), React Router v6, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js + Express.js (REST API)
- **Database**: SQLite via better-sqlite3
- **Auth**: JWT (JSON Web Tokens)
- **PDF**: jsPDF (invoice generation)
- **File Upload**: Multer (design file uploads)

## Setup & Run

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Seed the database
node db/seed.js

# 3. Start server (runs on http://localhost:5000)
node index.js

# 4. In a new terminal, install & start frontend
cd client
npm install
npm run dev  # runs on http://localhost:3000
```

## Demo Accounts

| Role     | Email                     | Password |
|----------|---------------------------|----------|
| Admin    | admin@printshop.com       | admin123 |
| Customer | customer1@printshop.com   | cust123  |

## Features

### Customer
- Browse products with category filters and sorting
- Product configurator with live pricing engine (size, finish, quantity, bulk discounts)
- Design file upload (PDF, PNG, JPG, AI)
- Shopping cart with coupon codes
- 3-step checkout (Delivery → Review → Payment)
- Order tracking with status timeline
- Download PDF invoice
- Leave product reviews

### Admin
- Dashboard with charts (revenue, orders by category/status, top products)
- Order management with inline status updates
- Product CRUD with variants management
- Bulk discount tier configuration
- Coupon management
- Design file download from orders

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Product detail
- `GET /api/pricing/:productId` - Compute price (live configurator)
- `POST /api/orders` - Create order
- `GET /api/orders/my` - My orders
- `GET /api/orders/:id/invoice` - Download PDF invoice
- `GET /api/dashboard/admin` - Admin dashboard data
- `POST /api/coupons/validate` - Validate coupon code

## Pricing Engine

The `/api/pricing/:productId` endpoint:
1. Looks up base price + finish upcharges
2. Adds visiting card extras (double-sided ₹200, rounded corners ₹150)
3. Adds sticker waterproof upcharge (10%)
4. Applies bulk discount from pricing_rules table
5. Returns unit_price, subtotal, discount breakdown

Bulk discount tiers: 1-4 (0%), 5-9 (10%), 10-24 (18%), 25+ (25%)
