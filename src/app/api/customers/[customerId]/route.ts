import { customerDetailRoutes } from '@/server/routes/customer.route';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  return customerDetailRoutes.GET(request);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  return customerDetailRoutes.PUT(request);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  return customerDetailRoutes.DELETE(request);
}
