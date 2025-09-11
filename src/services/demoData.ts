import { DashboardStats, Lead, Opportunity } from "./api";

// Mock data for the dashboard
const demoDashboardStats: DashboardStats = {
  totalLeads: 42,
  newLeads: 12,
  contactedLeads: 18,
  qualifiedLeads: 12,
  totalOpportunities: 28,
  discoveryOpportunities: 10,
  proposalOpportunities: 8,
  wonOpportunities: 6,
  lostOpportunities: 4,
  totalValue: 1250000,
  wonValue: 850000
};

// Mock leads data
const demoLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Acme Corporation',
    email: 'jane.doe@acme.com',
    phone: '(555) 123-4567',
    status: 'New',
    ownerId: 'demo-user-123'
  },
  {
    id: 'lead-2',
    name: 'Globex Inc',
    email: 'john.smith@globex.com',
    phone: '(555) 234-5678',
    status: 'Contacted',
    ownerId: 'demo-user-123'
  },
  {
    id: 'lead-3',
    name: 'Soylent Corp',
    email: 'contact@soylent.com',
    phone: '(555) 345-6789',
    status: 'Qualified',
    ownerId: 'demo-user-123'
  }
];

// Mock opportunities data
const demoOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Enterprise Deal',
    value: 250000,
    stage: 'Proposal',
    ownerId: 'demo-user-123',
    leadId: 'lead-1'
  },
  {
    id: 'opp-2',
    title: 'SMB Package',
    value: 45000,
    stage: 'Discovery',
    ownerId: 'demo-user-123',
    leadId: 'lead-2'
  },
  {
    id: 'opp-3',
    title: 'Enterprise Plus',
    value: 350000,
    stage: 'Won',
    ownerId: 'demo-user-123',
    leadId: 'lead-3'
  }
];

export const demoService = {
  getDashboardStats: (): Promise<{ data: DashboardStats }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: demoDashboardStats });
      }, 500); // Simulate network delay
    });
  },

  getLeads: (): Promise<{ data: Lead[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: demoLeads });
      }, 500);
    });
  },

  getOpportunities: (): Promise<{ data: Opportunity[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: demoOpportunities });
      }, 500);
    });
  },

  getLeadById: (id: string): Promise<{ data: Lead | undefined }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lead = demoLeads.find(lead => lead.id === id);
        resolve({ data: lead });
      }, 300);
    });
  },

  getOpportunityById: (id: string): Promise<{ data: Opportunity | undefined }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const opportunity = demoOpportunities.find(opp => opp.id === id);
        resolve({ data: opportunity });
      }, 300);
    });
  }
};
