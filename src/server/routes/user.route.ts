import { withErrorHandling } from '@/server/middleware/http.middleware';
import { NextRequest } from 'next/server';
import { createUserController, deleteUserController, listUsersController, updateUserController } from '@/server/controllers/user.controller';

export const userRoutes = {
  GET: withErrorHandling(listUsersController),
  POST: withErrorHandling(createUserController),
};

export const userDetailRoutes = {
  PUT: withErrorHandling(async (req: NextRequest) => {
    const userId = req.nextUrl.pathname.split('/')[3];
    return updateUserController(req, { params: { userId } });
  }),
  DELETE: withErrorHandling(async (req: NextRequest) => {
    const userId = req.nextUrl.pathname.split('/')[3];
    return deleteUserController(req, { params: { userId } });
  }),
};
