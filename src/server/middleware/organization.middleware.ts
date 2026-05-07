import { z } from 'zod';
import { HttpError } from '@/server/middleware/http.middleware';

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
