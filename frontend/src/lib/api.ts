// API service for MVD Assist Equipment Management System
const API_BASE_URL = 'http://localhost:3001/api';

// Types for API responses
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  exclusiveUsage: boolean;
  role: {
    id: number;
    name: string;
    permissions: any;
  };
  createdAt: string;
  updatedAt: string;
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
  startDate: string;
  endDate: string;
  notes?: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  roleName: string;
  roleDescription?: string;
}

export interface ProjectTeamMemberAssignment {
  id?: number;
  projectId: number;
  userId: number;
  startDate: string;
  endDate: string;
  notes?: string;
  roleId: number;
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
  exclusiveUsage: boolean;
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
  clientId: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
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

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
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
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('token', response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.token = response.token;
    localStorage.setItem('token', response.token);
    return response;
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
    const response = await this.request<{ success: boolean; users: User[] }>('/users');
    return response.users;
  }

  async getUserById(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
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

  // Project Team Management
  async getProjectRoles(): Promise<ProjectRole[]> {
    const response = await this.request<{ success: boolean; data: ProjectRole[] }>('/projects/roles');
    return response.data;
  }

  async getProjectTeamMembers(projectId: number): Promise<ProjectTeamMember[]> {
    const response = await this.request<{ success: boolean; data: ProjectTeamMember[] }>(`/projects/${projectId}/team`);
    return response.data;
  }

  async addProjectTeamMember(projectId: number, teamMemberData: Partial<ProjectTeamMember>): Promise<ProjectTeamMember> {
    // Convert roleId to projectRoleId for backend compatibility
    const { roleId, ...rest } = teamMemberData;
    const apiData = roleId ? { ...rest, projectRoleId: roleId } : rest;
    
    return this.request<ProjectTeamMember>(`/projects/${projectId}/team`, {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async updateProjectTeamMember(projectId: number, assignmentId: number, teamMemberData: Partial<ProjectTeamMember>): Promise<ProjectTeamMember> {
    // Convert roleId to projectRoleId for backend compatibility
    const { roleId, ...rest } = teamMemberData;
    const apiData = roleId ? { ...rest, projectRoleId: roleId } : rest;
    
    return this.request<ProjectTeamMember>(`/projects/${projectId}/team/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
  }

  async removeProjectTeamMember(projectId: number, assignmentId: number): Promise<void> {
    return this.request<void>(`/projects/${projectId}/team/${assignmentId}`, {
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
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
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

  // Client Contacts methods
  async getClientContacts(clientId: number): Promise<ClientContact[]> {
    return this.request<ClientContact[]>(`/client-contacts/${clientId}`);
  }

  async getClientContactById(contactId: number): Promise<ClientContact> {
    return this.request<ClientContact>(`/client-contacts/contact/${contactId}`);
  }

  async createClientContact(clientId: number, contactData: Partial<ClientContact>): Promise<ClientContact> {
    return this.request<ClientContact>(`/client-contacts/${clientId}`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateClientContact(contactId: number, contactData: Partial<ClientContact>): Promise<ClientContact> {
    return this.request<ClientContact>(`/client-contacts/contact/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteClientContact(contactId: number): Promise<void> {
    return this.request<void>(`/client-contacts/contact/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { User, Item, Project, Booking, Client, ClientContact, LoginRequest, LoginResponse, RegisterRequest };
