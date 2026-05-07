import { NextRequest, NextResponse } from 'next/server';
import {
  createOrganizationWithAdminModel,
  findOrganizationBySlugModel,
  loginUserModel,
  forgotPasswordModel,
} from '@/server/models/organization.model';
import {
  validateCreateOrganizationPayload,
  validateOrganizationSlug,
  validateLoginOrganizationPayload,
  validateForgotPasswordPayload,
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
      password: payload.adminPassword,
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

export async function loginOrganizationController(request: NextRequest): Promise<NextResponse> {
  const body = await parseJsonBody<unknown>(request);
  const payload = validateLoginOrganizationPayload(body);

  const result = await loginUserModel({
    email: payload.email,
    password: payload.password,
  });

  if (!result) {
    throw new HttpError('Invalid email or password', 401);
  }

  return NextResponse.json(result, { status: 200 });
}

export async function forgotPasswordController(request: NextRequest): Promise<NextResponse> {
  const body = await parseJsonBody<unknown>(request);
  const payload = validateForgotPasswordPayload(body);

  const result = await forgotPasswordModel({
    slug: payload.slug,
    email: payload.email,
  });

  if (!result) {
    throw new HttpError('Organization or user not found', 404);
  }

  return NextResponse.json(result, { status: 200 });
}
