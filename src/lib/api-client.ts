import {
  ActivityLogDTO,
  CreateCustomerDTO,
  CreateNoteDTO,
  CustomerDTO,
  CustomerListDTO,
  NoteDTO,
  PaginatedResponse,
  UserDTO,
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
  async listCustomers(page: number = 1, limit: number = 20, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
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
    return this.request<UserDTO[]>('/users', 'GET');
  }

  async createUser(data: { name: string; email: string; role?: string }) {
    return this.request<UserDTO>('/users', 'POST', data);
  }

  // Notes
  async addNote(customerId: string, data: CreateNoteDTO) {
    return this.request<NoteDTO>(`/customers/${customerId}/notes`, 'POST', data);
  }

  async getNotes(customerId: string) {
    return this.request<NoteDTO[]>(`/customers/${customerId}/notes`, 'GET');
  }

  // Activity Logs
  async getActivityLogs(page: number = 1, limit: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request<PaginatedResponse<ActivityLogDTO>>(`/activity-logs?${params}`, 'GET');
  }
}

export function createApiClient(options?: ApiOptions) {
  return new ApiClient(options);
}
