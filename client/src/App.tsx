import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import TasksPage from "@/pages/tasks-page";
import EmployeesPage from "@/pages/employees-page";
import OrdersPage from "@/pages/orders-page";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <AdminRoute path="/employees" component={EmployeesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
