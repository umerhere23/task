import {
  createOrganizationController,
  getOrganizationController,
} from '@/server/controllers/organization.controller';
import { withErrorHandling } from '@/server/middleware/http.middleware';

export const organizationRoutes = {
  POST: withErrorHandling(createOrganizationController),
  GET: withErrorHandling(getOrganizationController),
};
