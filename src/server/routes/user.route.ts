import { withErrorHandling } from '@/server/middleware/http.middleware';
import { createUserController, listUsersController } from '@/server/controllers/user.controller';

export const userRoutes = {
  GET: withErrorHandling(listUsersController),
  POST: withErrorHandling(createUserController),
};
