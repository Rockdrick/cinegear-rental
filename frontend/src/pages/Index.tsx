import Navigation from "@/components/layout/Navigation";
import DashboardStats from "@/components/dashboard/DashboardStats";
import BookingCalendar from "@/components/calendar/BookingCalendar";
import GearCard from "@/components/gear/GearCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Download, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDashboardData } from "@/hooks/useDashboardData";

const Index = () => {
  const { t } = useLanguage();
  const { items, isLoading } = useDashboardData();
  
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