import { ensureDatabaseInitialized } from '@/server/database';
import crypto from 'crypto';
import { OrganizationEntity } from '@/server/entities/Organization';
import { UserEntity } from '@/server/entities/User';
import { OrganizationDTO, UserDTO } from '@/types';
import { encodePassword, decodeAndVerifyPassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';

interface CreateOrganizationInput {
  name: string;
  slug: string;
}

interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ForgotPasswordInput {
  slug: string;
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

    const hashedPassword = encodePassword(adminInput.password);

    const admin = await userRepo.save(
      userRepo.create({
        id: crypto.randomUUID(),
        name: adminInput.name,
        email: adminInput.email,
        password: hashedPassword,
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

export async function loginUserModel(
  input: LoginInput
): Promise<{ organization: OrganizationDTO; user: UserDTO; token: string } | null> {
  const dataSource = await ensureDatabaseInitialized();
  const organizationRepo = dataSource.getRepository<OrganizationEntity>('Organization');
  const userRepo = dataSource.getRepository<UserEntity>('User');

  // Find user by email (email is unique across all organizations)
  const user = await userRepo.findOne({
    where: { email: input.email },
    relations: ['organization'],
  });

  if (!user) {
    return null;
  }

  // Verify password
  const isPasswordValid = decodeAndVerifyPassword(input.password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  // Get organization
  const organization = await organizationRepo.findOne({
    where: { id: user.organizationId },
  });

  if (!organization) {
    return null;
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  return {
    organization: mapOrganization(organization),
    user: mapUser(user),
    token,
  };
}

export async function forgotPasswordModel(
  input: ForgotPasswordInput
): Promise<{ organization: OrganizationDTO; user: Omit<UserDTO, 'id'> } | null> {
  const dataSource = await ensureDatabaseInitialized();
  const organizationRepo = dataSource.getRepository<OrganizationEntity>('Organization');
  const userRepo = dataSource.getRepository<UserEntity>('User');

  // Find organization
  const organization = await organizationRepo.findOne({ where: { slug: input.slug } });
  if (!organization) {
    return null;
  }

  // Find user in organization
  const user = await userRepo.findOne({
    where: {
      email: input.email,
      organizationId: organization.id,
    },
  });

  if (!user) {
    return null;
  }

  // Return user details without sensitive information (password not included in mapUser)
  return {
    organization: mapOrganization(organization),
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      createdAt: user.createdAt.toISOString(),
    },
  };
}
