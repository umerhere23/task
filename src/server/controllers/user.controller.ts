import { NextRequest, NextResponse } from 'next/server';
import { QueryFailedError } from 'typeorm';
import { HttpError, parseJsonBody } from '@/server/middleware/http.middleware';
import { createUserModel, listUsersModel } from '@/server/models/user.model';

export async function listUsersController(request: NextRequest): Promise<NextResponse> {
  const organizationId = request.headers.get('x-org-id');
  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  const search = request.nextUrl.searchParams.get('search') || undefined;
  const users = await listUsersModel(organizationId, search);

  return NextResponse.json(users, { status: 200 });
}

export async function createUserController(request: NextRequest): Promise<NextResponse> {
  const organizationId = request.headers.get('x-org-id');
  const userRole = request.headers.get('x-user-role');

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
