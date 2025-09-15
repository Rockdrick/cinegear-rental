// API service for MVD Assist Equipment Management System
const API_BASE_URL = 'http://localhost:3001/api';

// Types for API responses
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: {
    id: number;
    name: string;
    permissions: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  name: string;
  make: string;
  model: string;
  serialNumber: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
  currentCondition: {
    id: number;
    name: string;
    description: string;
  };
  itemLocation: {
    id: number;
    name: string;
    description: string;
  };
  notes?: string;
  acquisitionDate: string;
  purchasePrice: number;
  isRentable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  client: {
    id: number;
    name: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
  };
  contact?: {
    id: number;
    name: string;
    email?: string;
    phoneNumber?: string;
    position?: string;
    department?: string;
  };
  projectManager: User;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  location?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  item: Item;
  project: Project;
  bookedBy: User;
  responsibleUser: User;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Confirmed' | 'Checked Out' | 'Returned' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientContact {
  id: number;
  clientId?: number;
  clientName?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
  specialties?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KitTemplate {
  id: number;
  name: string;
  description?: string;
  items?: KitTemplateItem[];
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KitTemplateItem {
  id: number;
  kitTemplateId: number;
  itemId: number;
  quantity: number;
  item?: Item;
}

export interface ProjectRole {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTeamMember {
  id: number;
  projectId: number;
  userId: number;
  roleId: number;
  startDate: string;
  endDate: string;
  notes?: string;
  assignedDate?: string;
  user?: User;
  role?: ProjectRole;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
  phoneNumber?: string;
}

// API client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Try to get token from localStorage on initialization
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('API request with token:', { endpoint, hasToken: !!token });
    } else {
      console.warn('No token found for API request to:', endpoint);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = `${this.baseURL}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('token', data.token);
    console.log('Login successful, token stored:', { 
      hasToken: !!data.token, 
      tokenLength: data.token?.length 
    });
    return data;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const url = `${this.baseURL}/auth/register`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<{ success: boolean; user: User }>('/auth/profile');
    return response.user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Team Member Management
  async getUsers(): Promise<User[]> {
    const response = await this.request<{ success: boolean; users: User[]; count?: number }>('/users');
    return response.users;
  }

  async getUserById(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async getProjectRoles(): Promise<ProjectRole[]> {
    const response = await this.request<{ success: boolean; data: ProjectRole[] }>('/projects/roles');
    return response.data;
  }

  // Project Team Member methods
  async getProjectTeamMembers(projectId: number): Promise<ProjectTeamMember[]> {
    const response = await this.request<{ success: boolean; data: ProjectTeamMember[] }>(`/projects/${projectId}/team`);
    return response.data;
  }

  async addProjectTeamMember(projectId: number, memberData: {
    userId: number;
    roleId: number;
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<ProjectTeamMember> {
    const response = await this.request<{ success: boolean; data: ProjectTeamMember }>(`/projects/${projectId}/team`, {
      method: 'POST',
      body: JSON.stringify({
        userId: memberData.userId,
        projectRoleId: memberData.roleId,
        startDate: memberData.startDate,
        endDate: memberData.endDate,
        notes: memberData.notes
      }),
    });
    return response.data;
  }

  async updateProjectTeamMember(projectId: number, assignmentId: number, memberData: {
    roleId: number;
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<ProjectTeamMember> {
    const response = await this.request<{ success: boolean; data: ProjectTeamMember }>(`/projects/${projectId}/team/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        projectRoleId: memberData.roleId,
        startDate: memberData.startDate,
        endDate: memberData.endDate,
        notes: memberData.notes
      }),
    });
    return response.data;
  }

  async removeProjectTeamMember(projectId: number, assignmentId: number): Promise<void> {
    return this.request<void>(`/projects/${projectId}/team/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  // Role Management methods
  async getRoles(): Promise<Role[]> {
    const response = await this.request<{ success: boolean; data: Role[] }>('/roles');
    return response.data;
  }

  async getRoleById(roleId: number): Promise<Role> {
    return this.request<Role>(`/roles/${roleId}`);
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    return this.request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(roleId: number, roleData: Partial<Role>): Promise<Role> {
    return this.request<Role>(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(roleId: number): Promise<void> {
    return this.request<void>(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number): Promise<void> {
    return this.request<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Items methods
  async getItems(): Promise<Item[]> {
    return this.request<Item[]>('/items');
  }

  async getItemById(id: number): Promise<Item> {
    return this.request<Item>(`/items/${id}`);
  }

  async createItem(itemData: Partial<Item>): Promise<Item> {
    return this.request<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id: number, itemData: Partial<Item>): Promise<Item> {
    return this.request<Item>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id: number): Promise<void> {
    return this.request<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects methods
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProjectById(id: number): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<{success: boolean, project: Project}>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.project;
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: number): Promise<void> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings methods
  async getBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings');
  }

  async getBookingById(id: number): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(id: number): Promise<void> {
    return this.request<void>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async getAvailableItems(startDate: string, endDate: string): Promise<Item[]> {
    return this.request<Item[]>(`/bookings/available?startDate=${startDate}&endDate=${endDate}`);
  }

  async checkOutBooking(id: number): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/checkout`, {
      method: 'PUT',
    });
  }

  async returnBooking(id: number): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/return`, {
      method: 'PUT',
    });
  }

  // Clients methods
  async getClients(): Promise<Client[]> {
    return this.request<Client[]>('/clients');
  }

  async getClientById(id: number): Promise<Client> {
    return this.request<Client>(`/clients/${id}`);
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: number): Promise<void> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Independent Contacts methods
  async getContacts(): Promise<ClientContact[]> {
    const response = await this.request<{ success: boolean; contacts: ClientContact[]; count?: number }>('/contacts');
    return response.contacts;
  }

  // Client Contacts methods (backward compatibility)
  async getClientContacts(clientId: number): Promise<ClientContact[]> {
    return this.request<ClientContact[]>(`/contacts/client/${clientId}`);
  }

  async getContactById(contactId: number): Promise<ClientContact> {
    const response = await this.request<{ success: boolean; contact: ClientContact }>(`/contacts/${contactId}`);
    return response.contact;
  }

  async createContact(contactData: Partial<ClientContact>): Promise<ClientContact> {
    const response = await this.request<{ success: boolean; contact: ClientContact }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
    return response.contact;
  }

  async updateContact(contactId: number, contactData: Partial<ClientContact>): Promise<ClientContact> {
    const response = await this.request<{ success: boolean; contact: ClientContact }>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
    return response.contact;
  }

  async deleteContact(contactId: number): Promise<void> {
    return this.request<void>(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Backward compatibility methods
  async getClientContactById(contactId: number): Promise<ClientContact> {
    return this.getContactById(contactId);
  }

  async createClientContact(clientId: number, contactData: Partial<ClientContact>): Promise<ClientContact> {
    return this.createContact({ ...contactData, clientId });
  }

  async updateClientContact(contactId: number, contactData: Partial<ClientContact>): Promise<ClientContact> {
    return this.updateContact(contactId, contactData);
  }

  async deleteClientContact(contactId: number): Promise<void> {
    return this.deleteContact(contactId);
  }

  // Kit Template methods
  async getKitTemplates(): Promise<KitTemplate[]> {
    return this.request<KitTemplate[]>('/kit-templates');
  }

  async getKitTemplate(id: number): Promise<KitTemplate> {
    return this.request<KitTemplate>(`/kit-templates/${id}`);
  }

  async createKitTemplate(templateData: Partial<KitTemplate>): Promise<KitTemplate> {
    return this.request<KitTemplate>('/kit-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateKitTemplate(id: number, templateData: Partial<KitTemplate>): Promise<KitTemplate> {
    return this.request<KitTemplate>(`/kit-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteKitTemplate(id: number): Promise<void> {
    return this.request<void>(`/kit-templates/${id}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    // Check both in-memory token and localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken && !this.token) {
      this.token = storedToken;
    }
    const isAuth = !!(this.token || storedToken);
    console.log('isAuthenticated check:', { 
      hasInMemoryToken: !!this.token, 
      hasStoredToken: !!storedToken, 
      isAuthenticated: isAuth 
    });
    return isAuth;
  }

  getToken(): string | null {
    // Return in-memory token, or get from localStorage if not available
    if (this.token) {
      console.log('getToken: returning in-memory token');
      return this.token;
    }
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken;
      console.log('getToken: loaded token from localStorage');
    } else {
      console.log('getToken: no token found in localStorage');
    }
    return storedToken;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { User, Item, Project, Booking, Client, ClientContact, KitTemplate, KitTemplateItem, ProjectRole, ProjectTeamMember, Role, LoginRequest, LoginResponse, RegisterRequest };
