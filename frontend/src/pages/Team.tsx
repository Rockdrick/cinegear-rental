import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Calendar, Phone, MapPin, User as UserIcon, Edit, Trash2, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useState, useMemo, useEffect } from "react";
import TeamMemberEditDialog from "@/components/team/TeamMemberEditDialog";
import UserBookingsDialog from "@/components/team/UserBookingsDialog";
import TeamCalendarView from "@/components/team/TeamCalendarView";
import { apiClient } from "@/lib/api";
import type { User } from "@/lib/api";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  exclusiveUsage: boolean;
  createdAt: string;
  updatedAt: string;
}

const Team = () => {
  const { t } = useLanguage();
  const { canViewTeam, canEditTeam } = usePermissions();
  
  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  
  // State for team member management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [viewingBookings, setViewingBookings] = useState<any>(null);
  const [isCalendarViewOpen, setIsCalendarViewOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch team members on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const users = await apiClient.getUsers();
        setTeamMembers(users);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  // Mock team data - will be replaced with real API data later
  const mockTeamMembers: TeamMember[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@mvdassist.com",
      phoneNumber: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY 10001",
      role: { id: "1", name: "Admin" },
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@mvdassist.com",
      phoneNumber: "+1 (555) 234-5678",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      role: { id: "2", name: "Manager" },
      isActive: true,
      createdAt: "2024-01-20T14:30:00Z",
      updatedAt: "2024-01-20T14:30:00Z"
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@mvdassist.com",
      phoneNumber: "+1 (555) 345-6789",
      address: "789 Pine St, Chicago, IL 60601",
      role: { id: "3", name: "Technician" },
      isActive: false,
      createdAt: "2024-02-01T09:15:00Z",
      updatedAt: "2024-02-01T09:15:00Z"
    }
  ];

  // Get unique roles for filter
  const roles = useMemo(() => {
    if (!teamMembers || teamMembers.length === 0) return [];
    const uniqueRoles = [...new Set(teamMembers.map(member => member.role?.name).filter(Boolean))];
    return uniqueRoles.sort();
  }, [teamMembers]);

  // Filter and search team members
  const filteredMembers = useMemo(() => {
    if (!teamMembers || teamMembers.length === 0) return [];
    return teamMembers.filter(member => {
      const matchesSearch = searchTerm === "" || 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === "all" || member.role?.name === selectedRole;
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "active" && member.isActive) ||
        (selectedStatus === "inactive" && !member.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchTerm, selectedRole, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'role':
        setSelectedRole(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
    }
  };

  const handleCreateMember = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleDeleteMember = async (member: User) => {
    try {
      await apiClient.deleteUser(member.id);
      console.log('Member deleted successfully');
      
      // Refresh the team members list
      const updatedUsers = await apiClient.getUsers();
      setTeamMembers(updatedUsers);
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleSaveMember = async (memberData: any) => {
    try {
      if (editingMember) {
        // Update existing member
        await apiClient.updateUser(editingMember.id, memberData);
        console.log('Member updated successfully');
      } else {
        // Create new member
        await apiClient.createUser(memberData);
        console.log('Member created successfully');
      }
      
      // Refresh the team members list
      const updatedUsers = await apiClient.getUsers();
      setTeamMembers(updatedUsers);
      
      setIsCreateDialogOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsCreateDialogOpen(false);
    setEditingMember(null);
  };

  const handleViewBookings = (member: User) => {
    setViewingBookings(member);
  };

  const handleCloseBookings = () => {
    setViewingBookings(null);
  };

  const handleOpenCalendarView = () => {
    setIsCalendarViewOpen(true);
  };

  const handleCloseCalendarView = () => {
    setIsCalendarViewOpen(false);
  };

  // Check permissions
  if (!canViewTeam) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to view team members.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.common.loading}</h3>
              <p className="text-muted-foreground">
                Loading team members...
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
              <h1 className="text-3xl font-bold text-foreground">{t.team.title}</h1>
              <p className="text-muted-foreground mt-1">
                {t.team.subtitle}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleOpenCalendarView}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
              <Button variant="outline">
                <UserIcon className="h-4 w-4 mr-2" />
                {t.common.export}
              </Button>
              {canEditTeam && (
                <Button onClick={handleCreateMember}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.team.createMember}
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search by name, email, or phone..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground flex items-center">per page</span>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex gap-4 flex-wrap">
              <Select value={selectedRole} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {t.team.showingMembers.replace('{start}', (startIndex + 1).toString()).replace('{end}', Math.min(endIndex, filteredMembers.length).toString()).replace('{total}', filteredMembers.length.toString())}
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("all");
                  setSelectedStatus("all");
                  setCurrentPage(1);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMembers.length > 0 ? (
              currentMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold break-words leading-tight">
                          {member.firstName} {member.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground break-words">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge 
                          variant={member.isActive ? "default" : "secondary"}
                          className="flex-shrink-0"
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {member.role.name}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          className={`text-xs ${member.exclusiveUsage ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}`}
                        >
                          {member.exclusiveUsage ? "Exclusive" : "Multi-Project"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {member.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="break-words">{member.phoneNumber}</span>
                        </div>
                      )}
                      
                      {member.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="break-words">{member.address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      {canEditTeam && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t.common.edit}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewBookings(member)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Bookings
                      </Button>
                      {canEditTeam && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteMember(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRole("all");
                    setSelectedStatus("all");
                    setCurrentPage(1);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Team Member Edit Dialog */}
      <TeamMemberEditDialog
        isOpen={isCreateDialogOpen || !!editingMember}
        onClose={handleCancelEdit}
        onSave={handleSaveMember}
        member={editingMember}
      />

      {/* User Bookings Dialog */}
      <UserBookingsDialog
        user={viewingBookings}
        isOpen={!!viewingBookings}
        onClose={handleCloseBookings}
      />

      {/* Team Calendar View */}
      <TeamCalendarView
        isOpen={isCalendarViewOpen}
        onClose={handleCloseCalendarView}
      />
    </div>
  );
};

export default Team;
