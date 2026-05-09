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
  indices: [
    {
      name: 'IDX_customers_org_deleted',
      columns: ['organizationId', 'deletedAt'],
    },
    {
      name: 'IDX_customers_org_name',
      columns: ['organizationId', 'name'],
    },
    {
      name: 'IDX_customers_org_email',
      columns: ['organizationId', 'email'],
    },
    {
      name: 'IDX_customers_assigned_deleted',
      columns: ['assignedToId', 'deletedAt'],
    },
  ],
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
