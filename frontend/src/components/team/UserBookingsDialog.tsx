import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, MapPin, DollarSign, User, X } from 'lucide-react';
import { apiClient, ProjectTeamMember, Project } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

interface UserBookingsDialogProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserBookingsDialog: React.FC<UserBookingsDialogProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<ProjectTeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserBookings();
    }
  }, [user, isOpen]);

  const fetchUserBookings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get all projects first
      const allProjects = await apiClient.getProjects();
      setProjects(allProjects);
      
      // Get all team assignments for this user across all projects
      const allBookings: ProjectTeamMember[] = [];
      
      for (const project of allProjects) {
        try {
          const projectBookings = await apiClient.getProjectTeamMembers(project.id);
          const userBookings = projectBookings.filter(booking => booking.userId === user.id);
          allBookings.push(...userBookings);
        } catch (error) {
          console.error(`Error fetching bookings for project ${project.id}:`, error);
        }
      }
      
      // Sort by start date
      allBookings.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getProject = (projectId: number) => {
    return projects.find(p => p.id === projectId);
  };

  const getTotalDays = () => {
    return bookings.reduce((total, booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
  };

  const getActiveBookings = () => {
    const today = new Date();
    return bookings.filter(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      return start <= today && end >= today;
    });
  };

  const getUpcomingBookings = () => {
    const today = new Date();
    return bookings.filter(booking => {
      const start = new Date(booking.startDate);
      return start > today;
    });
  };

  const getPastBookings = () => {
    const today = new Date();
    return bookings.filter(booking => {
      const end = new Date(booking.endDate);
      return end < today;
    });
  };

  if (!user) return null;

  const activeBookings = getActiveBookings();
  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {user.firstName} {user.lastName} - Project Bookings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold">{activeBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Days</p>
                    <p className="text-2xl font-bold">{getTotalDays()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Clock className="h-5 w-5" />
                  Active Bookings ({activeBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeBookings.map((booking) => {
                    const project = getProject(booking.projectId);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{project?.name || 'Unknown Project'}</h4>
                            <Badge className={getProjectStatusColor(project?.status || '')}>
                              {project?.status || 'Unknown'}
                            </Badge>
                            <Badge className={getRoleColor(booking.roleName)}>
                              {booking.roleName}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                          {project?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{project.location}</span>
                            </div>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{booking.notes}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Calendar className="h-5 w-5" />
                  Upcoming Bookings ({upcomingBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => {
                    const project = getProject(booking.projectId);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{project?.name || 'Unknown Project'}</h4>
                            <Badge className={getProjectStatusColor(project?.status || '')}>
                              {project?.status || 'Unknown'}
                            </Badge>
                            <Badge className={getRoleColor(booking.roleName)}>
                              {booking.roleName}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                          {project?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{project.location}</span>
                            </div>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{booking.notes}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5" />
                  Past Bookings ({pastBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastBookings.map((booking) => {
                    const project = getProject(booking.projectId);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{project?.name || 'Unknown Project'}</h4>
                            <Badge className={getProjectStatusColor(project?.status || '')}>
                              {project?.status || 'Unknown'}
                            </Badge>
                            <Badge className={getRoleColor(booking.roleName)}>
                              {booking.roleName}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                          {project?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{project.location}</span>
                            </div>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{booking.notes}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading bookings...</p>
            </div>
          )}

          {!isLoading && bookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No project bookings found for this team member.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserBookingsDialog;
