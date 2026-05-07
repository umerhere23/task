# Multi-Tenant CRM System

A production-grade minimal CRM system demonstrating advanced architectural patterns including multi-tenancy isolation, concurrency-safe operations, and performance optimization.

## Architecture Overview

### Multi-Tenancy Design

**Isolation Strategy:**
- **Database-level isolation**: Every table includes `organizationId` field as part of all queries
- **Data boundaries**: Foreign key constraints ensure customers, users, and notes belong only to their organization
- **Middleware enforcement**: All API routes verify `organizationId` from request headers
- **Query filtering**: `WHERE organizationId = :id` is applied to every customer/user/note query

Example of isolation in `CustomerService.listCustomers()`:
```typescript
query.where('customer.organizationId = :organizationId', { organizationId });
```

### Concurrency-Safe Customer Assignment

**Problem**: Multiple concurrent requests could exceed the 5-customer-per-user limit or cause race conditions.

**Solution: Pessimistic Locking with Serializable Transactions**

1. **Serializable Isolation Level**: Start transaction with `SERIALIZABLE` isolation
2. **Database-level Locking**: Use `SELECT FOR UPDATE` to lock the user row
3. **Atomic Counting**: Count assignments within the locked transaction
4. **Atomic Update**: Update assignment in same transaction
5. **Transactional Rollback**: If limit exceeded, entire transaction rolls back

```typescript
await queryRunner.startTransaction('SERIALIZABLE');
const targetUser = await queryRunner.manager
  .createQueryBuilder(User, 'user')
  .setLock('pessimistic_write')  // SELECT FOR UPDATE
  .getOne();

const activeCount = await queryRunner.manager.count(Customer, {
  where: { assignedToId: assignedToId, organizationId, deletedAt: null }
});

if (activeCount >= 5 && !(customer.assignedToId === assignedToId)) {
  throw new Error('Limit exceeded');
}
// Update happens
await queryRunner.commitTransaction();
```

**Why This Works**:
- Other transactions WAIT when trying to lock the same user
- Lock is released only after transaction commits
- Accurate count guaranteed: no possibility of reading stale data
- All-or-nothing semantics: either assignment succeeds with all side effects or fails completely

### Performance Optimization

**1. Database Indexes** (Applied in TypeORM entities):
```sql
-- Customers table indexes for common queries
INDEX idx_customers_org_deleted ON customers(organizationId, deletedAt)
INDEX idx_customers_org_name ON customers(organizationId, name)
INDEX idx_customers_org_email ON customers(organizationId, email)
INDEX idx_customers_assigned_deleted ON customers(assignedToId, deletedAt)

-- Support for sorting and filtering
INDEX idx_activity_org_created ON activity_logs(organizationId, createdAt)
INDEX idx_notes_customer ON notes(customerId)
```

**2. Pagination Strategy**:
- Default 20 items per page, max 100 per request
- Skip-based pagination using `OFFSET` and `LIMIT`
- Total count via separate query for accuracy

```typescript
const { skip, take } = calculatePagination(page, limit);
const [customers, total] = await query.skip(skip).take(take).getManyAndCount();
```

**3. N+1 Query Prevention**:
- Use `relations` and `leftJoinAndSelect` in queries:
```typescript
query.leftJoinAndSelect('customer.assignedTo', 'assignedTo');
```

**4. Search Optimization**:
- Debounced frontend search (300ms)
- Case-insensitive search using PostgreSQL `ILIKE`
- Limits results to 20 items per page

**5. Estimated 100K customers per org**:
- With proper indexing: 100K queries ~50-100ms
- With pagination: never loading >20 records at a time
- Memory footprint: minimal on frontend

### Soft Delete Implementation

**Requirements**:
- Customers must not appear in normal queries when deleted
- Notes and activity logs persist after deletion
- Restored customers show their history

**Implementation**:
```typescript
// Soft delete stores timestamp
customer.deletedAt = new Date();

// Normal queries filter out soft-deleted
WHERE customer.deletedAt IS NULL

// Restore clears the timestamp
customer.deletedAt = null;

// Notes are always returned regardless of customer status
const notes = await noteRepository.find({ customerId, organizationId });
// (no deletedAt filter)
```

### Activity Logging

**Logged Events**:
- `customer_created`: New customer added
- `customer_updated`: Customer details changed
- `customer_deleted`: Customer soft-deleted
- `customer_restored`: Customer restored from soft-delete
- `customer_assigned`: Customer assigned to user
- `note_added`: Note added to customer

