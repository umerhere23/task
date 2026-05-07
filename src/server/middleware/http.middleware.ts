import { NextRequest, NextResponse } from 'next/server';

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export type AppRouteHandler = (request: NextRequest) => Promise<NextResponse>;

export function withErrorHandling(handler: AppRouteHandler): AppRouteHandler {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }

      const message = error instanceof Error ? error.message : 'Unexpected server error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError('Invalid JSON body', 400);
  }
}
