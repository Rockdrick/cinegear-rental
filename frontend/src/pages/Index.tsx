import Navigation from "@/components/layout/Navigation";
import DashboardStats from "@/components/dashboard/DashboardStats";
import BookingCalendar from "@/components/calendar/BookingCalendar";
import GearCard from "@/components/gear/GearCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Download, AlertCircle, Calendar, Users, DollarSign, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState, useMemo, useEffect } from "react";
import { StatusToggleGroup } from "@/components/ui/status-toggle";

const Index = () => {
  const { t } = useLanguage();
  const { items, projects, isLoading } = useDashboardData();
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  // Initialize active statuses with translated values
  useEffect(() => {
    setActiveStatuses([t.projects.status.active, t.projects.status.planned]);
  }, [t.projects.status.active, t.projects.status.planned]);

  const handleStatusToggle = (status: string) => {
    setActiveStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];
    return projects
      .filter(project => {
        // Map English status to translated status for comparison
        const statusMap: { [key: string]: string } = {
          'Active': t.projects.status.active,
          'Planned': t.projects.status.planned,
          'Completed': t.projects.status.completed,
          'On Hold': t.projects.status.onHold,
          'Cancelled': t.projects.status.cancelled
        };
        const translatedStatus = statusMap[project.status] || project.status;
        return activeStatuses.includes(translatedStatus);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects, activeStatuses, t.projects.status]);

  const getStatusColor = (status: string) => {
    // Map English status to color classes
    const statusMap: { [key: string]: string } = {
      'Active': 'bg-green-100 text-green-800',
      'Planned': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Planning': 'bg-purple-100 text-purple-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Get recent gear items from API data
  const recentGearItems = items?.slice(0, 4).map(item => ({
    id: item.id.toString(),
    name: item.name,
    category: item.category.name,
    status: item.isActive ? "available" as const : "unavailable" as const,
    location: item.itemLocation?.name || "Unknown",
    nextBooking: "N/A",
  })) || [];

  // No alerts for now - will be populated from real data later
  const alerts: any[] = [];

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t.dashboard.title}</h1>
              <p className="text-muted-foreground mt-1">
                {t.dashboard.subtitle}
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  // TODO: Implement export functionality
                  console.log('Export report clicked');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                {t.dashboard.buttons.exportReport}
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement add booking functionality
                  console.log('Add booking clicked');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.dashboard.buttons.addBooking}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <DashboardStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Calendar - Takes 2 columns */}
            <div className="lg:col-span-2">
              <BookingCalendar />
            </div>

            {/* Alerts & Notifications */}
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    {t.dashboard.alerts.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'warning' ? 'bg-warning' : 'bg-primary'
                      }`} />
                      <p className="text-sm text-foreground flex-1">{alert.message}</p>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    {t.dashboard.alerts.viewAll}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t.dashboard.quickActions.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.dashboard.quickActions.createBooking}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    {t.dashboard.quickActions.checkAvailability}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    {t.dashboard.quickActions.generateReport}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Projects List - matches calendar selection */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {activeStatuses.length === 1 
                  ? `${activeStatuses[0]} ${t.projects.title}`
                  : activeStatuses.length > 1 
                    ? `${activeStatuses.join(', ')} ${t.projects.title}`
                    : t.projects.title
                }
              </h2>
              <Button variant="outline" onClick={() => window.location.href = '/projects'}>
                {t.projects.viewAllProjects}
              </Button>
            </div>
            
            {/* Status Filters */}
            <div className="mb-6">
              <StatusToggleGroup
                statuses={[t.projects.status.active, t.projects.status.planned, t.projects.status.completed, t.projects.status.onHold, t.projects.status.cancelled]}
                activeStatuses={activeStatuses}
                onToggle={handleStatusToggle}
              />
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">{t.common.loading}</p>
                </div>
              ) : filteredProjects && filteredProjects.length > 0 ? (
                filteredProjects.slice(0, 6).map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold break-words leading-tight">
                            {project.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground break-words">
                            {project.client?.name || 'No client assigned'}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(project.status)} flex-shrink-0`}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex flex-col gap-2">
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
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {projects && projects.length > 0 
                      ? activeStatuses.length > 1 ? t.projects.noProjectsWithStatuses : t.projects.noProjectsWithStatus
                      : t.projects.noProjects
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {projects && projects.length > 0 
                      ? t.projects.tryDifferentFilters
                      : t.projects.createFirst
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Gear Activity */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">{t.dashboard.recentActivity}</h2>
              <Button variant="outline">{t.dashboard.buttons.viewAllGear}</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentGearItems.map(item => (
                <GearCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;