import { ensureDatabaseInitialized } from '@/server/database';
import crypto from 'crypto';
import { CustomerEntity } from '@/server/entities/Customer';
import { UserEntity } from '@/server/entities/User';
import { CustomerDTO, CustomerListDTO } from '@/types';

interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
}

interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
}

function mapCustomer(row: CustomerEntity): CustomerDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    organizationId: row.organizationId,
    assignedToId: row.assignedToId,
    assignedTo: row.assignedTo
      ? { id: row.assignedTo.id, name: row.assignedTo.name, email: row.assignedTo.email }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(),
  };
}

function mapCustomerList(row: CustomerEntity): CustomerListDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    assignedToId: row.assignedToId,
    assignedToName: row.assignedTo?.name || null,
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
  };
}

export async function listCustomersModel(
  organizationId: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  includeDeleted: boolean = false
): Promise<{ data: CustomerListDTO[]; total: number; pages: number }> {
  const dataSource = await ensureDatabaseInitialized();

  // Build WHERE conditions
  const conditions: string[] = ['c.organization_id = $1'];
  const params: any[] = [organizationId];
  let paramIndex = 2;

  if (!includeDeleted) {
    conditions.push(`c.deleted_at IS NULL`);
  }

  if (search) {
    conditions.push(`(LOWER(c.name) ILIKE LOWER($${paramIndex}) OR LOWER(c.email) ILIKE LOWER($${paramIndex}))`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await dataSource.query(
    `SELECT COUNT(*) as total FROM customers c WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0].total, 10);

  // Get paginated results
  const offset = (page - 1) * limit;
  const result = await dataSource.query(
    `SELECT 
      c.id, c.name, c.email, c.phone, c.assigned_to_id, c.created_at, c.deleted_at,
      u.name as assigned_to_name
     FROM customers c
     LEFT JOIN users u ON c.assigned_to_id = u.id
     WHERE ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const customers: CustomerListDTO[] = result.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    assignedToId: row.assigned_to_id,
    assignedToName: row.assigned_to_name,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  }));

  const pages = Math.ceil(total / limit);

  return {
    data: customers,
    total,
    pages,
  };
}

export async function getCustomerModel(
  customerId: string,
  organizationId: string
): Promise<CustomerDTO | null> {
  const dataSource = await ensureDatabaseInitialized();
  const repo = dataSource.getRepository<CustomerEntity>('Customer');

  const row = await repo
    .createQueryBuilder('customer')
    .leftJoinAndSelect('customer.assignedTo', 'assignedTo')
    .where('customer.id = :id', { id: customerId })
    .andWhere('customer.organization_id = :organizationId', { organizationId })
    .andWhere('customer.deleted_at IS NULL')
    .getOne();

  return row ? mapCustomer(row) : null;
}

export async function createCustomerModel(
  organizationId: string,
  input: CreateCustomerInput
): Promise<CustomerDTO> {
  const dataSource = await ensureDatabaseInitialized();
  const repo = dataSource.getRepository<CustomerEntity>('Customer');

  const customer = await repo.save(
    repo.create({
      id: crypto.randomUUID(),
      organizationId,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      assignedToId: null,
      deletedAt: null,
    })
  );

  const result = await repo.findOne({
    where: { id: customer.id },
    relations: ['assignedTo'],
  });

  return result ? mapCustomer(result) : mapCustomer(customer);
}

export async function updateCustomerModel(
  customerId: string,
  organizationId: string,
  input: UpdateCustomerInput
): Promise<CustomerDTO | null> {
  const dataSource = await ensureDatabaseInitialized();
  const repo = dataSource.getRepository<CustomerEntity>('Customer');

  const customer = await repo
    .createQueryBuilder('customer')
    .where('customer.id = :id', { id: customerId })
    .andWhere('customer.organization_id = :organizationId', { organizationId })
    .andWhere('customer.deleted_at IS NULL')
    .getOne();

  if (!customer) {
    return null;
  }

  const updated = {
    ...customer,
    ...(input.name && { name: input.name }),
    ...(input.email && { email: input.email }),
    ...(input.phone !== undefined && { phone: input.phone || null }),
  };

  await repo.save(updated);

  const result = await repo
    .createQueryBuilder('customer')
    .leftJoinAndSelect('customer.assignedTo', 'assignedTo')
    .where('customer.id = :id', { id: customerId })
    .getOne();

  return result ? mapCustomer(result) : null;
}

