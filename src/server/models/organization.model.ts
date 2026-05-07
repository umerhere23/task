import { ensureDatabaseInitialized } from '@/server/database';
import { OrganizationEntity } from '@/server/entities/Organization';
import { UserEntity } from '@/server/entities/User';
import { OrganizationDTO, UserDTO } from '@/types';

interface CreateOrganizationInput {
  name: string;
  slug: string;
}

interface CreateAdminInput {
  name: string;
  email: string;
}

function mapOrganization(row: OrganizationEntity): OrganizationDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt.toISOString(),
  };
}

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

export async function findOrganizationBySlugModel(slug: string): Promise<OrganizationDTO | null> {
  const dataSource = await ensureDatabaseInitialized();
  const repo = dataSource.getRepository<OrganizationEntity>('Organization');
  const row = await repo.findOne({ where: { slug } });
  return row ? mapOrganization(row) : null;
}

export async function createOrganizationWithAdminModel(
  organizationInput: CreateOrganizationInput,
  adminInput: CreateAdminInput
): Promise<{ organization: OrganizationDTO; admin: UserDTO }> {
  const dataSource = await ensureDatabaseInitialized();

  return dataSource.transaction(async (manager) => {
    const organizationRepo = manager.getRepository<OrganizationEntity>('Organization');
    const userRepo = manager.getRepository<UserEntity>('User');

    const organization = await organizationRepo.save(
      organizationRepo.create({
        id: crypto.randomUUID(),
        name: organizationInput.name,
        slug: organizationInput.slug,
      })
    );

    const admin = await userRepo.save(
      userRepo.create({
        id: crypto.randomUUID(),
        name: adminInput.name,
        email: adminInput.email,
        role: 'admin',
        organizationId: organization.id,
      })
    );

    return {
      organization: mapOrganization(organization),
      admin: mapUser(admin),
    };
  });
}
