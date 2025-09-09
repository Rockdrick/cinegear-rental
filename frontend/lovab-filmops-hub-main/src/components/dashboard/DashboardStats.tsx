import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, Users, AlertTriangle, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardStats = () => {
  const { t } = useLanguage();
  const { totalGear, activeBookings, teamMembers, itemsInService, isLoading } = useDashboardData();
  
  const stats = [
    {
      title: t.dashboard.stats.totalGear,
      value: isLoading ? "..." : totalGear.toLocaleString(),
      change: `+0 ${t.dashboard.stats.changes.thisMonth}`,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t.dashboard.stats.activeBookings,
      value: isLoading ? "..." : activeBookings.toString(),
      change: `0 ${t.dashboard.stats.changes.dueToday}`,
      icon: Calendar,
      color: "text-booked",
      bgColor: "bg-blue-100",
    },
    {
      title: t.dashboard.stats.teamMembers,
      value: isLoading ? "..." : teamMembers.toString(),
      change: `0 ${t.dashboard.stats.changes.onAssignment}`,
      icon: Users,
      color: "text-success",
      bgColor: "bg-green-100",
    },
    {
      title: t.dashboard.stats.itemsInService,
      value: isLoading ? "..." : itemsInService.toString(),
      change: `0 ${t.dashboard.stats.changes.overdue}`,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;