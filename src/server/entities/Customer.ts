import { EntitySchema } from 'typeorm';
import { UserEntity } from '@/server/entities/User';

export interface CustomerEntity {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organizationId: string;
  assignedToId: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  assignedTo?: UserEntity;
}

export const CustomerSchema = new EntitySchema<CustomerEntity>({
  name: 'Customer',
  tableName: 'customers',
  columns: {
    id: {
      type: String,
      primary: true,
    },
    name: {
      type: String,
      nullable: false,
    },
    email: {
      type: String,
      nullable: false,
    },
    phone: {
      type: String,
      nullable: true,
    },
    organizationId: {
      name: 'organization_id',
      type: String,
      nullable: false,
    },
    assignedToId: {
      name: 'assigned_to_id',
      type: String,
      nullable: true,
    },
    deletedAt: {
      name: 'deleted_at',
      type: 'timestamptz',
      nullable: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
  },
  relations: {
    assignedTo: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'assigned_to_id',
      },
      onDelete: 'SET NULL',
    },
  },
});
