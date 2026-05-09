import { withErrorHandling } from '@/server/middleware/http.middleware';
import { NextRequest } from 'next/server';
import { 
  getActivityLogsController, 
  getCustomerActivityLogsController, 
  getUserActivityLogsController 
} from '@/server/controllers/activity-log.controller';

export const activityLogRoutes = {
  GET: withErrorHandling(getActivityLogsController),
};

export const customerActivityLogRoutes = {
  GET: withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return getCustomerActivityLogsController(req, { params: { customerId } });
  }),
};

export const userActivityLogRoutes = {
  GET: withErrorHandling(async (req: NextRequest) => {
    const userId = req.nextUrl.pathname.split('/')[3];
    return getUserActivityLogsController(req, { params: { userId } });
  }),
};
