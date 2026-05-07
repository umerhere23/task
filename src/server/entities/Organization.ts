import { EntitySchema } from 'typeorm';

export interface OrganizationEntity {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export const OrganizationSchema = new EntitySchema<OrganizationEntity>({
  name: 'Organization',
  tableName: 'organizations',
  columns: {
    id: {
      type: String,
      primary: true,
    },
    name: {
      type: String,
      nullable: false,
    },
    slug: {
      type: String,
      unique: true,
      nullable: false,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
  },
});
