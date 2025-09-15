import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient, User, ProjectRole, ProjectTeamMember } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { Calendar, Plus, Edit, Trash2, Users } from 'lucide-react';

interface ProjectTeamAssignmentProps {
  projectId: number;
  projectStartDate: string;
  projectEndDate: string;
}

const ProjectTeamAssignment: React.FC<ProjectTeamAssignmentProps> = ({
  projectId,
  projectStartDate,
  projectEndDate
}) => {
  const { t } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ProjectTeamMember | null>(null);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [teamMembersData, usersData, rolesData] = await Promise.all([
        apiClient.getProjectTeamMembers(projectId),
        apiClient.getUsers(),
        apiClient.getProjectRoles()
      ]);
      
      setTeamMembers(teamMembersData);
      setUsers(usersData);
      setProjectRoles(rolesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingAssignment(null);
    setSelectedUserId('');
    setSelectedRoleId('');
    setSelectedDate('');
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleEditMember = (assignment: ProjectTeamMember) => {
    setEditingAssignment(assignment);
    setSelectedUserId(assignment.userId.toString());
    setSelectedRoleId(assignment.roleId.toString());
    setSelectedDate(assignment.assignedDate);
    setNotes(assignment.notes || '');
    setIsDialogOpen(true);
  };

  const handleSaveMember = async () => {
    try {
      if (!selectedUserId || !selectedRoleId || !selectedDate) {
        alert('Please fill in all required fields');
        return;
      }

      const memberData = {
        userId: parseInt(selectedUserId),
        projectRoleId: parseInt(selectedRoleId),
        assignedDate: selectedDate,
        notes: notes || undefined
      };

      if (editingAssignment) {
        await apiClient.updateProjectTeamMember(projectId, editingAssignment.id, memberData);
      } else {
        await apiClient.addProjectTeamMember(projectId, memberData);
      }

      await fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Failed to save team member assignment');
    }
  };

  const handleDeleteMember = async (assignmentId: number) => {
    if (window.confirm('Are you sure you want to remove this team member from the project?')) {
      try {
        await apiClient.removeProjectTeamMember(projectId, assignmentId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Failed to remove team member');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'DIT': 'bg-blue-100 text-blue-800',
      'DataManager': 'bg-green-100 text-green-800',
      'QTakeOP': 'bg-purple-100 text-purple-800',
      'DigiLab': 'bg-orange-100 text-orange-800',
      'Uploader': 'bg-yellow-100 text-yellow-800',
      'Coordinator': 'bg-red-100 text-red-800',
      'StreamingOP': 'bg-indigo-100 text-indigo-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading team members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({teamMembers.length})
          </CardTitle>
          <Button onClick={handleAddMember} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No team members assigned to this project yet.
          </div>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {member.firstName} {member.lastName}
                    </span>
                    <Badge className={getRoleColor(member.roleName)}>
                      {member.roleName}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {formatDate(member.assignedDate)}
                    {member.notes && (
                      <span className="ml-2">• {member.notes}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditMember(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Member Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? 'Edit Team Member' : 'Add Team Member'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">Team Member</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Project Role</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Assigned Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={projectStartDate}
                  max={projectEndDate}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveMember} className="flex-1">
                  {editingAssignment ? 'Update' : 'Add'} Member
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProjectTeamAssignment;
