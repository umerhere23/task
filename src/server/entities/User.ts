import { EntitySchema } from 'typeorm';
import { OrganizationEntity } from '@/server/entities/Organization';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  organizationId: string;
  createdAt: Date;
  organization?: OrganizationEntity;
}

export const UserSchema = new EntitySchema<UserEntity>({
  name: 'User',
  tableName: 'users',
  indices: [
    {
      name: 'IDX_users_organization_id',
      columns: ['organizationId'],
    },
    {
      name: 'IDX_users_organization_role',
      columns: ['organizationId', 'role'],
    },
    {
      name: 'IDX_users_organization_created_at',
      columns: ['organizationId', 'createdAt'],
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
      unique: true,
      nullable: false,
    },
    password: {
      type: String,
      nullable: false,
    },
    role: {
      type: String,
      nullable: false,
    },
    organizationId: {
      name: 'organization_id',
      type: String,
      nullable: false,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
  },
  relations: {
    organization: {
      type: 'many-to-one',
      target: 'Organization',
      joinColumn: {
        name: 'organization_id',
      },
      onDelete: 'CASCADE',
    },
  },
});