**Schema**:
```typescript
action: ActivityAction
entityType: 'customer' | 'note'
entityId: UUID
organizationId: UUID
performedByUserId: UUID
changes: Record<string, any> // Stores what changed (before/after)
createdAt: Timestamp
```

## Production Improvement: Structured Request Logging

**Choice**: Structured logging middleware for production observability

**Implementation Concept**:
- Log every request: timestamp, userId, organizationId, path, method, status, duration
- Helps with: debugging, auditing, performance monitoring, security incident investigation
- Format: Structured JSON for easy parsing in log aggregation systems (ELK, DataDog, etc.)

**Example Log Output**:
```json
{
  "level": "info",
  "time": "2024-05-07T10:30:45.123Z",
  "userId": "user-id",
  "organizationId": "org-id",
  "method": "GET",
  "path": "/api/customers",
  "status": 200,
  "duration": 45,
  "msg": "Request completed"
}
```

## Technical Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL with TypeORM
- **Validation**: Zod for type-safe schema validation
- **Concurrency**: TypeORM transactions with Serializable isolation
- **UUIDs**: uuid package for distributed ID generation

### Frontend
- **Framework**: Next.js 14 with App Router
- **State Management**: React Context API + localStorage
- **Styling**: Tailwind CSS
- **Type Safety**: Full TypeScript

## Project Structure

```
src/
├── server/
│   ├── database/
│   │   └── index.ts              # Database connection & initialization
│   ├── entities/                 # TypeORM entities
│   │   ├── Organization.ts
│   │   ├── User.ts
│   │   ├── Customer.ts
│   │   ├── Note.ts
│   │   └── ActivityLog.ts
│   ├── services/                 # Business logic
│   │   ├── CustomerService.ts   # Concurrency-safe assignment
│   │   ├── UserService.ts
│   │   ├── NoteService.ts
│   │   ├── OrganizationService.ts
│   │   └── ActivityLogService.ts
│   ├── middleware/
│   │   └── auth.ts              # Multi-tenancy + auth middleware
│   ├── types/                    # DTOs and Zod schemas
│   │   └── index.ts
│   ├── utils/                    # Utilities
│   │   └── index.ts
│   └── routes/                   # Express-style route definitions (ref)
├── app/
│   ├── api/                      # Next.js API routes
│   │   ├── organizations/
│   │   ├── customers/
│   │   ├── users/
│   │   ├── activity-logs/
│   │   └── (route handlers)
│   ├── components/              # React components
│   │   ├── CustomerForm.tsx
│   │   ├── CustomerList.tsx
│   │   └── UI.tsx
│   ├── store/                   # State management
│   │   └── AppContext.tsx
│   ├── customers/               # Customer pages
│   ├── page.tsx                 # Home page with setup
│   └── layout.tsx               # Root layout with provider
└── lib/
    └── api-client.ts            # Frontend API client
```

## Preferred Frontend Structure

```text
project-root/
|
+-- src/
|   +-- app/                    # Next.js App Router
|   |   +-- (auth)/
|   |   |   +-- login/
|   |   |   +-- register/
|   |   |
|   |   +-- dashboard/
|   |   +-- api/
|   |   +-- layout.tsx
|   |   +-- page.tsx
|   |   +-- globals.css
|   |
|   +-- components/
|   |   +-- ui/
|   |   +-- forms/
|   |   +-- layout/
|   |   +-- shared/
|   |
|   +-- lib/
|   |   +-- supabase/
|   |   |   +-- client.ts
|   |   |   +-- server.ts
|   |   |   +-- middleware.ts
|   |   |
|   |   +-- db.ts
|   |   +-- auth.ts
|   |   +-- utils.ts
|   |
|   +-- hooks/
|   |   +-- useAuth.ts
|   |   +-- useUser.ts
|   |
|   +-- services/
|   |   +-- auth.service.ts
|   |   +-- user.service.ts
|   |   +-- product.service.ts
|   |
|   +-- types/
|   |   +-- auth.types.ts
|   |   +-- db.types.ts
|   |   +-- index.ts
|   |
|   +-- constants/
|       +-- index.ts
|
+-- public/
|
+-- .env.local
+-- middleware.ts
+-- next.config.ts
+-- tsconfig.json
+-- package.json
+-- README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- npm

### 1. Environment Setup

```bash
# Create .env.local
cp .env.example .env.local

