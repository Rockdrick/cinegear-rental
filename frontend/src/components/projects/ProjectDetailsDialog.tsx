import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, DollarSign, User, Clock, Mail, Phone } from 'lucide-react';
import { apiClient, Project, ProjectTeamMember } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

interface ProjectDetailsDialogProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      fetchTeamMembers();
    }
  }, [project, isOpen]);

  const fetchTeamMembers = async () => {
    if (!project) return;
    
    try {
      setIsLoadingTeam(true);
      const members = await apiClient.getProjectTeamMembers(project.id);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-visible">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Project Overview</span>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Description</h4>
                  <p className="text-sm">{project.description || 'No description provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Client</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{project.client?.name || 'No client assigned'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Start Date</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(project.startDate)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">End Date</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(project.endDate)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Duration</h4>
                  <span className="text-sm">
                    {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Location</h4>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{project.location || 'No location specified'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Budget</h4>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {project.budget ? `$${project.budget.toLocaleString()}` : 'No budget specified'}
                    </span>
                  </div>
                </div>
              </div>

              {project.projectManager && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-600">Project Manager</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {project.projectManager.firstName} {project.projectManager.lastName}
                    </span>
                    <span className="text-xs text-gray-500">({project.projectManager.email})</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTeam ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading team members...</p>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No team members assigned to this project yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h4 className="font-medium">
                              {member.firstName} {member.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                          <Badge className={getRoleColor(member.roleName)}>
                            {member.roleName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Period: {formatDateShort(member.startDate)} - {formatDateShort(member.endDate)}</span>
                          </div>
                          {member.notes && (
                            <div className="flex items-center gap-1">
                              <span>•</span>
                              <span>{member.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Project Start</p>
                    <p className="text-sm text-gray-500">{formatDate(project.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Project End</p>
                    <p className="text-sm text-gray-500">{formatDate(project.endDate)}</p>
                  </div>
                </div>
                
                {teamMembers.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Team Assignment Schedule</p>
                    <div className="space-y-2">
                      {teamMembers
                        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                        .map((member) => (
                          <div key={member.id} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{member.firstName} {member.lastName}</span>
                            <Badge variant="outline" className={getRoleColor(member.roleName)}>
                              {member.roleName}
                            </Badge>
                            <span className="text-gray-500">
                              {formatDateShort(member.startDate)} - {formatDateShort(member.endDate)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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

export default ProjectDetailsDialog;
