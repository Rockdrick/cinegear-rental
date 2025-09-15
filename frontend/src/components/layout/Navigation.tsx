import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Users, 
  FolderOpen,
  Building2,
  UserCheck,
  Settings,
  Shield,
  Search,
  Bell,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import LanguageSwitcher from "@/components/ui/language-switcher";

const Navigation = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: t.nav.dashboard, path: "/", active: location.pathname === "/" },
    { icon: Package, label: t.nav.gear, path: "/gear", active: location.pathname === "/gear" },
    { icon: Layers, label: "Kit Management", path: "/kit-management", active: location.pathname === "/kit-management" },
    { icon: FolderOpen, label: t.nav.projects, path: "/projects", active: location.pathname === "/projects" },
    { icon: Users, label: t.nav.team, path: "/team", active: location.pathname === "/team" },
    { icon: Building2, label: "Clients", path: "/clients", active: location.pathname === "/clients" },
    { icon: UserCheck, label: "Contacts", path: "/contacts", active: location.pathname === "/contacts" },
    { icon: Shield, label: "Admin", path: "/admin", active: location.pathname === "/admin" },
    { icon: Settings, label: t.nav.settings, path: "/settings", active: location.pathname === "/settings" },
  ];

  return (
    <nav className="w-64 bg-card border-r border-border h-screen flex flex-col shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">{t.nav.title}</h1>
        <p className="text-sm text-muted-foreground">{t.nav.subtitle}</p>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder={t.nav.searchPlaceholder}
            className="pl-10 bg-muted/50 border-border focus:ring-primary"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                item.active 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => {
                navigate(item.path);
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role?.name || 'User'}
            </p>
          </div>
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;