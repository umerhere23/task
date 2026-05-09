import { NextRequest, NextResponse } from 'next/server';
import {
  listCustomersModel,
  getCustomerModel,
  createCustomerModel,
  updateCustomerModel,
  deleteCustomerModel,
  assignCustomerModel,
  restoreCustomerModel,
} from '@/server/models/customer.model';
import { HttpError, parseJsonBody } from '@/server/middleware/http.middleware';
import { ActivityLogger } from '@/lib/activity-logger';

export async function listCustomersController(request: NextRequest): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  
  // Fallback for development - use first organization if no org-id provided
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
    console.warn('Using fallback organization ID for development');
  }
  
  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
  const search = request.nextUrl.searchParams.get('search') || undefined;
  const includeDeleted = request.nextUrl.searchParams.get('includeDeleted') === 'true';

  const result = await listCustomersModel(organizationId, page, limit, search, includeDeleted);

  return NextResponse.json(result, { status: 200 });
}

export async function getCustomerController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  const customerId = params.customerId;

  // Fallback for development - use first organization if no org-id provided
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
    console.warn('Using fallback organization ID for development');
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  const customer = await getCustomerModel(customerId, organizationId);

  if (!customer) {
    throw new HttpError('Customer not found', 404);
  }

  return NextResponse.json(customer, { status: 200 });
}

export async function createCustomerController(request: NextRequest): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userId = request.headers.get('x-user-id');
  let userName = request.headers.get('x-user-name');
  
  // Fallback for development - use first organization if no org-id provided
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
    userId = userId || 'dev-user';
    userName = userName || 'Development User';
    console.warn('Using fallback organization ID for development');
  }
  
  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  const body = await parseJsonBody<unknown>(request);

  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required', 400);
  }

  const { name, email, phone } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string') {
    throw new HttpError('Customer name is required', 400);
  }

  if (!email || typeof email !== 'string') {
    throw new HttpError('Customer email is required', 400);
  }

  const customer = await createCustomerModel(organizationId, {
    name,
    email,
    phone: typeof phone === 'string' ? phone : undefined,
  });

  // Log activity
  if (userId && userName) {
    await ActivityLogger.logCustomerCreated(
      customer.id,
      userId,
      userName,
      organizationId,
      { name, email, phone }
    );
  }

  return NextResponse.json(customer, { status: 201 });
}

export async function updateCustomerController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userId = request.headers.get('x-user-id');
  let userName = request.headers.get('x-user-name');
  const customerId = params.customerId;

  // Fallback for development - use first organization if no org-id provided
  if (process.env.NODE_ENV === 'development') {
    if (!organizationId) {
      organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
      console.warn('Using fallback organization ID for development');
    }
    if (!userId) {
      userId = 'dev-user';
    }
    if (!userName) {
      userName = 'Development User';
    }
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  const body = await parseJsonBody<unknown>(request);

  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required', 400);
  }

  const { name, email, phone } = body as Record<string, unknown>;

  const customer = await updateCustomerModel(customerId, organizationId, {
    name: typeof name === 'string' ? name : undefined,
    email: typeof email === 'string' ? email : undefined,
    phone: phone !== undefined && typeof phone === 'string' ? phone : undefined,
  });

  if (!customer) {
    throw new HttpError('Customer not found', 404);
  }

  // Log activity
  if (userId && userName) {
    await ActivityLogger.logCustomerUpdated(
      customerId,
      userId,
      userName,
      organizationId,
      { name, email, phone }
    );
  }

  return NextResponse.json(customer, { status: 200 });
}

export async function deleteCustomerController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userId = request.headers.get('x-user-id');
  let userName = request.headers.get('x-user-name');
  const customerId = params.customerId;

  // Fallback for development - use first organization if no org-id provided
  if (process.env.NODE_ENV === 'development') {
    if (!organizationId) {
      organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
      console.warn('Using fallback organization ID for development');
    }
    if (!userId) {
      userId = 'dev-user';
    }
    if (!userName) {
      userName = 'Development User';
    }
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  const deleted = await deleteCustomerModel(customerId, organizationId);

  if (!deleted) {
    throw new HttpError('Customer not found', 404);
  }

  // Log activity
  if (userId && userName) {
    await ActivityLogger.logCustomerDeleted(
      customerId,
      userId,
      userName,
      organizationId
    );
  }

  return NextResponse.json({}, { status: 200 });
}

export async function assignCustomerController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userId = request.headers.get('x-user-id');
  let userName = request.headers.get('x-user-name');
  const customerId = params.customerId;

  // Fallback for development - use first organization if no org-id provided
  if (process.env.NODE_ENV === 'development') {
    if (!organizationId) {
      organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
      console.warn('Using fallback organization ID for development');
    }
    if (!userId) {
      userId = 'dev-user';
    }
    if (!userName) {
      userName = 'Development User';
    }
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  const body = await parseJsonBody<unknown>(request);

  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required', 400);
  }

  const { assignedToId } = body as Record<string, unknown>;

  if (!assignedToId || typeof assignedToId !== 'string') {
    throw new HttpError('Assigned user ID is required', 400);
  }

  try {
    const customer = await assignCustomerModel(customerId, organizationId, assignedToId);

    if (!customer) {
      throw new HttpError('Customer or user not found', 404);
    }

    // Log activity
    if (userId && userName) {
      await ActivityLogger.logCustomerAssigned(
        customerId,
        userId,
        userName,
        organizationId,
        assignedToId,
        customer.assignedTo?.name
      );
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error: unknown) {
    // Handle business rule violations
    if (error instanceof Error) {
      if (error.message.includes('maximum active customers')) {
        throw new HttpError(error.message, 409); // Conflict
      }
      if (error.message.includes('Customer or user not found')) {
        throw new HttpError(error.message, 404);
      }
    }
    throw error;
  }
}

export async function restoreCustomerController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  let userId = request.headers.get('x-user-id');
  let userName = request.headers.get('x-user-name');
  const customerId = params.customerId;

  // Fallback for development - use first organization if no org-id provided
  if (process.env.NODE_ENV === 'development') {
    if (!organizationId) {
      organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
      console.warn('Using fallback organization ID for development');
    }
    if (!userId) {
      userId = 'dev-user';
    }
    if (!userName) {
      userName = 'Development User';
    }
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  const customer = await restoreCustomerModel(customerId, organizationId);

  if (!customer) {
    throw new HttpError('Customer not found', 404);
  }

  // Log activity
  if (userId && userName) {
    await ActivityLogger.logCustomerRestored(
      customerId,
      userId,
      userName,
      organizationId
    );
  }

  return NextResponse.json(customer, { status: 200 });
}
