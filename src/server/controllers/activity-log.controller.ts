import { NextRequest, NextResponse } from 'next/server';
import { 
  getActivityLogsModel, 
  getCustomerActivityLogsModel, 
  getUserActivityLogsModel 
} from '@/server/models/activity-log.model';
import { HttpError } from '@/server/middleware/http.middleware';

export async function getActivityLogsController(request: NextRequest): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
  const entityType = request.nextUrl.searchParams.get('entityType') || undefined;
  const entityId = request.nextUrl.searchParams.get('entityId') || undefined;
  const performedBy = request.nextUrl.searchParams.get('performedBy') || undefined;

  const result = await getActivityLogsModel(
    organizationId,
    entityType,
    entityId,
    performedBy,
    page,
    limit
  );

  return NextResponse.json(result, { status: 200 });
}

export async function getCustomerActivityLogsController(request: NextRequest, { params }: { params: { customerId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  const customerId = params.customerId;

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!customerId) {
    throw new HttpError('Customer ID is required', 400);
  }

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);

  const result = await getCustomerActivityLogsModel(
    customerId,
    organizationId,
    page,
    limit
  );

  return NextResponse.json(result, { status: 200 });
}

export async function getUserActivityLogsController(request: NextRequest, { params }: { params: { userId: string } }): Promise<NextResponse> {
  let organizationId = request.headers.get('x-org-id');
  const userId = params.userId;

  // Fallback for development
  if (!organizationId && process.env.NODE_ENV === 'development') {
    organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
  }

  if (!organizationId) {
    throw new HttpError('Organization ID is required', 400);
  }

  if (!userId) {
    throw new HttpError('User ID is required', 400);
  }

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);

  const result = await getUserActivityLogsModel(
    userId,
    organizationId,
    page,
    limit
  );

  return NextResponse.json(result, { status: 200 });
}
