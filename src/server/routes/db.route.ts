import { getDatabaseStatusController } from '@/server/controllers/db.controller';
import { withErrorHandling } from '@/server/middleware/http.middleware';

export const dbRoutes = {
  GET: withErrorHandling(getDatabaseStatusController),
};
