import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { apiClient, Project } from "@/lib/api";
import { useState, useEffect } from "react";
import { StatusToggleGroup } from "@/components/ui/status-toggle";

const BookingCalendar = () => {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthName = currentDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  // Initialize active statuses with translated values
  useEffect(() => {
    setActiveStatuses([t.projects.status.active, t.projects.status.planned]);
  }, [t.projects.status.active, t.projects.status.planned]);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const projectsData = await apiClient.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleStatusToggle = (status: string) => {
    setActiveStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaysInMonth = () => {
    const days = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(day);
    }
    
    return days;
  };

  const hasProjectOnDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    return projects.some(project => {
      const startDate = new Date(project.startDate).toISOString().split('T')[0];
      const endDate = new Date(project.endDate).toISOString().split('T')[0];
      
      // Map English status to translated status for comparison
      const statusMap: { [key: string]: string } = {
        'Active': t.projects.status.active,
        'Planned': t.projects.status.planned,
        'Completed': t.projects.status.completed,
        'On Hold': t.projects.status.onHold,
        'Cancelled': t.projects.status.cancelled
      };
      const translatedStatus = statusMap[project.status] || project.status;
      
      return dateStr >= startDate && dateStr <= endDate && activeStatuses.includes(translatedStatus);
    });
  };

  const getProjectsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    return projects.filter(project => {
      const startDate = new Date(project.startDate).toISOString().split('T')[0];
      const endDate = new Date(project.endDate).toISOString().split('T')[0];
      
      // Map English status to translated status for comparison
      const statusMap: { [key: string]: string } = {
        'Active': t.projects.status.active,
        'Planned': t.projects.status.planned,
        'Completed': t.projects.status.completed,
        'On Hold': t.projects.status.onHold,
        'Cancelled': t.projects.status.cancelled
      };
      const translatedStatus = statusMap[project.status] || project.status;
      
      return dateStr >= startDate && dateStr <= endDate && activeStatuses.includes(translatedStatus);
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {activeStatuses.length === 1 
              ? `${activeStatuses[0]} ${t.projects.projectsCalendar}`
              : activeStatuses.length > 1 
                ? `${activeStatuses.join(', ')} ${t.projects.projectsCalendar}`
                : t.projects.projectsCalendar
            }
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">{monthName}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="ml-2"
              onClick={() => {
                // TODO: Implement new project functionality
                console.log('New project clicked');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
        <div className="mt-4">
            <StatusToggleGroup
              statuses={[t.projects.status.active, t.projects.status.planned, t.projects.status.completed, t.projects.status.onHold, t.projects.status.cancelled]}
              activeStatuses={activeStatuses}
              onToggle={handleStatusToggle}
            />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {[t.calendar.days.sun, t.calendar.days.mon, t.calendar.days.tue, t.calendar.days.wed, t.calendar.days.thu, t.calendar.days.fri, t.calendar.days.sat].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[80px] p-2 rounded-md border border-border hover:bg-muted/50 transition-colors
                ${day ? 'cursor-pointer' : ''}
                ${day === currentDate.getDate() ? 'bg-primary/10 border-primary/30' : ''}
              `}
            >
              {day && (
                <>
                  <div className="text-sm font-medium mb-1">{day}</div>
                  {hasProjectOnDate(day) && (
                    <div className="space-y-1">
                      {getProjectsForDate(day).map(project => (
                        <div
                          key={project.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                          title={`${project.name} - ${project.client.name}`}
                        >
                          {project.name.substring(0, 15)}...
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Active Projects</h4>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading projects...
              </div>
            ) : projects.filter(project => project.status === 'Active').length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No active projects
              </div>
            ) : (
              projects.filter(project => project.status === 'Active').slice(0, 3).map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant="default"
                    className="bg-blue-100 text-blue-800"
                  >
                    {project.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;