export type UserRole = 'admin' | 'member';

export interface AuthSession {
  userId: string;
  organizationId: string;
  role: UserRole;
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}
