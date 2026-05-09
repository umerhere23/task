import { NextRequest, NextResponse } from 'next/server';
import { addNoteModel, getNotesModel, deleteNoteModel } from '@/server/models/note.model';
import { HttpError, parseJsonBody } from '@/server/middleware/http.middleware';
import { ActivityLogger } from '@/lib/activity-logger';

export async function getNotesController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userId = request.headers.get('x-user-id');
  let userName = request.headers.get('x-user-name');
  const customerId = params.customerId;

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
    userId = userId || 'dev-user';
    userName = userName || 'Development User';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  const notes = await getNotesModel(customerId, organizationId);

  return NextResponse.json(notes, { status: 200 });
}

export async function addNoteController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userId = request.headers.get('x-user-id');
  let userName = request.headers.get('x-user-name');
  const customerId = params.customerId;

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
    userId = userId || 'dev-user';
    userName = userName || 'Development User';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  if (!userId || !userName) {
    throw new HttpError('User information is required', 400);
  }

  const body = await parseJsonBody<unknown>(request);

  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required', 400);
  }

  const { content } = body as Record<string, unknown>;

  if (!content || typeof content !== 'string') {
    throw new HttpError('Note content is required', 400);
  }

  if (content.trim().length === 0) {
    throw new HttpError('Note content cannot be empty', 400);
  }

  const note = await addNoteModel(
    customerId,
    organizationId,
    userId,
    userName,
    content.trim()
  );

  // Log activity
  await ActivityLogger.logNoteAdded(
    note.id,
    customerId,
    userId,
    userName,
    organizationId,
    content
  );

  return NextResponse.json(note, { status: 201 });
}

export async function deleteNoteController(request: NextRequest, { params }: { params: { noteId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  const noteId = params.noteId;

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!noteId) {
    throw new HttpError('Note ID is required', 400);
  }

  const deleted = await deleteNoteModel(noteId, organizationId);

  if (!deleted) {
    throw new HttpError('Note not found', 404);
  }

  return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
}
