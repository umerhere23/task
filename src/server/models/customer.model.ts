import { ensureDatabaseInitialized } from '@/server/database';
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
  };
}

export async function listCustomersModel(
  organizationId: string,
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ data: CustomerListDTO[]; total: number; pages: number }> {
  const dataSource = await ensureDatabaseInitialized();
  const repo = dataSource.getRepository<CustomerEntity>('Customer');

  const query = repo
    .createQueryBuilder('customer')
    .leftJoinAndSelect('customer.assignedTo', 'assignedTo')
    .where('customer.organization_id = :organizationId', { organizationId })
    .andWhere('customer.deleted_at IS NULL');

  if (search) {
    query.andWhere(
      'LOWER(customer.name) ILIKE LOWER(:search) OR LOWER(customer.email) ILIKE LOWER(:search)',
      { search: `%${search}%` }
    );
  }

  const total = await query.getCount();
  const skip = (page - 1) * limit;

  const rows = await query.skip(skip).take(limit).orderBy('customer.created_at', 'DESC').getMany();

  const pages = Math.ceil(total / limit);

  return {
    data: rows.map(mapCustomerList),
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
  const customerRepo = dataSource.getRepository<CustomerEntity>('Customer');
  const userRepo = dataSource.getRepository<UserEntity>('User');

  const customer = await customerRepo
    .createQueryBuilder('customer')
    .where('customer.id = :id', { id: customerId })
    .andWhere('customer.organization_id = :organizationId', { organizationId })
    .andWhere('customer.deleted_at IS NULL')
    .getOne();

  const user = await userRepo.findOne({
    where: {
      id: assignedToId,
      organizationId,
    },
  });

  if (!customer || !user) {
    return null;
  }

  await customerRepo.update(
    { id: customerId },
    { assignedToId }
  );

  const result = await customerRepo
    .createQueryBuilder('customer')
    .leftJoinAndSelect('customer.assignedTo', 'assignedTo')
    .where('customer.id = :id', { id: customerId })
    .getOne();

  return result ? mapCustomer(result) : null;
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
