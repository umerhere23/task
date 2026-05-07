import {
  listCustomersController,
  getCustomerController,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
  assignCustomerController,
  restoreCustomerController,
} from '@/server/controllers/customer.controller';
import { withErrorHandling } from '@/server/middleware/http.middleware';
import { NextRequest, NextResponse } from 'next/server';

const wrappedGetDetail = (handler: (req: NextRequest, opts: { params: { customerId: string } }) => Promise<NextResponse>) =>
  withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return handler(req, { params: { customerId } });
  });

const wrappedPutDetail = (handler: (req: NextRequest, opts: { params: { customerId: string } }) => Promise<NextResponse>) =>
  withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return handler(req, { params: { customerId } });
  });

const wrappedDeleteDetail = (handler: (req: NextRequest, opts: { params: { customerId: string } }) => Promise<NextResponse>) =>
  withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return handler(req, { params: { customerId } });
  });

const wrappedAssign = (handler: (req: NextRequest, opts: { params: { customerId: string } }) => Promise<NextResponse>) =>
  withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return handler(req, { params: { customerId } });
  });

const wrappedRestore = (handler: (req: NextRequest, opts: { params: { customerId: string } }) => Promise<NextResponse>) =>
  withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return handler(req, { params: { customerId } });
  });

export const customerRoutes = {
  GET: withErrorHandling(listCustomersController),
  POST: withErrorHandling(createCustomerController),
};

export const customerDetailRoutes = {
  GET: wrappedGetDetail(getCustomerController),
  PUT: wrappedPutDetail(updateCustomerController),
  DELETE: wrappedDeleteDetail(deleteCustomerController),
};

export const customerAssignRoutes = {
  POST: wrappedAssign(assignCustomerController),
};

export const customerRestoreRoutes = {
  POST: wrappedRestore(restoreCustomerController),
};
