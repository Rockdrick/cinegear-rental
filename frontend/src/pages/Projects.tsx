import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, DollarSign, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePermissions } from "@/contexts/PermissionsContext";
import ProjectEditDialog from "@/components/projects/ProjectEditDialog";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { apiClient } from "@/lib/api";
import { useState } from "react";

const Projects = () => {
  const { t } = useLanguage();
  const { projects, isLoading } = useDashboardData();
  const { canViewProjects, canEditProjects } = usePermissions();
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "on hold": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "planning": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    console.log('Editing project:', project);
  };

  const handleSaveProject = async (projectData: any) => {
    try {
      console.log('Saving project:', projectData);
      await apiClient.updateProject(editingProject.id, projectData);
      console.log('Project saved successfully');
      setEditingProject(null);
      // Refresh the projects list
      window.location.reload();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
  };

  const handleCreateProject = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateProjectSubmit = async (projectData: any) => {
    try {
      console.log('Creating new project:', projectData);
      await apiClient.createProject(projectData);
      console.log('Project created successfully');
      setIsCreateDialogOpen(false);
      // Refresh the projects list
      window.location.reload();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleCancelCreate = () => {
    setIsCreateDialogOpen(false);
  };

  // Check permissions
  if (!canViewProjects) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to view projects.
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
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage your production projects and clients
              </p>
            </div>
            {canEditProjects && (
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            )}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading projects...</p>
              </div>
            ) : projects && projects.length > 0 ? (
              projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold break-words leading-tight">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 break-words">
                          {project.client?.name || "No client assigned"}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(project.status || "planning")} flex-shrink-0`}>
                        {project.status || "Planning"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {project.description && (
                        <p className="text-sm text-muted-foreground break-words line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {project.startDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Start:</span>
                            <span>{new Date(project.startDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {project.endDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">End:</span>
                            <span>{new Date(project.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {project.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Location:</span>
                            <span className="break-words">{project.location}</span>
                          </div>
                        )}
                        
                        {project.budget && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Budget:</span>
                            <span>${project.budget.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {project.projectManager && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Manager:</span>
                            <span className="break-words">{project.projectManager.firstName} {project.projectManager.lastName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">View</Button>
                      {canEditProjects && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditProject(project)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started
                </p>
                {canEditProjects && (
                  <Button onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Project Edit Dialog */}
      <ProjectEditDialog
        project={editingProject}
        isOpen={!!editingProject}
        onClose={handleCancelEdit}
        onSave={handleSaveProject}
      />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCancelCreate}
        onCreate={handleCreateProjectSubmit}
      />
    </div>
  );
};

export default Projects;
