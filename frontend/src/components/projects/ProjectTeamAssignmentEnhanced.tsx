import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Edit2, Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient, ProjectRole, ProjectTeamMember, User } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

interface ProjectTeamAssignmentEnhancedProps {
  projectId: number;
  projectStartDate: string;
  projectEndDate: string;
}

interface DateRange {
  id: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  notes: string;
}

interface TeamMemberAssignment {
  id: string;
  userId: number;
  roleId: number;
  dateRanges: DateRange[];
}

const ProjectTeamAssignmentEnhanced: React.FC<ProjectTeamAssignmentEnhancedProps> = ({
  projectId,
  projectStartDate,
  projectEndDate
}) => {
  const { t } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<TeamMemberAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, usersData, teamData] = await Promise.all([
        apiClient.getProjectRoles(),
        apiClient.getUsers(),
        apiClient.getProjectTeamMembers(projectId)
      ]);

      setProjectRoles(rolesData);
      setUsers(usersData);
      setTeamMembers(teamData);

      // Group team members by user and role
      const groupedAssignments = groupTeamMembersByUser(teamData);
      setAssignments(groupedAssignments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupTeamMembersByUser = (teamMembers: ProjectTeamMember[]): TeamMemberAssignment[] => {
    const grouped: { [key: string]: TeamMemberAssignment } = {};

    teamMembers.forEach(member => {
      const key = `${member.userId}-${member.roleId}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          userId: member.userId,
          roleId: member.roleId,
          dateRanges: []
        };
      }

      grouped[key].dateRanges.push({
        id: member.id.toString(),
        startDate: new Date(member.startDate),
        endDate: new Date(member.endDate),
        notes: member.notes || ''
      });
    });

    return Object.values(grouped);
  };

  const addNewAssignment = () => {
    const newAssignment: TeamMemberAssignment = {
      id: `new-${Date.now()}`,
      userId: 0,
      roleId: 0,
      dateRanges: [{
        id: `range-${Date.now()}`,
        startDate: undefined,
        endDate: undefined,
        notes: ''
      }]
    };
    setAssignments([...assignments, newAssignment]);
  };

  const addToWholeProject = () => {
    const projectStart = new Date(projectStartDate);
    const projectEnd = new Date(projectEndDate);
    
    const newAssignment: TeamMemberAssignment = {
      id: `new-${Date.now()}`,
      userId: 0,
      roleId: 0,
      dateRanges: [{
        id: `range-${Date.now()}`,
        startDate: projectStart,
        endDate: projectEnd,
        notes: 'Full project duration'
      }]
    };
    setAssignments([...assignments, newAssignment]);
  };

  const checkExclusiveUserConflicts = (userId: number, startDate: Date, endDate: Date) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.exclusiveUsage) return false;

    // Check if user is already assigned to other projects during this time
    return teamMembers.some(member => 
      member.userId === userId && 
      member.projectId !== projectId &&
      new Date(member.startDate) <= endDate && 
      new Date(member.endDate) >= startDate
    );
  };

  const addDateRange = (assignmentId: string, isWholeProject = false) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        const startDate = isWholeProject ? new Date(projectStartDate + 'T00:00:00') : undefined;
        const endDate = isWholeProject ? new Date(projectEndDate + 'T00:00:00') : undefined;
        
        // Check for conflicts if this is a whole project assignment
        if (isWholeProject && startDate && endDate) {
          const hasConflict = checkExclusiveUserConflicts(assignment.userId, startDate, endDate);
          if (hasConflict) {
            alert('This user is exclusive and already assigned to another project during this time period.');
            return assignment;
          }
        }
        
        const newRange = {
          id: `range-${Date.now()}`,
          startDate,
          endDate,
          notes: isWholeProject ? 'Full project duration' : ''
        };
        
        return {
          ...assignment,
          dateRanges: [...assignment.dateRanges, newRange]
        };
      }
      return assignment;
    }));
  };

  const removeDateRange = (assignmentId: string, rangeId: string) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        const newRanges = assignment.dateRanges.filter(range => range.id !== rangeId);
        if (newRanges.length === 0) {
          return assignment; // Keep at least one range
        }
        return {
          ...assignment,
          dateRanges: newRanges
        };
      }
      return assignment;
    }));
  };

  const updateAssignment = (assignmentId: string, field: keyof TeamMemberAssignment, value: any) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return { ...assignment, [field]: value };
      }
      return assignment;
    }));
  };

  const updateDateRange = (assignmentId: string, rangeId: string, field: keyof DateRange, value: any) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          dateRanges: assignment.dateRanges.map(range => {
            if (range.id === rangeId) {
              return { ...range, [field]: value };
            }
            return range;
          })
        };
      }
      return assignment;
    }));
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
  };

  const saveAssignments = async () => {
    try {
      setIsSaving(true);
      
      // First, remove all existing assignments
      for (const member of teamMembers) {
        await apiClient.removeProjectTeamMember(projectId, member.id);
      }

      // Then add all new assignments
      for (const assignment of assignments) {
        if (assignment.userId && assignment.roleId) {
          for (const dateRange of assignment.dateRanges) {
            if (dateRange.startDate && dateRange.endDate) {
              await apiClient.addProjectTeamMember(projectId, {
                userId: assignment.userId,
                roleId: assignment.roleId,
                startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
                endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
                notes: dateRange.notes
              });
            }
          }
        }
      }

      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Failed to save team assignments. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const getRoleName = (roleId: number) => {
    const role = projectRoles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading team assignments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Assignment
          </div>
          <Button onClick={addNewAssignment} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex justify-center">
          <Button onClick={addToWholeProject} size="sm" variant="outline" className="w-full max-w-xs">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Add Team Member to Whole Project
          </Button>
        </div>
        
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="border-2 relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`user-${assignment.id}`}>Team Member</Label>
                    <Select
                      value={assignment.userId.toString()}
                      onValueChange={(value) => updateAssignment(assignment.id, 'userId', parseInt(value))}
                    >
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
                  
                  <div className="flex-1">
                    <Label htmlFor={`role-${assignment.id}`}>Role</Label>
                    <Select
                      value={assignment.roleId.toString()}
                      onValueChange={(value) => updateAssignment(assignment.id, 'roleId', parseInt(value))}
                    >
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
                  
                  {assignment.dateRanges.some(range => range.notes === 'Full project duration') && (
                    <div className="flex items-center">
                      <Badge variant="secondary" className="text-xs">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Full Project
                      </Badge>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAssignment(assignment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Date Ranges</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addDateRange(assignment.id, true)}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Add to Whole Project
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addDateRange(assignment.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Date Range
                    </Button>
                  </div>
                </div>
                
                {assignment.dateRanges.map((dateRange, index) => (
                  <div key={dateRange.id} className="border rounded-lg p-4 space-y-4 relative overflow-visible">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">Date Range {index + 1}</h5>
                        {dateRange.notes === 'Full project duration' && (
                          <Badge variant="secondary" className="text-xs">
                            Full Project
                          </Badge>
                        )}
                      </div>
                      {assignment.dateRanges.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDateRange(assignment.id, dateRange.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.startDate ? format(dateRange.startDate, 'PPP') : 'Select start date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.startDate}
                              onSelect={(date) => updateDateRange(assignment.id, dateRange.id, 'startDate', date)}
                              disabled={(date) => {
                                const projectStart = new Date(projectStartDate + 'T00:00:00');
                                const projectEnd = new Date(projectEndDate + 'T00:00:00');
                                return date < projectStart || date > projectEnd;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.endDate ? format(dateRange.endDate, 'PPP') : 'Select end date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.endDate}
                              onSelect={(date) => updateDateRange(assignment.id, dateRange.id, 'endDate', date)}
                              disabled={(date) => {
                                const projectStart = new Date(projectStartDate + 'T00:00:00');
                                const projectEnd = new Date(projectEndDate + 'T00:00:00');
                                const startDate = dateRange.startDate;
                                return date < projectStart || date > projectEnd || (startDate && date < startDate);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`notes-${dateRange.id}`}>Notes (Optional)</Label>
                      <Input
                        id={`notes-${dateRange.id}`}
                        value={dateRange.notes}
                        onChange={(e) => updateDateRange(assignment.id, dateRange.id, 'notes', e.target.value)}
                        placeholder="Add notes for this date range..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {assignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No team members assigned yet.</p>
            <p className="text-sm">Click "Add Team Member" to get started.</p>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={saveAssignments} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Assignments'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTeamAssignmentEnhanced;
