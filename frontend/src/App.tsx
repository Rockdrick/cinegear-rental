import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import GearInventory from "./pages/GearInventory";
import Bookings from "./pages/Bookings";
import KitManagement from "./pages/KitManagement";
import Admin from "./pages/Admin";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Clients from "./pages/Clients";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Index /> : <Login />} 
      />
      <Route 
        path="/" 
        element={isAuthenticated ? <Index /> : <Login />} 
      />
      <Route 
        path="/gear" 
        element={isAuthenticated ? <GearInventory /> : <Login />} 
      />
      <Route 
        path="/bookings" 
        element={isAuthenticated ? <Bookings /> : <Login />} 
      />
      <Route 
        path="/kit-management" 
        element={isAuthenticated ? <KitManagement /> : <Login />} 
      />
      <Route 
        path="/projects" 
        element={isAuthenticated ? <Projects /> : <Login />} 
      />
                  <Route
                    path="/team"
                    element={isAuthenticated ? <Team /> : <Login />}
                  />
                  <Route
                    path="/clients"
                    element={isAuthenticated ? <Clients /> : <Login />}
                  />
                  <Route
                    path="/contacts"
                    element={isAuthenticated ? <Contacts /> : <Login />}
                  />
                  <Route
                    path="/settings"
                    element={isAuthenticated ? <Settings /> : <Login />}
                  />
                  <Route
                    path="/admin"
                    element={isAuthenticated ? <Admin /> : <Login />}
                  />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PermissionsProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </PermissionsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
