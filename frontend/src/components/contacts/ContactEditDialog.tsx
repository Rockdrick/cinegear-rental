import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiClient, ClientContact, Client } from "@/lib/api";

interface ContactEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Partial<ClientContact>) => void;
  contact: ClientContact | null;
}

export const ContactEditDialog = ({ isOpen, onClose, onSave, contact }: ContactEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    position: "",
    department: "",
    specialties: "",
    website: "",
    notes: "",
    clientId: "",
    isPrimary: false
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // Load clients when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
        try {
          setIsLoadingClients(true);
          const clientsData = await apiClient.getClients();
          setClients(clientsData);
        } catch (error) {
          console.error('Error fetching clients:', error);
        } finally {
          setIsLoadingClients(false);
        }
      };
      fetchClients();
    }
  }, [isOpen]);

  // Load contact data when contact prop changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phoneNumber: contact.phoneNumber || "",
        position: contact.position || "",
        department: contact.department || "",
        specialties: contact.specialties || "",
        website: contact.website || "",
        notes: contact.notes || "",
        clientId: contact.clientId?.toString() || "",
        isPrimary: contact.isPrimary || false
      });
    } else {
      // Reset form for new contact
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        position: "",
        department: "",
        specialties: "",
        website: "",
        notes: "",
        clientId: "",
        isPrimary: false
      });
    }
  }, [contact]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert("Contact name is required");
      return;
    }

    const contactData = {
      ...formData,
      clientId: formData.clientId && formData.clientId !== "none" ? parseInt(formData.clientId) : null
    };

    onSave(contactData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      position: "",
      department: "",
      specialties: "",
      website: "",
      notes: "",
      clientId: "",
      isPrimary: false
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Phone and Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="e.g., Producer, Director, DP"
              />
            </div>
          </div>

          {/* Department and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="e.g., Production, Post-Production"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="e.g., www.example.com"
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange("specialties", e.target.value)}
              placeholder="e.g., Documentary, Commercial, Music Videos"
            />
          </div>

          {/* Associated Client */}
          <div className="space-y-2">
            <Label htmlFor="client">Associated Client (Optional)</Label>
            <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select client (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No associated client</SelectItem>
                {isLoadingClients ? (
                  <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Contact Toggle (only if client is selected) */}
          {formData.clientId && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => handleInputChange("isPrimary", checked)}
              />
              <Label htmlFor="isPrimary">Primary contact for this client</Label>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about this contact..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {contact ? 'Save Changes' : 'Add Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};