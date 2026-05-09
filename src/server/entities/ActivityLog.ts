import { EntitySchema } from 'typeorm';

export const ActivityLogEntity = new EntitySchema({
  name: 'ActivityLog',
  tableName: 'activity_logs',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    entityType: {
      type: 'varchar',
      length: 50,
      name: 'entity_type',
    },
    entityId: {
      type: 'uuid',
      name: 'entity_id',
    },
    action: {
      type: 'varchar',
      length: 50,
      name: 'action',
    },
    performedBy: {
      type: 'uuid',
      name: 'performed_by',
    },
    performedByName: {
      type: 'varchar',
      length: 255,
      name: 'performed_by_name',
    },
    organizationId: {
      type: 'uuid',
      name: 'organization_id',
    },
    metadata: {
      type: 'jsonb',
      nullable: true,
      name: 'metadata',
    },
    timestamp: {
      type: 'timestamp',
      createDate: true,
      name: 'timestamp',
    },
  },
  indices: [
    {
      name: 'IDX_ACTIVITY_LOG_ENTITY_TYPE_ID',
      columns: ['entityType', 'entityId'],
    },
    {
      name: 'IDX_ACTIVITY_LOG_PERFORMED_BY',
      columns: ['performedBy'],
    },
    {
      name: 'IDX_ACTIVITY_LOG_ORGANIZATION_ID',
      columns: ['organizationId'],
    },
    {
      name: 'IDX_ACTIVITY_LOG_TIMESTAMP',
      columns: ['timestamp'],
    },
    {
      name: 'IDX_ACTIVITY_LOG_ORGANIZATION_TIMESTAMP',
      columns: ['organizationId', 'timestamp'],
    },
  ],
});
