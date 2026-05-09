import {
  ActivityLogDTO,
  CreateCustomerDTO,
  CreateNoteDTO,
  CreateUserDTO,
  CustomerDTO,
  CustomerListDTO,
  NoteDTO,
  PaginatedResponse,
  UserDTO,
  UserListDTO,
  UpdateCustomerDTO,
} from '@/types';

interface ApiOptions {
  userId?: string;
  organizationId?: string;
  userRole?: string;
}

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options: ApiOptions = {}) {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.headers = {
      'Content-Type': 'application/json',
    };

    if (options.userId) this.headers['x-user-id'] = options.userId;
    if (options.organizationId) this.headers['x-org-id'] = options.organizationId;
    if (options.userRole) this.headers['x-user-role'] = options.userRole;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/api${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Organizations
  async createOrganization(data: {
    name: string;
    slug: string;
    adminName: string;
    adminEmail: string;
  }) {
    return this.request('/organizations', 'POST', data);
  }

  async getOrganization(slug: string) {
    return this.request(`/organizations?slug=${slug}`, 'GET');
  }

  // Customers
  async listCustomers(page: number = 1, limit: number = 20, search?: string, includeDeleted: boolean = false) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(includeDeleted ? { includeDeleted: 'true' } : {}),
    });
    return this.request<PaginatedResponse<CustomerListDTO>>(`/customers?${params}`, 'GET');
  }

  async createCustomer(data: CreateCustomerDTO) {
    return this.request<CustomerDTO>('/customers', 'POST', data);
  }

  async getCustomer(id: string) {
    return this.request<CustomerDTO>(`/customers/${id}`, 'GET');
  }

  async updateCustomer(id: string, data: UpdateCustomerDTO) {
    return this.request<CustomerDTO>(`/customers/${id}`, 'PUT', data);
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, 'DELETE');
  }

  async assignCustomer(id: string, assignedToId: string) {
    return this.request<CustomerDTO>(`/customers/${id}/assign`, 'POST', { assignedToId });
  }

  async restoreCustomer(id: string) {
    return this.request<CustomerDTO>(`/customers/${id}/restore`, 'POST');
  }

  // Users
  async listUsers() {
    return this.request<UserListDTO[]>('/users', 'GET');
  }

  async createUser(data: CreateUserDTO) {
    return this.request<UserDTO>('/users', 'POST', data);
  }

  async updateUser(id: string, data: Partial<CreateUserDTO>) {
    return this.request<UserDTO>(`/users/${id}`, 'PUT', data);
  }

  // Notes API
  async getNotes(customerId: string): Promise<NoteDTO[]> {
    return this.request<NoteDTO[]>(`/customers/${customerId}/notes`, 'GET');
  }

  async addNote(customerId: string, data: CreateNoteDTO): Promise<NoteDTO> {
    return this.request<NoteDTO>(`/customers/${customerId}/notes`, 'POST', data);
  }

  async updateNote(noteId: string, data: CreateNoteDTO): Promise<NoteDTO> {
    return this.request<NoteDTO>(`/notes/${noteId}`, 'PUT', data);
  }

  async deleteNote(noteId: string): Promise<void> {
    return this.request<void>(`/notes/${noteId}`, 'DELETE');
  }

  // Activity Logs API
  async getActivityLogs(params?: {
    entityType?: string;
    entityId?: string;
    performedBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ActivityLogDTO[]; total: number; pages: number }> {
    const searchParams = new URLSearchParams();
    if (params?.entityType) searchParams.append('entityType', params.entityType);
    if (params?.entityId) searchParams.append('entityId', params.entityId);
    if (params?.performedBy) searchParams.append('performedBy', params.performedBy);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request<{ data: ActivityLogDTO[]; total: number; pages: number }>(
      `/activity-logs${query ? `?${query}` : ''}`,
      'GET'
    );
  }

  async getCustomerActivityLogs(customerId: string, page: number = 1, limit: number = 20): Promise<{ data: ActivityLogDTO[]; total: number; pages: number }> {
    return this.request<{ data: ActivityLogDTO[]; total: number; pages: number }>(
      `/customers/${customerId}/activity?page=${page}&limit=${limit}`,
      'GET'
    );
  }
}

export function createApiClient(options?: ApiOptions) {
  return new ApiClient(options);
}
