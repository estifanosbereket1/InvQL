<div align="center">

# InvQL

### A clean, full-stack Inventory Management System

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-008bb9?style=for-the-badge&logo=postgresql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**[Live Demo](https://your-app.vercel.app)** · **[GitHub](https://github.com/estifanosbereket1/InvQL)**

</div>

---

## Overview

InvQL is a responsive, single-page inventory management application built with the modern full-stack Next.js ecosystem. It supports full CRUD operations, image uploads, server-side search and filtering, dynamic pagination, per-product low stock thresholds, auto-generating SKUs, and a real-time audit log , all with a polished UI and dark mode support.

---

## Features

### Core CRUD

| Feature    | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| **Create** | Add products via a slide-in sheet form with full validation        |
| **Read**   | Paginated product table with server-side search and filtering      |
| **Update** | Edit any product in-place , image replacement included             |
| **Delete** | Confirm-gated deletion that also removes the image from Cloudinary |

### Inventory Table

| Column   | Details                                                      |
| -------- | ------------------------------------------------------------ |
| Image    | Thumbnail preview from Cloudinary CDN, fallback icon if none |
| Product  | Name + truncated description                                 |
| SKU      | Monospace badge for quick scanning                           |
| Category | Human-readable category label                                |
| Price    | Formatted to 2 decimal places                                |
| Quantity | Live stock count                                             |
| Status   | Auto-computed badge , In Stock / Low Stock / Out of Stock    |
| Actions  | Edit and Delete buttons per row                              |

### Search, Filter & Pagination

| Feature             | Details                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| **Search**          | Debounced (350ms) full-text search by product name or SKU , server-side |
| **Category filter** | Filter by Electronics, Clothing, Food, Furniture, Tools, or Other       |
| **Status filter**   | Filter by In Stock, Low Stock, or Out of Stock                          |
| **Page size**       | Configurable , 5, 10, 25, or 50 items per page                          |
| **Pagination**      | Previous / Next controls with current page and total page count         |
| **Reset on filter** | Page resets to 1 whenever search or filters change                      |

### Stats Bar

Four live-calculated summary cards at the top of the page:

| Card                | Calculation                                        |
| ------------------- | -------------------------------------------------- |
| **Total Products**  | Count of all items in the database                 |
| **Inventory Value** | Sum of `price × quantity` across all products      |
| **Low Stock**       | Count of products below their individual threshold |
| **Out of Stock**    | Count of products with quantity = 0                |

### Per-Product Low Stock Threshold

Each product has its own configurable `low_stock_threshold` (defaults to 10). Status is computed dynamically against that product's threshold rather than a global constant , so a high-volume item can have a threshold of 50 while a slow-moving item sits at 5. This makes stock alerts meaningful across diverse inventory.

| Quantity vs Threshold | Status       |
| --------------------- | ------------ |
| `0`                   | Out of Stock |
| `1 – threshold`       | Low Stock    |
| `> threshold`         | In Stock     |

### SKU Generation

- Auto-generates SKUs in the `SKU-0001` pattern when the form opens for a new product
- Queries the database for the highest existing SKU number and continues from there , no gaps, no collisions
- Wand icon inside the SKU input field regenerates on demand at any time
- Users can clear and type their own custom SKU freely
- Duplicate SKU errors are caught at the database level and returned as a specific, human-readable message rather than a generic 500

### Audit Log

- Displays the **7 most recent inventory operations** beneath the table in real time
- Fetched alongside product data in a single API call , no extra round trip
- Each entry records:

| Field             | Details                                                               |
| ----------------- | --------------------------------------------------------------------- |
| `type`            | create, update, delete, or stock_adjustment                           |
| `productName`     | Snapshot of the name at time of action , persists even after deletion |
| `quantityChanged` | How many units were added or removed (0 for non-stock changes)        |
| `notes`           | Human-readable description of exactly what changed                    |
| `createdAt`       | Timestamp shown in HH:MM format                                       |

- Color-coded action badges: green for creates, red for deletes, amber for stock adjustments, neutral for updates
- `productId` is a nullable foreign key , set to `null` on product deletion, so log history is never lost

### Image Management

- Upload via **Cloudinary Upload Widget** (client-side, unsigned preset)
- `image_url` and `image_public_id` stored in the database
- On product deletion, the image is **automatically removed from Cloudinary**
- On image replacement, the old image is deleted before the new one is saved

### UX & Design

- **Dark mode** , system default with manual toggle, powered by `next-themes`
- **Responsive** , fully usable on mobile, tablet, and desktop
- **Slide-in Sheet** for create/edit , doesn't obscure the table
- **Backdrop blur** , background blurs when the product sheet is open, keeping focus on the form
- **Scroll lock** , page scroll is disabled while the form sheet is active
- **Confirm dialog** before any destructive delete
- **Sonner toasts** for all success and error feedback, including specific database-level errors
- **Skeleton loaders** while data is fetching
- **Empty state** when no products match the current filters

---

## Tech Stack

### Frontend

| Library                                                   | Purpose                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| [Next.js 14](https://nextjs.org)                          | App Router, React Server Components, API routes                  |
| [TypeScript](https://typescriptlang.org)                  | Type safety throughout                                           |
| [Tailwind CSS v4](https://tailwindcss.com)                | Utility-first styling                                            |
| [shadcn/ui](https://ui.shadcn.com) (radix-nova)           | Component primitives , Table, Sheet, Dialog, Badge, Select, etc. |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark / light mode                                                |
| [react-hook-form](https://react-hook-form.com)            | Performant form state management                                 |
| [Zod](https://zod.dev)                                    | Schema validation shared between client and API                  |
| [Sonner](https://sonner.emilkowal.ski)                    | Toast notifications                                              |
| [Lucide React](https://lucide.dev)                        | Icon set                                                         |
| [Axios](https://axios-http.com)                           | HTTP client for API calls                                        |

### Backend & Database

| Library                                        | Purpose                                                 |
| ---------------------------------------------- | ------------------------------------------------------- |
| [Neon](https://neon.tech)                      | Serverless PostgreSQL with connection pooling           |
| [Drizzle ORM](https://orm.drizzle.team)        | Type-safe SQL ORM , schema-first, relations, migrations |
| [next-cloudinary](https://next.cloudinary.dev) | Cloudinary Upload Widget for Next.js                    |
| [Cloudinary](https://cloudinary.com)           | Image storage, transformation, and CDN delivery         |

> **Database driver:** Uses `@neondatabase/serverless` with `Pool` + `drizzle-orm/neon-serverless` for proper connection pooling in a serverless environment.

### DevOps

| Tool                                         | Purpose                                            |
| -------------------------------------------- | -------------------------------------------------- |
| [Vercel](https://vercel.com)                 | Deployment, edge functions, environment management |
| [dotenv](https://github.com/motdotla/dotenv) | Load `.env.local` for Drizzle Kit CLI commands     |

---

## Database Schema

### `products`

| Column                | Type            | Notes                                                |
| --------------------- | --------------- | ---------------------------------------------------- |
| `id`                  | `uuid`          | Primary key, auto-generated                          |
| `name`                | `varchar(255)`  | Required                                             |
| `description`         | `text`          | Optional                                             |
| `sku`                 | `varchar(100)`  | Unique, required                                     |
| `price`               | `decimal(10,2)` | Required                                             |
| `quantity`            | `integer`       | Defaults to 0                                        |
| `category`            | `enum`          | electronics, clothing, food, furniture, tools, other |
| `status`              | `enum`          | Auto-computed: in_stock, low_stock, out_of_stock     |
| `low_stock_threshold` | `integer`       | Per-product alert baseline, defaults to 10           |
| `image_url`           | `text`          | Cloudinary secure URL                                |
| `image_public_id`     | `text`          | Cloudinary public ID used for deletion               |
| `created_at`          | `timestamp`     | Auto-set on insert                                   |
| `updated_at`          | `timestamp`     | Auto-set on update                                   |

### `inventory_logs`

| Column             | Type           | Notes                                               |
| ------------------ | -------------- | --------------------------------------------------- |
| `id`               | `uuid`         | Primary key, auto-generated                         |
| `product_id`       | `uuid`         | Nullable FK → `products.id` (set null on delete)    |
| `product_name`     | `varchar(255)` | Name snapshot , preserved after product deletion    |
| `type`             | `enum`         | create, update, delete, stock_adjustment            |
| `quantity_changed` | `integer`      | Units added or removed (0 for non-stock operations) |
| `notes`            | `text`         | Human-readable description of the change            |
| `created_at`       | `timestamp`    | Auto-set on insert                                  |

### Relations

- `products` → `inventoryLogs`: one-to-many
- `inventoryLogs` → `products`: many-to-one (nullable, `onDelete: set null`)

---

## API Routes

| Method   | Endpoint                   | Description                                                                                                                  |
| -------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/products`            | Paginated product list. Query params: `page`, `limit`, `search`, `category`, `status`. Returns `{ items, meta, recentLogs }` |
| `POST`   | `/api/products`            | Create a product. Auto-computes `status` from `quantity` vs `lowStockThreshold`. Writes audit log                            |
| `GET`    | `/api/products/:id`        | Fetch a single product by ID                                                                                                 |
| `PATCH`  | `/api/products/:id`        | Update product. Recomputes status. Handles Cloudinary image replacement. Writes audit log                                    |
| `DELETE` | `/api/products/:id`        | Delete product and its Cloudinary image. Writes audit log with `onDelete: set null` on FK                                    |
| `DELETE` | `/api/upload?publicId=xxx` | Remove a specific image from Cloudinary by public ID                                                                         |
| `POST`   | `/api/sku/generate`        | Queries the max existing `SKU-XXXX` value and returns the next one in sequence                                               |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/estifanosbereket1/InvQL.git
cd InvQL
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=inventory_preset
```

### 3. Push the database schema

```bash
npx drizzle-kit push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push your repo to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy , Vercel auto-detects Next.js, no config needed

---

## Project Structure

```
InvQL/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   ├── route.ts               # GET (paginated + logs), POST
│   │   │   └── [id]/route.ts          # GET, PATCH, DELETE
│   │   ├── sku/
│   │   │   └── generate/route.ts      # Sequential SKU generation
│   │   └── upload/route.ts            # Cloudinary image deletion
│   ├── globals.css                    # Tailwind + light/dark CSS variables
│   ├── layout.tsx                     # Root layout with ThemeProvider + Toaster
│   └── page.tsx                       # Single-page app entry point
├── components/
│   ├── ui/                            # shadcn/ui primitives
│   ├── inventory-table.tsx            # Product data table with skeletons
│   ├── product-form.tsx               # Create / edit form with RHF + Zod
│   ├── image-upload.tsx               # Cloudinary upload widget wrapper
│   ├── delete-dialog.tsx              # Confirm delete modal
│   ├── stats-bar.tsx                  # Live summary stat cards
│   └── theme-provider.tsx             # next-themes wrapper
├── db/
│   ├── index.ts                       # Neon Pool + Drizzle client
│   └── schema.ts                      # Tables, enums, relations, and inferred types
├── lib/
│   ├── cloudinary.ts                  # Cloudinary server-side config
│   ├── validations.ts                 # Zod product schema
│   └── utils.ts                       # cn() and shared helpers
└── drizzle.config.ts                  # Drizzle Kit config with dotenv
```

---

<div align="center">
  Built with Next.js · Drizzle ORM · Neon · Cloudinary · shadcn/ui
</div>
