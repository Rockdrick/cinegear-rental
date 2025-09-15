import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiClient, Client, ClientContact } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ProjectTeamAssignmentEnhanced from "./ProjectTeamAssignmentEnhanced";

interface ProjectEditDialogProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => void;
}

const ProjectEditDialog = ({ project, isOpen, onClose, onSave }: ProjectEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    location: "",
    budget: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    clientId: "",
    contactId: "",
    projectManagerId: ""
  });

  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [projectManagers, setProjectManagers] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isGearOpen, setIsGearOpen] = useState(false);

  const statusOptions = [
    { value: "Planning", label: "Planning" },
    { value: "Planned", label: "Planned" },
    { value: "Active", label: "Active" },
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "Planning",
        location: project.location || "",
        budget: project.budget?.toString() || "",
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        clientId: project.client?.id?.toString() || "",
        contactId: project.contact?.id?.toString() || "",
        projectManagerId: project.projectManager?.id?.toString() || ""
      });
      
    }
  }, [project]);

  // Fetch clients, contacts, and project managers when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setIsLoadingClients(true);
          setIsLoadingManagers(true);
          setIsLoadingContacts(true);
          
          const [clientsData, usersData, contactsData] = await Promise.all([
            apiClient.getClients(),
            apiClient.getUsers(),
            apiClient.getContacts()
          ]);
          
          setClients(clientsData);
          setContacts(contactsData);
          
          // Filter users to only include active team members and format for project manager dropdown
          const managers = usersData
            .filter((user: any) => user.isActive)
            .map((user: any) => ({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`
            }));
          setProjectManagers(managers);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoadingClients(false);
          setIsLoadingManagers(false);
          setIsLoadingContacts(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const projectData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      startDate: formData.startDate?.toISOString().split('T')[0],
      endDate: formData.endDate?.toISOString().split('T')[0],
      clientId: formData.clientId ? parseInt(formData.clientId) : null,
      contactId: formData.contactId ? parseInt(formData.contactId) : null,
      projectManagerId: formData.projectManagerId ? parseInt(formData.projectManagerId) : null
    };
    
    onSave(projectData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      status: "Planning",
      location: "",
      budget: "",
      startDate: undefined,
      endDate: undefined,
      clientId: "",
      contactId: "",
      projectManagerId: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-visible">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Project Name - Always visible */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          {/* Details Card - Collapsed by default */}
          <Card>
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Project Details</CardTitle>
                    {isDetailsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>

                  {/* Status and Client */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client">Client</Label>
                      <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select client"} />
                        </SelectTrigger>
                        <SelectContent>
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
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Person</Label>
                    <Select value={formData.contactId} onValueChange={(value) => handleInputChange("contactId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingContacts ? "Loading contacts..." : "Select contact person"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingContacts ? (
                          <SelectItem value="loading" disabled>Loading contacts...</SelectItem>
                        ) : contacts.length === 0 ? (
                          <SelectItem value="no-contacts" disabled>No contacts found</SelectItem>
                        ) : (
                          contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} {contact.position && `(${contact.position})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => {
                              handleInputChange("startDate", date);
                              setIsStartDateOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => {
                              handleInputChange("endDate", date);
                              setIsEndDateOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Location and Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Enter project location"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleInputChange("budget", e.target.value)}
                        placeholder="Enter budget amount"
                      />
                    </div>
                  </div>

                  {/* Project Manager */}
                  <div className="space-y-2">
                    <Label htmlFor="projectManager">Project Manager</Label>
                    <Select value={formData.projectManagerId} onValueChange={(value) => handleInputChange("projectManagerId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingManagers ? "Loading managers..." : "Select project manager"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingManagers ? (
                          <SelectItem value="loading" disabled>Loading project managers...</SelectItem>
                        ) : (
                          projectManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id.toString()}>
                              {manager.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Team Assignment Card */}
          <Card>
            <Collapsible open={isTeamOpen} onOpenChange={setIsTeamOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Team Assignment</CardTitle>
                    {isTeamOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {project?.id && formData.startDate && formData.endDate ? (
                    <ProjectTeamAssignmentEnhanced
                      projectId={project.id}
                      projectStartDate={formData.startDate.toISOString().split('T')[0]}
                      projectEndDate={formData.endDate.toISOString().split('T')[0]}
                    />
                  ) : (
                    <p className="text-muted-foreground">Please save the project with dates first to assign team members.</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Gear Assignment Card */}
          <Card>
            <Collapsible open={isGearOpen} onOpenChange={setIsGearOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Gear Assignment</CardTitle>
                    {isGearOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {project?.id && formData.startDate && formData.endDate ? (
                    <div className="text-muted-foreground">
                      <p>Gear assignment functionality coming soon...</p>
                      <p className="text-sm mt-2">This will allow you to:</p>
                      <ul className="list-disc list-inside text-sm mt-1 ml-4">
                        <li>Select from pre-configured kit templates</li>
                        <li>Add individual gear items</li>
                        <li>Manage project equipment assignments</li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Please save the project with dates first to assign gear.</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>


        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditDialog;
