import { ensureDatabaseInitialized } from '@/server/database';
import crypto from 'crypto';
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

export async function updateUserModel(
  userId: string,
  organizationId: string,
  input: { name: string; email: string; role: string }
): Promise<UserDTO> {
  const dataSource = await ensureDatabaseInitialized();
  
  // Use raw SQL to update user
  const result = await dataSource.query(
    `UPDATE users 
     SET name = $1, email = $2, role = $3 
     WHERE id = $4 AND organization_id = $5 
     RETURNING id, name, email, role, organization_id, created_at`,
    [input.name, input.email, input.role, userId, organizationId]
  );

  if (result.length === 0) {
    throw new Error('User not found or not in organization');
  }

  const updatedUser = result[0];
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    organizationId: updatedUser.organization_id,
    createdAt: updatedUser.created_at,
  };
}

export async function deleteUserModel(userId: string, organizationId: string): Promise<boolean> {
  const dataSource = await ensureDatabaseInitialized();

  const result = await dataSource.query(
    `DELETE FROM users
     WHERE id = $1 AND organization_id = $2
     RETURNING id`,
    [userId, organizationId]
  );

  return result.length > 0;
}
