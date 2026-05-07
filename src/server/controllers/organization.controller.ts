import { NextRequest, NextResponse } from 'next/server';
import {
  createOrganizationWithAdminModel,
  findOrganizationBySlugModel,
} from '@/server/models/organization.model';
import {
  validateCreateOrganizationPayload,
  validateOrganizationSlug,
} from '@/server/middleware/organization.middleware';
import { HttpError, parseJsonBody } from '@/server/middleware/http.middleware';

export async function createOrganizationController(request: NextRequest): Promise<NextResponse> {
  const body = await parseJsonBody<unknown>(request);
  const payload = validateCreateOrganizationPayload(body);

  const existing = await findOrganizationBySlugModel(payload.slug);
  if (existing) {
    throw new HttpError('Organization slug already exists', 409);
  }

  const result = await createOrganizationWithAdminModel(
    {
      name: payload.name,
      slug: payload.slug,
    },
    {
      name: payload.adminName,
      email: payload.adminEmail,
    }
  );

  return NextResponse.json(result, { status: 201 });
}

export async function getOrganizationController(request: NextRequest): Promise<NextResponse> {
  const slug = validateOrganizationSlug(request.nextUrl.searchParams.get('slug'));
  const organization = await findOrganizationBySlugModel(slug);

  if (!organization) {
    throw new HttpError('Organization not found', 404);
  }

  return NextResponse.json(organization, { status: 200 });
}
