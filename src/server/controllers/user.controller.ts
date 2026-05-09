import { NextRequest, NextResponse } from 'next/server';
import { QueryFailedError } from 'typeorm';
import { HttpError, parseJsonBody } from '@/server/middleware/http.middleware';
import { createUserModel, deleteUserModel, listUsersModel, updateUserModel } from '@/server/models/user.model';

export async function listUsersController(request: NextRequest): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  
  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }
  
  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  const search = request.nextUrl.searchParams.get('search') || undefined;
  const users = await listUsersModel(organizationId, search);

  return NextResponse.json(users, { status: 200 });
}

export async function createUserController(request: NextRequest): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userRole = request.headers.get('x-user-role');

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }
  if (!userRole && process.env.NODE_ENV === 'development') {
    userRole = 'admin';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (userRole !== 'admin') {
    throw new HttpError('Only admins can create users', 403);
  }

  const body = await parseJsonBody<unknown>(request);
  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required', 400);
  }

  const { name, email, password, role } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string') {
    throw new HttpError('User name is required', 400);
  }

  if (!email || typeof email !== 'string') {
    throw new HttpError('User email is required', 400);
  }

  if (!password || typeof password !== 'string') {
    throw new HttpError('Password is required', 400);
  }

  try {
    const user = await createUserModel(organizationId, {
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'member',
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof QueryFailedError) {
      throw new HttpError('User email already exists', 409);
    }

    throw error;
  }
}

export async function updateUserController(request: NextRequest, { params }: { params: { userId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userRole = request.headers.get('x-user-role');
  const userId = params.userId;

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }
  if (!userRole && process.env.NODE_ENV === 'development') {
    userRole = 'admin';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (userRole !== 'admin') {
    throw new HttpError('Only admins can update users', 403);
  }

  if (!userId) {
    throw new HttpError('User ID is required', 400);
  }

  const body = await parseJsonBody<unknown>(request);
  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required', 400);
  }

  const { name, email, role } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string') {
    throw new HttpError('User name is required', 400);
  }

  if (!email || typeof email !== 'string') {
    throw new HttpError('User email is required', 400);
  }

  try {
    const user = await updateUserModel(userId, organizationId, {
      name,
      email,
      role: role === 'admin' ? 'admin' : 'member',
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof QueryFailedError) {
      throw new HttpError('User email already exists', 409);
    }

    throw error;
  }
}

export async function deleteUserController(request: NextRequest, { params }: { params: { userId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userRole = request.headers.get('x-user-role');
  const userId = params.userId;

  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }
  if (!userRole && process.env.NODE_ENV === 'development') {
    userRole = 'admin';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (userRole !== 'admin') {
    throw new HttpError('Only admins can delete users', 403);
  }

  if (!userId) {
    throw new HttpError('User ID is required', 400);
  }

  const deleted = await deleteUserModel(userId, organizationId);

  if (!deleted) {
    throw new HttpError('User not found', 404);
  }

  return NextResponse.json({}, { status: 200 });
}
