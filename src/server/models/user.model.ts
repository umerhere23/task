import { ensureDatabaseInitialized } from '@/server/database';
import { UserEntity } from '@/server/entities/User';
import { CreateUserDTO, UserDTO, UserListDTO } from '@/types';
import { encodePassword } from '@/lib/password';

function mapUser(row: UserEntity): UserDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    organizationId: row.organizationId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listUsersModel(organizationId: string, search?: string): Promise<UserListDTO[]> {
  const dataSource = await ensureDatabaseInitialized();
  const userRepo = dataSource.getRepository<UserEntity>('User');

  const query = userRepo
    .createQueryBuilder('user')
    .leftJoin(
      'Customer',
      'customer',
      'customer.assigned_to_id = user.id AND customer.organization_id = user.organization_id AND customer.deleted_at IS NULL'
    )
    .select('user.id', 'user_id')
    .addSelect('user.name', 'user_name')
    .addSelect('user.email', 'user_email')
    .addSelect('user.role', 'user_role')
    .addSelect('user.organization_id', 'user_organization_id')
    .addSelect('user.created_at', 'user_created_at')
    .addSelect('COUNT(customer.id)', 'assignedCustomerCount')
    .where('user.organization_id = :organizationId', { organizationId })
    .groupBy('user.id')
    .addGroupBy('user.name')
    .addGroupBy('user.email')
    .addGroupBy('user.role')
    .addGroupBy('user.organization_id')
    .addGroupBy('user.created_at')
    .orderBy("CASE WHEN user.role = 'admin' THEN 0 ELSE 1 END", 'ASC')
    .addOrderBy('user.created_at', 'DESC');

  if (search) {
    query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
      search: `%${search}%`,
    });
  }

  const rows = await query.getRawMany<{
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: string;
    user_organization_id: string;
    user_created_at: string;
    assignedCustomerCount: string;
  }>();

  return rows.map((row) => ({
    id: row.user_id,
    name: row.user_name,
    email: row.user_email,
    role: row.user_role,
    organizationId: row.user_organization_id,
    createdAt: new Date(row.user_created_at).toISOString(),
    assignedCustomerCount: Number(row.assignedCustomerCount || 0),
  }));
}

export async function createUserModel(organizationId: string, input: CreateUserDTO): Promise<UserDTO> {
  const dataSource = await ensureDatabaseInitialized();
  const userRepo = dataSource.getRepository<UserEntity>('User');

  const saved = await userRepo.save(
    userRepo.create({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      password: encodePassword(input.password),
      role: input.role || 'member',
      organizationId,
    })
  );

  return mapUser(saved);
}
