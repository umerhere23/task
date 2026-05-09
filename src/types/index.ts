export * from '@/types/auth.types';
export * from '@/types/db.types';

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  createdAt: string;
}

export interface CustomerDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organizationId: string;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  notes?: NoteDTO[];
}

export interface CustomerListDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  deletedAt?: string | null;
  createdAt: string;
}

export interface NoteDTO {
  id: string;
  content: string;
  customerId: string;
  organizationId: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
}

export interface CreateNoteDTO {
  content: string;
}

export interface ActivityLogDTO {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  organizationId: string;
  metadata?: any;
  timestamp: string;
}

export interface CreateCustomerDTO {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  email?: string;
  phone?: string;
  assignedToId?: string | null;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserListDTO extends UserDTO {
  assignedCustomerCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
