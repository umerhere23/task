import { z } from 'zod';
import { QueryFailedError } from 'typeorm';
import {
  createOrganizationWithAdmin,
  findOrganizationBySlug,
} from '@/lib/db';
import { OrganizationDTO, UserDTO } from '@/types';

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

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export class OrganizationServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'OrganizationServiceError';
    this.statusCode = statusCode;
  }
}

interface CreateOrganizationResult {
  organization: OrganizationDTO;
  admin: UserDTO;
}

export async function createOrganization(input: unknown): Promise<CreateOrganizationResult> {
  const parsed = createOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    throw new OrganizationServiceError(parsed.error.issues[0]?.message || 'Invalid payload', 400);
  }

  const data = parsed.data;

  const existing = await findOrganizationBySlug(data.slug);
  if (existing) {
    throw new OrganizationServiceError('Organization slug already exists', 409);
  }

  try {
    return await createOrganizationWithAdmin(
      {
        name: data.name,
        slug: data.slug,
      },
      {
        name: data.adminName,
        email: data.adminEmail,
        role: 'admin',
      }
    );
  } catch (error: unknown) {
    if (error instanceof QueryFailedError) {
      throw new OrganizationServiceError('Unable to create organization due to database constraint', 409);
    }
    throw error;
  }
}

export async function getOrganizationBySlug(slugInput: unknown): Promise<OrganizationDTO> {
  const slugSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(80);

  const parsed = slugSchema.safeParse(slugInput);
  if (!parsed.success) {
    throw new OrganizationServiceError('Invalid organization slug', 400);
  }

  const organization = await findOrganizationBySlug(parsed.data);
  if (!organization) {
    throw new OrganizationServiceError('Organization not found', 404);
  }

  return organization;
}
