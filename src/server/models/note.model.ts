import { ensureDatabaseInitialized } from '@/server/database';
import { NoteEntity } from '@/server/entities/Note';
import { NoteDTO, CreateNoteDTO } from '@/types';

function mapNote(row: any): NoteDTO {
  return {
    id: row.id,
    content: row.content,
    customerId: row.customer_id,
    organizationId: row.organization_id,
    createdByUserId: row.created_by_user_id,
    createdByName: row.created_by_name,
    createdAt: row.created_at.toISOString(),
  };
}

export async function addNoteModel(
  customerId: string,
  organizationId: string,
  createdByUserId: string,
  createdByName: string,
  content: string
): Promise<NoteDTO> {
  const dataSource = await ensureDatabaseInitialized();

  const result = await dataSource.query(
    `INSERT INTO notes (id, content, customer_id, organization_id, created_by_user_id, created_by_name, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id, content, customer_id, organization_id, created_by_user_id, created_by_name, created_at, updated_at`,
    [content, customerId, organizationId, createdByUserId, createdByName]
  );

  return mapNote(result[0]);
}

export async function updateNoteModel(
  noteId: string,
  organizationId: string,
  content: string
): Promise<NoteDTO | null> {
  const dataSource = await ensureDatabaseInitialized();

  const result = await dataSource.query(
    `UPDATE notes 
     SET content = $1, updated_at = NOW()
     WHERE id = $2 AND organization_id = $3
     RETURNING id, content, customer_id, organization_id, created_by_user_id, created_by_name, created_at, updated_at`,
    [content, noteId, organizationId]
  );

  if (result.length === 0) {
    return null;
  }

  return mapNote(result[0]);
}

export async function getNotesModel(
  customerId: string,
  organizationId: string
): Promise<NoteDTO[]> {
  const dataSource = await ensureDatabaseInitialized();

  const result = await dataSource.query(
    `SELECT id, content, customer_id, organization_id, created_by_user_id, created_by_name, created_at, updated_at
     FROM notes 
     WHERE customer_id = $1 AND organization_id = $2
     ORDER BY created_at DESC`,
    [customerId, organizationId]
  );

  return result.map(mapNote);
}

export async function deleteNoteModel(
  noteId: string,
  organizationId: string
): Promise<boolean> {
  const dataSource = await ensureDatabaseInitialized();

  const result = await dataSource.query(
    `DELETE FROM notes WHERE id = $1 AND organization_id = $2`,
    [noteId, organizationId]
  );

  return result.rowCount > 0;
}

export async function getNotesByUserModel(
  createdByUserId: string,
  organizationId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: NoteDTO[]; total: number; pages: number }> {
  const dataSource = await ensureDatabaseInitialized();

  // Get total count
  const countResult = await dataSource.query(
    `SELECT COUNT(*) as total FROM notes WHERE created_by_user_id = $1 AND organization_id = $2`,
    [createdByUserId, organizationId]
  );
  const total = parseInt(countResult[0].total, 10);

  // Get paginated results
  const offset = (page - 1) * limit;
  const result = await dataSource.query(
    `SELECT id, content, customer_id, organization_id, created_by_user_id, created_by_name, created_at, updated_at
     FROM notes 
     WHERE created_by_user_id = $1 AND organization_id = $2
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [createdByUserId, organizationId, limit, offset]
  );

  const pages = Math.ceil(total / limit);

  return {
    data: result.map(mapNote),
    total,
    pages,
  };
}
