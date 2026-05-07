import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { OrganizationSchema } from '@/server/entities/Organization';
import { UserSchema } from '@/server/entities/User';

const synchronize = (process.env.DB_SYNCHRONIZE || 'true') === 'true';
const logging = (process.env.DB_LOGGING || 'false') === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'crm_db',
  entities: [OrganizationSchema, UserSchema],
  synchronize,
  logging,
});

let initPromise: Promise<DataSource> | null = null;

export async function ensureDatabaseInitialized(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!initPromise) {
    initPromise = AppDataSource.initialize();
  }

  return initPromise;
}
