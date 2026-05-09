import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { OrganizationSchema } from '@/server/entities/Organization';
import { UserSchema } from '@/server/entities/User';
import { CustomerSchema } from '@/server/entities/Customer';
import { NoteEntity } from '@/server/entities/Note';
import { ActivityLogEntity } from '@/server/entities/ActivityLog';

const synchronize = (process.env.DB_SYNCHRONIZE || 'true') === 'true';
const logging = (process.env.DB_LOGGING || 'false') === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'crm_db',
  entities: [OrganizationSchema, UserSchema, CustomerSchema, NoteEntity, ActivityLogEntity],
  synchronize,
  logging,
});

let initPromise: Promise<DataSource> | null = null;

export async function ensureDatabaseInitialized(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!initPromise) {
    initPromise = AppDataSource.initialize()
      .then(() => {
        console.log('Database connected successfully');
        return AppDataSource;
      })
      .catch((error) => {
        console.error('Database connection failed:', error);
        console.error('Database config:', {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          username: process.env.DB_USER,
          database: process.env.DB_NAME,
        });
        initPromise = null; // Reset promise to allow retry
        throw error;
      });
  }

  return initPromise;
}
