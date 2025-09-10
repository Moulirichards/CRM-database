import { User } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User endpoints
  async getUsers() {
    return this.request<User[]>('/users');
  }

  async getUser(id: string) {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: Omit<User, 'id'> & { password: string }) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Lead endpoints
  async getLeads(ownerId?: string) {
    const query = ownerId ? `?ownerId=${ownerId}` : '';
    return this.request<Lead[]>(`/leads${query}`);
  }

  async getLead(id: string) {
    return this.request<Lead>(`/leads/${id}`);
  }

  async createLead(leadData: Omit<Lead, 'id'>) {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(id: string, leadData: Partial<Lead>) {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(id: string) {
    return this.request<void>(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // Opportunity endpoints
  async getOpportunities(ownerId?: string, stage?: string) {
    const params = new URLSearchParams();
    if (ownerId) params.append('ownerId', ownerId);
    if (stage) params.append('stage', stage);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Opportunity[]>(`/opportunities${query}`);
  }

  async getOpportunity(id: string) {
    return this.request<Opportunity>(`/opportunities/${id}`);
  }

  async createOpportunity(opportunityData: Omit<Opportunity, 'id'>) {
    return this.request<Opportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunityData),
    });
  }

  async updateOpportunity(id: string, opportunityData: Partial<Opportunity>) {
    return this.request<Opportunity>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opportunityData),
    });
  }

  async deleteOpportunity(id: string) {
    return this.request<void>(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboardStats(ownerId?: string) {
    const query = ownerId ? `?ownerId=${ownerId}` : '';
    return this.request<DashboardStats>(`/dashboard/stats${query}`);
  }

  // Lead to Opportunity conversion
  async convertLeadToOpportunity(leadId: string, opportunityData: {
    title: string;
    value: number;
    stage: 'Discovery' | 'Proposal' | 'Won' | 'Lost';
  }) {
    // First update the lead status to Qualified
    await this.updateLead(leadId, { status: 'Qualified' });
    
    // Then create the opportunity
    return this.createOpportunity({
      ...opportunityData,
      leadId,
      ownerId: '', // Will be set by the calling component
    });
  }
}

// Type definitions
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified';
  ownerId: string;
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: 'Discovery' | 'Proposal' | 'Won' | 'Lost';
  ownerId: string;
  leadId: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  totalOpportunities: number;
  discoveryOpportunities: number;
  proposalOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  totalValue: number;
  wonValue: number;
}

export const apiService = new ApiService();
