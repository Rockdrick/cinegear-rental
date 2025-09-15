import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, User, Phone, Mail, Globe, Briefcase } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import { apiClient, ClientContact } from "@/lib/api";
import { ContactEditDialog } from "@/components/contacts/ContactEditDialog";

const Contacts = () => {
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const contactsData = await apiClient.getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSaveContact = async (contactData: Partial<ClientContact>) => {
    try {
      if (editingContact) {
        // Update existing contact
        await apiClient.updateContact(editingContact.id, contactData);
        await fetchContacts();
        setEditingContact(null);
      } else {
        // Create new contact
        await apiClient.createContact(contactData);
        await fetchContacts();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await apiClient.deleteContact(contactId);
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  // Get unique positions for filter
  const positions = [...new Set(contacts.filter(c => c.position).map(c => c.position))];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.clientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = selectedPosition === "all" || contact.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading contacts...</p>
              </div>
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
                <p className="text-gray-600 mt-1">Manage freelance producers and industry contacts</p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position || ""}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {contact.name}
                        </CardTitle>
                        {contact.position && (
                          <CardDescription className="mt-1 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {contact.position}
                          </CardDescription>
                        )}
                      </div>
                      {contact.clientName && (
                        <Badge variant="outline" className="text-xs">
                          {contact.clientName}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Contact Information */}
                      <div className="space-y-2 text-sm">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        {contact.phoneNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{contact.phoneNumber}</span>
                          </div>
                        )}
                        {contact.website && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <a 
                              href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="truncate hover:text-blue-600"
                            >
                              {contact.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Specialties */}
                      {contact.specialties && (
                        <div className="text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {contact.specialties}
                          </Badge>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedPosition !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first contact"
                  }
                </p>
                {!searchTerm && selectedPosition === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <ContactEditDialog
        isOpen={isCreateDialogOpen || editingContact !== null}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
      />
    </div>
  );
};

export default Contacts;