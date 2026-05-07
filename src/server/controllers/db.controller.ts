import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStatusModel } from '@/server/models/db.model';
import { validateDbStatusRequest } from '@/server/middleware/db.middleware';

export async function getDatabaseStatusController(request: NextRequest): Promise<NextResponse> {
  validateDbStatusRequest(request);
  const status = await getDatabaseStatusModel();
  return NextResponse.json(status, { status: 200 });
}
