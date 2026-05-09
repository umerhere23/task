# Multi-Tenant CRM

A minimal CRM system built with Next.js, TypeScript, and PostgreSQL. Supports multiple organizations with safe concurrent operations.

## Architecture

Built on a **service layer pattern** with organization-scoped data isolation enforced at database, API, and business logic layers. Uses **pessimistic locking with serializable transactions** for concurrency safety, ensuring consistent state even under high concurrent load. Optimized for scalability with indexed queries, pagination, and soft deletes for data retention.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, CSS Modules
- **Backend**: Next.js API Routes, TypeORM
- **Database**: PostgreSQL
- **Validation**: Zod

---

## Features

- Multi-tenant (organization-scoped data isolation)
- Customer CRUD — create, edit, view, soft delete, restore
- Search by name/email with pagination
- Customer assignment with a max 5 active customers per user limit
- Concurrency-safe assignment using DB transactions + row-level locking
- Activity logging

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+

### 1. Clone & Install

```bash
git clone <repo-url>
cd crm
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Fill in your PostgreSQL credentials
```

### 3. Set Up Database

```bash
# Local PostgreSQL
createdb crm_db

# Or with Docker
docker run -d --name crm-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crm_db \
  -p 5432:5432 postgres:15
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Create Your Organization

Fill in the setup form on the homepage. This creates your organization and an admin user.

---

## Project Structure

```
src/
├── app/
│   ├── api/              # API route handlers
│   ├── customers/        # Customer pages
│   ├── layout.tsx
│   └── page.tsx
├── server/
│   ├── entities/         # TypeORM models (DB schema)
│   ├── services/         # Business logic
│   ├── middleware/       # Auth & org scoping
│   └── types/            # Zod schemas & DTOs
├── components/           # Reusable React components
└── lib/
    └── api-client.ts     # Frontend API wrapper
```

---

## API Overview

All routes require these headers:
```
x-org-id: <organization-id>
x-user-id: <user-id>
x-user-role: admin | member
```

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers?page=1&limit=20&search=john` | List with pagination & search |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Soft delete |
| POST | `/api/customers/:id/restore` | Restore deleted customer |
| POST | `/api/customers/:id/assign` | Assign to user (max 5 limit) |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/users` | List or create users |
| POST | `/api/customers/:id/notes` | Add note |
| GET | `/api/activity-logs` | View activity history |

---

## Key Concepts

### Multi-Tenancy
Every database query is scoped to `organizationId`. Data from one org is never visible to another.

### Concurrency-Safe Assignment
To prevent two requests from both assigning a 6th customer to the same user simultaneously:
1. Start a `SERIALIZABLE` transaction
2. Lock the user row (`SELECT FOR UPDATE`)
3. Count current assignments
4. Reject if ≥ 5, otherwise assign
5. Commit

### Soft Delete
Deleted customers get a `deletedAt` timestamp and are hidden from normal queries — but their notes and activity history are preserved. They can be restored.

---

## Known Limitations (Demo Only)

- Auth is header-based — not safe for production (use JWT instead)
- No rate limiting
- No caching layer
- Auth tokens stored in `localStorage`

---

## License
MIT