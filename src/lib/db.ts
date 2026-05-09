import { QueryFailedError } from 'typeorm';
import crypto from 'crypto';
import { ensureDatabaseInitialized } from '@/server/database';
import { OrganizationEntity } from '@/server/entities/Organization';
import { UserEntity } from '@/server/entities/User';
import { OrganizationDTO, UserDTO } from '@/types';

interface CreateOrganizationInput {
  name: string;
  slug: string;
}

interface CreateUserInput {
  name: string;
  email: string;
  role: string;
  organizationId: string;
}

interface DbStatus {
  connected: boolean;
  synchronizeEnabled: boolean;
  database: string;
  entities: string[];
  tablesInDatabase: string[];
  missingTables: string[];
  message: string;
}

function toIsoString(value: Date): string {
  return value.toISOString();
}

function mapOrganization(row: OrganizationEntity): OrganizationDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: toIsoString(row.createdAt),
  };
}

function mapUser(row: UserEntity): UserDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    organizationId: row.organizationId,
    createdAt: toIsoString(row.createdAt),
  };
}

export async function createOrganizationRecord(input: CreateOrganizationInput): Promise<OrganizationDTO> {
  const dataSource = await ensureDatabaseInitialized();
  const organizationRepo = dataSource.getRepository<OrganizationEntity>('Organization');
  const organization = organizationRepo.create({
    id: crypto.randomUUID(),
    name: input.name,
    slug: input.slug,
  });
  const saved = await organizationRepo.save(organization);
  return mapOrganization(saved);
}

export async function createUserRecord(input: CreateUserInput): Promise<UserDTO> {
  const dataSource = await ensureDatabaseInitialized();
  const userRepo = dataSource.getRepository<UserEntity>('User');
  const user = userRepo.create({
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role,
    organizationId: input.organizationId,
  });
  const saved = await userRepo.save(user);
  return mapUser(saved);
}

export async function findOrganizationBySlug(slug: string): Promise<OrganizationDTO | null> {
  const dataSource = await ensureDatabaseInitialized();
  const organizationRepo = dataSource.getRepository<OrganizationEntity>('Organization');
  const row = await organizationRepo.findOne({ where: { slug } });
  if (!row) {
    return null;
  }

  return mapOrganization(row);
}

export async function createOrganizationWithAdmin(
  organizationInput: CreateOrganizationInput,
  adminInput: Omit<CreateUserInput, 'organizationId'>
): Promise<{ organization: OrganizationDTO; admin: UserDTO }> {
  const dataSource = await ensureDatabaseInitialized();

  try {
    const result = await dataSource.transaction(async (manager) => {
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
          role: adminInput.role,
          organizationId: organization.id,
        })
      );

      return {
        organization: mapOrganization(organization),
        admin: mapUser(admin),
      };
    });

    return result;
  } catch (error: unknown) {
    if (error instanceof QueryFailedError) {
      throw error;
    }
    throw error;
  }
}

export async function getDatabaseStatus(): Promise<DbStatus> {
  const dataSource = await ensureDatabaseInitialized();

  const entities = dataSource.entityMetadatas.map((metadata) => metadata.tableName);
  const rows = await dataSource.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
  );

  const tablesInDatabase = (rows as Array<{ table_name: string }>).map((row) => row.table_name);
  const missingTables = entities.filter((table) => !tablesInDatabase.includes(table));

  return {
    connected: dataSource.isInitialized,
    synchronizeEnabled: Boolean(dataSource.options.synchronize),
    database: String(dataSource.options.database || ''),
    entities,
    tablesInDatabase,
    missingTables,
    message:
      missingTables.length === 0
        ? 'Database connected and all entity schemas are synced.'
        : `Database connected, but missing tables: ${missingTables.join(', ')}`,
  };
}
