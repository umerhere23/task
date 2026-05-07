import { NextRequest } from 'next/server';

export function validateDbStatusRequest(_request: NextRequest): void {
  // Reserved for auth/role checks when DB diagnostics endpoint is protected.
}
