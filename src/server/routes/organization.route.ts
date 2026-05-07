import {
  createOrganizationController,
  getOrganizationController,
  loginOrganizationController,
  forgotPasswordController,
} from '@/server/controllers/organization.controller';
import { withErrorHandling } from '@/server/middleware/http.middleware';

export const organizationRoutes = {
  POST: withErrorHandling(createOrganizationController),
  GET: withErrorHandling(getOrganizationController),
};

export const organizationLoginRoutes = {
  POST: withErrorHandling(loginOrganizationController),
};

export const organizationForgotPasswordRoutes = {
  POST: withErrorHandling(forgotPasswordController),
};
