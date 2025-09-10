import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CRMLayout } from "@/components/layout/CRMLayout";
import { Users, Target, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, DashboardStats } from "@/services/api";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const ownerId = user?.role === 'rep' ? user.id : undefined;
      const response = await apiService.getDashboardStats(ownerId);
      
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CRMLayout>
    );
  }

  if (!stats) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's your sales overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newLeads} new, {stats.contactedLeads} contacted
              </p>
            </CardContent>
          </Card>

          {/* Qualified Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
              <p className="text-xs text-muted-foreground">
                Ready for conversion
              </p>
            </CardContent>
          </Card>

          {/* Total Pipeline Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalOpportunities} opportunities
              </p>
            </CardContent>
          </Card>

          {/* Won Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.wonValue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.wonOpportunities} closed deals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Leads Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Leads by Status</CardTitle>
              <CardDescription>
                Current distribution of your leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">New</span>
                  </div>
                  <span className="text-sm font-bold">{stats.newLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Contacted</span>
                  </div>
                  <span className="text-sm font-bold">{stats.contactedLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Qualified</span>
                  </div>
                  <span className="text-sm font-bold">{stats.qualifiedLeads}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunities by Stage</CardTitle>
              <CardDescription>
                Current distribution of your opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Discovery</span>
                  </div>
                  <span className="text-sm font-bold">{stats.discoveryOpportunities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Proposal</span>
                  </div>
                  <span className="text-sm font-bold">{stats.proposalOpportunities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Won</span>
                  </div>
                  <span className="text-sm font-bold">{stats.wonOpportunities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Lost</span>
                  </div>
                  <span className="text-sm font-bold">{stats.lostOpportunities}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to help you manage your sales pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Add New Lead</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Capture a new prospect and start the sales process
                </p>
                <a 
                  href="/leads" 
                  className="text-sm text-primary hover:underline"
                >
                  Go to Leads →
                </a>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Create Opportunity</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Convert a qualified lead into a sales opportunity
                </p>
                <a 
                  href="/opportunities" 
                  className="text-sm text-primary hover:underline"
                >
                  Go to Opportunities →
                </a>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">View Reports</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Analyze your performance and track progress
                </p>
                <a 
                  href="/settings" 
                  className="text-sm text-primary hover:underline"
                >
                  Go to Settings →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}