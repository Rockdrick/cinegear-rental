import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { apiClient, ProjectTeamMember, Project, User } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

interface TeamCalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DayAssignment {
  date: Date;
  assignments: (ProjectTeamMember & { project: Project; user: User })[];
}

const TeamCalendarView: React.FC<TeamCalendarViewProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allAssignments, setAllAssignments] = useState<ProjectTeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Get all projects and users
      const [projectsData, usersData] = await Promise.all([
        apiClient.getProjects(),
        apiClient.getUsers()
      ]);
      
      setProjects(projectsData);
      setUsers(usersData);
      
      // Get all team assignments across all projects
      const allAssignments: ProjectTeamMember[] = [];
      
      for (const project of projectsData) {
        try {
          const projectAssignments = await apiClient.getProjectTeamMembers(project.id);
          allAssignments.push(...projectAssignments);
        } catch (error) {
          console.error(`Error fetching assignments for project ${project.id}:`, error);
        }
      }
      
      setAllAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
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

  const getProjectStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Active': 'bg-green-100 text-green-800',
      'Planned': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Planning': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAssignmentsForDate = (date: Date): DayAssignment => {
    const assignments = allAssignments.filter(assignment => {
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);
      
      // Check if the date falls within the assignment range
      const isInRange = date >= startDate && date <= endDate;
      
      // Apply filters
      const matchesUser = selectedUser === 'all' || assignment.userId.toString() === selectedUser;
      const matchesRole = selectedRole === 'all' || assignment.roleName === selectedRole;
      
      return isInRange && matchesUser && matchesRole;
    }).map(assignment => ({
      ...assignment,
      project: projects.find(p => p.id === assignment.projectId)!,
      user: users.find(u => u.id === assignment.userId)!
    }));

    return {
      date,
      assignments
    };
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Get the start of the week for the first day of the month (Sunday)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    
    // Check if the month ends on Saturday (6) or Sunday (0) - if so, we need 6 weeks
    const lastDayOfWeek = monthEnd.getDay();
    const needsSixWeeks = lastDayOfWeek === 6 || lastDayOfWeek === 0;
    
    // Use 6 weeks only if the month actually ends on Saturday or Sunday
    const actualWeeks = needsSixWeeks ? 6 : 5;
    const actualDays = actualWeeks * 7;
    
    const days = [];
    for (let i = 0; i < actualDays; i++) {
      const day = new Date(calendarStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return days.map(day => getAssignmentsForDate(day));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getUniqueRoles = () => {
    const roles = [...new Set(allAssignments.map(a => a.roleName))];
    return roles.sort();
  };

  const getTotalAssignments = () => {
    return allAssignments.length;
  };

  const getActiveAssignments = () => {
    const today = new Date();
    return allAssignments.filter(assignment => {
      const start = new Date(assignment.startDate);
      const end = new Date(assignment.endDate);
      return start <= today && end >= today;
    }).length;
  };

  const calendarDays = useMemo(() => {
    if (!isOpen) return [];
    return getCalendarDays();
  }, [isOpen, currentMonth, allAssignments, selectedUser, selectedRole, projects, users]);

  const uniqueRoles = getUniqueRoles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Team Calendar View
          </CardTitle>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold">{getTotalAssignments()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Today</p>
                    <p className="text-2xl font-bold">{getActiveAssignments()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Current Month</p>
                    <p className="text-2xl font-bold">{format(currentMonth, 'MMM yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Filter by User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Filter by Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            
            <Button variant="outline" onClick={() => navigateMonth('next')}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Calendar Grid */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading calendar data...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Scroll indicator */}
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Scroll down to see all days</span>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 sticky top-0 z-10 border-b">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="overflow-y-auto">
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dayData, index) => {
                      const isCurrentMonth = dayData.date.getMonth() === currentMonth.getMonth();
                      const isToday = isSameDay(dayData.date, new Date());
                      
                      return (
                        <div
                          key={index}
                          className={`p-2 border border-gray-200 ${
                            isToday ? 'bg-blue-50 border-blue-300' : 
                            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          }`}
                          style={{ minHeight: `${Math.max(120, 80 + (dayData.assignments.length * 25))}px` }}
                        >
                          <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            <span>{format(dayData.date, 'd')}</span>
                            {dayData.assignments.length > 0 && (
                              <span className={`text-xs px-1 rounded ${
                                isCurrentMonth ? 'text-gray-500 bg-gray-100' : 'text-gray-400 bg-gray-200'
                              }`}>
                                {dayData.assignments.length}
                              </span>
                            )}
                          </div>
                        
                          <div className="space-y-1">
                            {dayData.assignments.map((assignment, idx) => (
                              <div
                                key={idx}
                                className="text-xs p-1 rounded border-l-2 hover:bg-gray-50 transition-colors"
                                style={{
                                  borderLeftColor: assignment.project.status === 'Active' ? '#10b981' : 
                                                  assignment.project.status === 'Planned' ? '#3b82f6' :
                                                  assignment.project.status === 'Completed' ? '#6b7280' : '#f59e0b'
                                }}
                              >
                                <div className="font-medium truncate">
                                  {assignment.user.firstName} {assignment.user.lastName}
                                </div>
                                <div className="text-gray-600 truncate">
                                  {assignment.project.name}
                                </div>
                                <Badge className={`text-xs ${getRoleColor(assignment.roleName)}`}>
                                  {assignment.roleName}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border-l-2 border-green-500"></div>
              <span>Active Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500"></div>
              <span>Planned Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border-l-2 border-gray-500"></div>
              <span>Completed Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 border-l-2 border-yellow-500"></div>
              <span>On Hold Projects</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCalendarView;
