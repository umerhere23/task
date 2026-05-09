import { ensureDatabaseInitialized } from '@/server/database';
import { ActivityLogEntity } from '@/server/entities/ActivityLog';

export interface ActivityLogDTO {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  organizationId: string;
  metadata?: any;
  timestamp: string;
}

export interface CreateActivityLogDTO {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  organizationId: string;
  metadata?: any;
}

function mapActivityLog(row: any): ActivityLogDTO {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    performedBy: row.performed_by,
    performedByName: row.performed_by_name,
    organizationId: row.organization_id,
    metadata: row.metadata,
    timestamp: row.timestamp.toISOString(),
  };
}

export async function logActivityModel(
  entityType: string,
  entityId: string,
  action: string,
  performedBy: string,
  performedByName: string,
  organizationId: string,
  metadata?: any
): Promise<ActivityLogDTO> {
  const dataSource = await ensureDatabaseInitialized();

  const result = await dataSource.query(
    `INSERT INTO activity_logs (id, entity_type, entity_id, action, performed_by, performed_by_name, organization_id, metadata, timestamp)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING id, entity_type, entity_id, action, performed_by, performed_by_name, organization_id, metadata, timestamp`,
    [entityType, entityId, action, performedBy, performedByName, organizationId, metadata ? JSON.stringify(metadata) : null]
  );

  return mapActivityLog(result[0]);
}

export async function getActivityLogsModel(
  organizationId: string,
  entityType?: string,
  entityId?: string,
  performedBy?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: ActivityLogDTO[]; total: number; pages: number }> {
  const dataSource = await ensureDatabaseInitialized();

  // Build WHERE conditions
  const conditions: string[] = ['organization_id = $1'];
  const params: any[] = [organizationId];
  let paramIndex = 2;

  if (entityType) {
    conditions.push(`entity_type = $${paramIndex}`);
    params.push(entityType);
    paramIndex++;
  }

  if (entityId) {
    conditions.push(`entity_id = $${paramIndex}`);
    params.push(entityId);
    paramIndex++;
  }

  if (performedBy) {
    conditions.push(`performed_by = $${paramIndex}`);
    params.push(performedBy);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await dataSource.query(
    `SELECT COUNT(*) as total FROM activity_logs WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0].total, 10);

  // Get paginated results
  const offset = (page - 1) * limit;
  const result = await dataSource.query(
    `SELECT id, entity_type, entity_id, action, performed_by, performed_by_name, organization_id, metadata, timestamp
     FROM activity_logs 
     WHERE ${whereClause}
     ORDER BY timestamp DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const pages = Math.ceil(total / limit);

  return {
    data: result.map(mapActivityLog),
    total,
    pages,
  };
}

export async function getCustomerActivityLogsModel(
  customerId: string,
  organizationId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: ActivityLogDTO[]; total: number; pages: number }> {
  return getActivityLogsModel(organizationId, 'customer', customerId, undefined, page, limit);
}

export async function getUserActivityLogsModel(
  userId: string,
  organizationId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: ActivityLogDTO[]; total: number; pages: number }> {
  return getActivityLogsModel(organizationId, undefined, undefined, userId, page, limit);
}
