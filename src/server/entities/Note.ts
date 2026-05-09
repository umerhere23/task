import { EntitySchema } from 'typeorm';

export const NoteEntity = new EntitySchema({
  name: 'Note',
  tableName: 'notes',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    content: {
      type: 'text',
      name: 'content',
    },
    customerId: {
      type: 'uuid',
      name: 'customer_id',
    },
    organizationId: {
      type: 'uuid',
      name: 'organization_id',
    },
    createdByUserId: {
      type: 'uuid',
      name: 'created_by_user_id',
    },
    createdByName: {
      type: 'varchar',
      length: 255,
      name: 'created_by_name',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at',
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
      name: 'updated_at',
    },
  },
  indices: [
    {
      name: 'IDX_NOTE_CUSTOMER_ID',
      columns: ['customerId'],
    },
    {
      name: 'IDX_NOTE_ORGANIZATION_ID',
      columns: ['organizationId'],
    },
    {
      name: 'IDX_NOTE_CREATED_BY_USER_ID',
      columns: ['createdByUserId'],
    },
    {
      name: 'IDX_NOTE_CREATED_AT',
      columns: ['createdAt'],
    },
  ],
});
