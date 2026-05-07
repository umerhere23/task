import { EntitySchema } from 'typeorm';
import { OrganizationEntity } from '@/server/entities/Organization';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  createdAt: Date;
  organization?: OrganizationEntity;
}

export const UserSchema = new EntitySchema<UserEntity>({
  name: 'User',
  tableName: 'users',
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
