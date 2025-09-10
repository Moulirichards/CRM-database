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
import { Plus, Search, Edit, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Lead } from "@/services/api";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "new": return "bg-blue-100 text-blue-800";
    case "contacted": return "bg-yellow-100 text-yellow-800";
    case "qualified": return "bg-green-100 text-green-800";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", status: "New" as const });
  const [editLead, setEditLead] = useState({ name: "", email: "", phone: "", status: "New" as "New" | "Contacted" | "Qualified" });
  const [convertData, setConvertData] = useState({ title: "", value: "", stage: "Discovery" as const });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load leads on component mount
  useEffect(() => {
    loadLeads();
  }, [user]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const ownerId = user?.role === 'rep' ? user.id : undefined;
      const response = await apiService.getLeads(ownerId);
      
      if (response.data) {
        setLeads(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load leads",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      const response = await apiService.createLead({
        ...newLead,
        ownerId: user.id,
      });

      if (response.data) {
        setLeads([...leads, response.data]);
        setNewLead({ name: "", email: "", phone: "", status: "New" });
        setIsAddDialogOpen(false);
        
        toast({
          title: "Lead added",
          description: `${newLead.name} has been added to your leads`,
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditLead({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await apiService.updateLead(selectedLead.id, editLead);

      if (response.data) {
        setLeads(leads.map(lead => 
          lead.id === selectedLead.id ? response.data! : lead
        ));
        setIsEditDialogOpen(false);
        setSelectedLead(null);
        
        toast({
          title: "Lead updated",
          description: "Lead has been updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  const handleConvertToOpportunity = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertData({
      title: `${lead.name} - Deal`,
      value: "",
      stage: "Discovery",
    });
    setIsConvertDialogOpen(true);
  };

  const handleConvertLead = async () => {
    if (!selectedLead || !user) return;

    if (!convertData.title || !convertData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.convertLeadToOpportunity(selectedLead.id, {
        title: convertData.title,
        value: parseInt(convertData.value),
        stage: convertData.stage,
      });

      if (response.data) {
        // Update lead status to Qualified
        setLeads(leads.map(lead => 
          lead.id === selectedLead.id ? { ...lead, status: "Qualified" } : lead
        ));
        
        setIsConvertDialogOpen(false);
        setSelectedLead(null);
        
        toast({
          title: "Lead converted",
          description: "Lead has been converted to an opportunity",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to convert lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert lead",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await apiService.deleteLead(leadId);

      if (!response.error) {
        setLeads(leads.filter(lead => lead.id !== leadId));
        toast({
          title: "Lead deleted",
          description: "Lead has been removed from your pipeline",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
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

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground">
              Manage your sales leads and track their progress
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Create a new lead to add to your pipeline
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="Enter lead name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newLead.status}
                    onValueChange={(value) => setNewLead({ ...newLead, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLead}>Add Lead</Button>
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
              placeholder="Search leads..."
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
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredLeads.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredLeads.filter(lead => lead.status === "New").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredLeads.filter(lead => lead.status === "Contacted").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredLeads.filter(lead => lead.status === "Qualified").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Pipeline</CardTitle>
            <CardDescription>
              Manage your sales leads and track their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lead.email}</div>
                        <div className="text-muted-foreground">{lead.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {lead.status !== "Qualified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToOpportunity(lead)}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Convert
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditLead(lead)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLead(lead.id)}
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

        {/* Edit Lead Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>
                Update lead information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editLead.name}
                  onChange={(e) => setEditLead({ ...editLead, name: e.target.value })}
                  placeholder="Enter lead name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editLead.email}
                  onChange={(e) => setEditLead({ ...editLead, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editLead.phone}
                  onChange={(e) => setEditLead({ ...editLead, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editLead.status}
                  onValueChange={(value) => setEditLead({ ...editLead, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLead}>Update Lead</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Convert Lead Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert Lead to Opportunity</DialogTitle>
              <DialogDescription>
                Create an opportunity from this lead
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="convert-title">Opportunity Title *</Label>
                <Input
                  id="convert-title"
                  value={convertData.title}
                  onChange={(e) => setConvertData({ ...convertData, title: e.target.value })}
                  placeholder="Enter opportunity title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="convert-value">Value *</Label>
                <Input
                  id="convert-value"
                  type="number"
                  value={convertData.value}
                  onChange={(e) => setConvertData({ ...convertData, value: e.target.value })}
                  placeholder="Enter opportunity value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="convert-stage">Stage</Label>
                <Select
                  value={convertData.stage}
                  onValueChange={(value) => setConvertData({ ...convertData, stage: value as any })}
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
                <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConvertLead}>Convert Lead</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}