import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionsContext";
import { apiClient, Client } from "@/lib/api";
import { useState, useEffect } from "react";
import ClientEditDialog from "@/components/clients/ClientEditDialog";

const Clients = () => {
  const { canViewTeam, canEditTeam } = usePermissions(); // Using team permissions for now
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const clientsData = await apiClient.getClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    console.log('Editing client:', client);
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      console.log('Saving client:', clientData);
      if (editingClient) {
        await apiClient.updateClient(editingClient.id, clientData);
        console.log('Client updated successfully');
        // Refresh the clients list
        const updatedClients = await apiClient.getClients();
        setClients(updatedClients);
      }
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
  };

  const handleCreateClient = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateClientSubmit = async (clientData: any) => {
    try {
      console.log('Creating new client:', clientData);
      // TODO: Implement actual create to backend
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  const handleCancelCreate = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await apiClient.deleteClient(clientId);
        console.log('Client deleted successfully');
        // Refresh the clients list
        const clientsData = await apiClient.getClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  // Check permissions
  if (!canViewTeam) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to view clients.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Clients</h1>
              <p className="text-muted-foreground mt-1">
                Manage your client relationships and contact information
              </p>
            </div>
            {canEditTeam && (
              <Button onClick={handleCreateClient}>
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Button>
            )}
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading clients...</p>
              </div>
            ) : clients.length > 0 ? (
              clients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold break-words leading-tight">
                        {client.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {client.contactPerson}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className="break-words">{client.email}</span>
                        </div>
                      )}
                      
                      {client.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{client.phoneNumber}</span>
                        </div>
                      )}
                      
                      {client.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Address:</span>
                          <span className="break-words">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {canEditTeam && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first client to get started
                </p>
                {canEditTeam && (
                  <Button onClick={handleCreateClient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Client Dialog */}
      <ClientEditDialog
        isOpen={!!editingClient}
        onClose={handleCancelEdit}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </div>
  );
};

export default Clients;