export async function deleteCustomerModel(
  customerId: string,
  organizationId: string
): Promise<boolean> {
  const dataSource = await ensureDatabaseInitialized();
  const repo = dataSource.getRepository<CustomerEntity>('Customer');

  const customer = await repo
    .createQueryBuilder('customer')
    .where('customer.id = :id', { id: customerId })
    .andWhere('customer.organization_id = :organizationId', { organizationId })
    .andWhere('customer.deleted_at IS NULL')
    .getOne();

  if (!customer) {
    return false;
  }

  await repo.update(
    { id: customerId },
    { deletedAt: new Date() }
  );

  return true;
}

export async function assignCustomerModel(
  customerId: string,
  organizationId: string,
  assignedToId: string
): Promise<CustomerDTO | null> {
  const dataSource = await ensureDatabaseInitialized();

  // Use SERIALIZABLE transaction with row-level locking to prevent race conditions
  // This ensures that concurrent assignment requests are executed sequentially
  const result = await dataSource.transaction('SERIALIZABLE', async (manager) => {
    // Lock the customer row to prevent concurrent assignments
    const customerQuery = await manager.query(
      `SELECT id, name, email, phone, assigned_to_id, created_at 
       FROM customers 
       WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL 
       FOR UPDATE`,
      [customerId, organizationId]
    );

    if (customerQuery.length === 0) {
      throw new Error('Customer not found');
    }

    const customer = customerQuery[0];

    // Lock the user row to prevent concurrent over-assignment
    const userQuery = await manager.query(
      `SELECT id, name, email 
       FROM users 
       WHERE id = $1 AND organization_id = $2 
       FOR UPDATE`,
      [assignedToId, organizationId]
    );

    if (userQuery.length === 0) {
      throw new Error('User not found');
    }

    // Count active customers for this user (excluding deleted ones)
    // This count is read within the SERIALIZABLE transaction to prevent race conditions
    const countQuery = await manager.query(
      `SELECT COUNT(*) as count 
       FROM customers 
       WHERE assigned_to_id = $1 AND organization_id = $2 AND deleted_at IS NULL`,
      [assignedToId, organizationId]
    );

    const currentActiveCount = parseInt(countQuery[0].count, 10);

    // Business rule: Max 5 active customers per user
    // This check is guaranteed to be accurate due to SERIALIZABLE isolation
    if (currentActiveCount >= 5) {
      throw new Error(`User already has maximum active customers (${currentActiveCount}/5)`);
    }

    // Assign the customer
    await manager.query(
      `UPDATE customers 
       SET assigned_to_id = $1 
       WHERE id = $2 AND organization_id = $3`,
      [assignedToId, customerId, organizationId]
    );

    // Return the updated customer with assigned user details
    const updatedQuery = await manager.query(
      `SELECT c.id, c.name, c.email, c.phone, c.assigned_to_id, c.created_at,
              u.id as user_id, u.name as user_name, u.email as user_email
       FROM customers c
       LEFT JOIN users u ON c.assigned_to_id = u.id
       WHERE c.id = $1`,
      [customerId]
    );

    return updatedQuery[0];
  });

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    email: result.email,
    phone: result.phone,
    organizationId: organizationId,
    assignedToId: result.assigned_to_id,
    assignedTo: result.user_name ? {
      id: result.user_id,
      name: result.user_name,
      email: result.user_email
    } : null,
    createdAt: result.created_at,
    updatedAt: result.created_at,
  };
}

export async function restoreCustomerModel(
  customerId: string,
  organizationId: string
): Promise<CustomerDTO | null> {
  const dataSource = await ensureDatabaseInitialized();
  const repo = dataSource.getRepository<CustomerEntity>('Customer');

  const customer = await repo
    .createQueryBuilder('customer')
    .where('customer.id = :id', { id: customerId })
    .andWhere('customer.organization_id = :organizationId', { organizationId })
    .getOne();

  if (!customer || !customer.deletedAt) {
    return null;
  }

  await repo.update(
    { id: customerId },
    { deletedAt: null }
  );

  const result = await repo
    .createQueryBuilder('customer')
    .leftJoinAndSelect('customer.assignedTo', 'assignedTo')
    .where('customer.id = :id', { id: customerId })
    .getOne();

  return result ? mapCustomer(result) : null;
}
