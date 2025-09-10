import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRMLayout } from "@/components/layout/CRMLayout";
import { Plus, Search, Edit, Trash2, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Opportunity } from "@/services/api";

const getStageColor = (stage: string) => {
  switch (stage.toLowerCase()) {
    case "discovery": return "bg-blue-100 text-blue-800";
    case "proposal": return "bg-yellow-100 text-yellow-800";
    case "won": return "bg-green-100 text-green-800";
    case "lost": return "bg-red-100 text-red-800";
    default: return "bg-muted text-muted-foreground";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [newOpportunity, setNewOpportunity] = useState({ 
    title: "", 
    value: "", 
    stage: "Discovery" as const,
    leadId: ""
  });
  const [editOpportunity, setEditOpportunity] = useState({ 
    title: "", 
    value: "", 
    stage: "Discovery" as "Discovery" | "Proposal" | "Won" | "Lost"
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load opportunities on component mount
  useEffect(() => {
    loadOpportunities();
  }, [user]);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      const ownerId = user?.role === 'rep' ? user.id : undefined;
      const response = await apiService.getOpportunities(ownerId);
      
      if (response.data) {
        setOpportunities(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load opportunities",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOpportunity = async () => {
    if (!newOpportunity.title || !newOpportunity.value || !newOpportunity.leadId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      const response = await apiService.createOpportunity({
        ...newOpportunity,
        value: parseInt(newOpportunity.value),
        ownerId: user.id,
      });

      if (response.data) {
        setOpportunities([...opportunities, response.data]);
        setNewOpportunity({ title: "", value: "", stage: "Discovery", leadId: "" });
        setIsAddDialogOpen(false);
        
        toast({
          title: "Opportunity added",
          description: `${newOpportunity.title} has been added to your pipeline`,
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create opportunity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create opportunity",
        variant: "destructive",
      });
    }
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setEditOpportunity({
      title: opportunity.title,
      value: opportunity.value.toString(),
      stage: opportunity.stage,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateOpportunity = async () => {
    if (!selectedOpportunity) return;

    try {
      const response = await apiService.updateOpportunity(selectedOpportunity.id, {
        ...editOpportunity,
        value: parseInt(editOpportunity.value),
      });

      if (response.data) {
        setOpportunities(opportunities.map(opp => 
          opp.id === selectedOpportunity.id ? response.data! : opp
        ));
        setIsEditDialogOpen(false);
        setSelectedOpportunity(null);
        
        toast({
          title: "Opportunity updated",
          description: "Opportunity has been updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update opportunity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update opportunity",
        variant: "destructive",
      });
    }
  };

  const handleStageChange = async (oppId: string, newStage: string) => {
    try {
      const response = await apiService.updateOpportunity(oppId, { stage: newStage as any });

      if (response.data) {
        setOpportunities(opportunities.map(opp => 
          opp.id === oppId ? { ...opp, stage: newStage as any } : opp
        ));
        
        toast({
          title: "Stage updated",
          description: `Opportunity stage has been updated to ${newStage}`,
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update stage",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stage",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOpportunity = async (oppId: string) => {
    try {
      const response = await apiService.deleteOpportunity(oppId);

      if (!response.error) {
        setOpportunities(opportunities.filter(opp => opp.id !== oppId));
        toast({
          title: "Opportunity deleted",
          description: "Opportunity has been removed from your pipeline",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete opportunity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete opportunity",
        variant: "destructive",
      });
    }
  };

  const totalPipelineValue = filteredOpportunities
    .filter(opp => opp.stage !== "Won" && opp.stage !== "Lost")
    .reduce((sum, opp) => sum + opp.value, 0);

  const wonValue = filteredOpportunities
    .filter(opp => opp.stage === "Won")
    .reduce((sum, opp) => sum + opp.value, 0);

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
            <p className="text-muted-foreground">
              Manage your sales opportunities and track their progress
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Opportunity</DialogTitle>
                <DialogDescription>
                  Create a new opportunity in your pipeline
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newOpportunity.title}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                    placeholder="Enter opportunity title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newOpportunity.value}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, value: e.target.value })}
                    placeholder="Enter opportunity value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadId">Lead ID *</Label>
                  <Input
                    id="leadId"
                    value={newOpportunity.leadId}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, leadId: e.target.value })}
                    placeholder="Enter lead ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select
                    value={newOpportunity.stage}
                    onValueChange={(value) => setNewOpportunity({ ...newOpportunity, stage: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discovery">Discovery</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddOpportunity}>Add Opportunity</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredOpportunities.filter(opp => opp.stage !== "Won" && opp.stage !== "Lost").length} active deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(wonValue)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredOpportunities.filter(opp => opp.stage === "Won").length} closed deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredOpportunities.length > 0 
                  ? Math.round((filteredOpportunities.filter(opp => opp.stage === "Won").length / filteredOpportunities.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredOpportunities.length}</div>
              <p className="text-xs text-muted-foreground">
                All opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Pipeline</CardTitle>
            <CardDescription> 
              Manage your sales opportunities and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities.map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium">{opp.title}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(opp.value)}</TableCell>
                    <TableCell>
                      <Select
                        value={opp.stage}
                        onValueChange={(value) => handleStageChange(opp.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={getStageColor(opp.stage)}>
                            {opp.stage}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Discovery">Discovery</SelectItem>
                          <SelectItem value="Proposal">Proposal</SelectItem>
                          <SelectItem value="Won">Won</SelectItem>
                          <SelectItem value="Lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditOpportunity(opp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOpportunity(opp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Opportunity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
              <DialogDescription>
                Update opportunity information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editOpportunity.title}
                  onChange={(e) => setEditOpportunity({ ...editOpportunity, title: e.target.value })}
                  placeholder="Enter opportunity title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-value">Value *</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={editOpportunity.value}
                  onChange={(e) => setEditOpportunity({ ...editOpportunity, value: e.target.value })}
                  placeholder="Enter opportunity value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stage">Stage</Label>
                <Select
                  value={editOpportunity.stage}
                  onValueChange={(value) => setEditOpportunity({ ...editOpportunity, stage: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Discovery">Discovery</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateOpportunity}>Update Opportunity</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}