import { z } from 'zod';
import { HttpError } from '@/server/middleware/http.middleware';

const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters')
  .max(120)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)');

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(80),
  adminName: z.string().trim().min(2).max(120),
  adminEmail: z.string().trim().email().max(254),
  adminPassword: passwordSchema,
});

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]+$/)
  .min(2)
  .max(80);

export type CreateOrganizationPayload = z.infer<typeof createOrganizationSchema>;

export function validateCreateOrganizationPayload(payload: unknown): CreateOrganizationPayload {
  const parsed = createOrganizationSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(parsed.error.issues[0]?.message || 'Invalid payload', 400);
  }
  return parsed.data;
}

export function validateOrganizationSlug(slug: string | null): string {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new HttpError('Invalid organization slug', 400);
  }
  return parsed.data;
}

const loginOrganizationSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1, 'Password is required'),
});

export type LoginOrganizationPayload = z.infer<typeof loginOrganizationSchema>;

export function validateLoginOrganizationPayload(payload: unknown): LoginOrganizationPayload {
  const parsed = loginOrganizationSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(parsed.error.issues[0]?.message || 'Invalid payload', 400);
  }
  return parsed.data;
}

const forgotPasswordSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(80),
  email: z.string().trim().email().max(254),
});

export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;

export function validateForgotPasswordPayload(payload: unknown): ForgotPasswordPayload {
  const parsed = forgotPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(parsed.error.issues[0]?.message || 'Invalid payload', 400);
  }
  return parsed.data;
}