# Edit .env.local with your PostgreSQL credentials
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

**Option A: Local PostgreSQL**
```bash
createdb crm_db
```

**Option B: Docker**
```bash
docker run -d \
  --name crm-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crm_db \
  -p 5432:5432 \
  postgres:15
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Organization

- Fill in organization setup form
- System creates organization + admin user
- Auth tokens stored in localStorage for demo

## API Reference

### Organizations

```bash
# Create organization
POST /api/organizations
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "adminName": "John Doe",
  "adminEmail": "john@example.com"
}

# Get by slug
GET /api/organizations?slug=acme-corp
```

### Customers

```bash
# List (with pagination & search)
GET /api/customers?page=1&limit=20&search=john
Headers: x-user-id, x-org-id, x-user-role

# Create
POST /api/customers
{ "name": "...", "email": "...", "phone": "..." }

# Update
PUT /api/customers/:id
{ "name": "..." }

# Delete (soft)
DELETE /api/customers/:id

# Restore
POST /api/customers/:id/restore

# Assign (CONCURRENCY-SAFE with pessimistic locking)
POST /api/customers/:id/assign
{ "assignedToId": "user-id" }
```

### Users

```bash
# List
GET /api/users
Headers: x-org-id

# Create (admin only)
POST /api/users
{ "name": "...", "email": "...", "role": "member" }
```

### Notes

```bash
# Add note
POST /api/customers/:customerId/notes
{ "content": "..." }

# Get notes
GET /api/customers/:customerId/notes
```

### Activity Logs

```bash
# List
GET /api/activity-logs?page=1&limit=20
Headers: x-org-id
```

## Scaling Strategy

### Horizontal Scaling
1. **Load Balancer**: Deploy multiple app instances behind load balancer
2. **Stateless Design**: No server-side sessions, auth via headers/tokens
3. **Database Connection Pooling**: PgBouncer for connection management

### Vertical Database Optimization
1. **Caching Layer**: Redis for frequently accessed user/customer data
2. **Read Replicas**: For activity log queries and reporting
3. **Archive**: Move old activity logs (>1 year) to separate table/database
4. **Partitioning**: Partition activity logs by month by organization

### Production Readiness Checklist
- [ ] Replace header-based auth with JWT + OAuth2
- [ ] Add rate limiting per user/IP
- [ ] Implement request tracing for debugging
- [ ] Add error tracking (Sentry)
- [ ] Set up automated backups
- [ ] Add CDN for static assets
- [ ] Implement metrics/monitoring (Prometheus)
- [ ] Add database query performance monitoring
- [ ] Set up CI/CD pipeline

## Trade-offs Made

1. **Simplicity vs Features**: Minimal UI without complex features (charts, export, dashboards)
2. **Demo Auth**: Header-based auth for simplicity (not production-ready, use JWT in production)
3. **Frontend State**: Context API instead of Redux (sufficient for demo size)
4. **Single Database**: Could be sharded per organization at 10M+ customers
5. **Pagination**: Skip-based instead of cursor-based (sufficient for <100K records)
6. **Caching**: No caching layer (would be needed for >1M customers)

## Development Notes

### Testing Concurrency Safety

```bash
# Run 10 concurrent assignment requests for same user
# This should reject requests beyond 5

for i in {1..10}; do
  curl -X POST http://localhost:3000/api/customers/:customerId/assign \
    -H "Content-Type: application/json" \
    -H "x-user-id: user-1" \
    -H "x-org-id: org-1" \
    -H "x-user-role: admin" \
    -d '{"assignedToId":"target-user"}' &
done
wait

# Should see: 5 successful, 5 "ASSIGNMENT_LIMIT_EXCEEDED" errors
```

### Database Performance Verification

```sql
-- Check index creation
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'public' AND tablename = 'customers';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM customers 
WHERE "organizationId" = 'org-uuid' AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT 20;

-- Check active connections
SELECT * FROM pg_stat_activity;
```

## Known Limitations

1. **No Authentication**: Demo uses header-based auth, not suitable for production
2. **Local Storage**: Auth stored in localStorage (vulnerable in production)
3. **No Rate Limiting**: Add middleware for production
4. **No Request Validation**: Add helmet and other security middleware
5. **No Logging**: Production would need structured logging
6. **No Monitoring**: Would need APM solution

## License

MIT

## Author

Production CRM Demo - 2024
