import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActiveRoleProvider } from "@/contexts/ActiveRoleContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import CoachDashboard from "./pages/coach/Dashboard";
import ClientDashboard from "./pages/client/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ActiveRoleProvider>
          <ImpersonationProvider>
            <TooltipProvider>
              <ImpersonationBanner />
              <Toaster />
              <Sonner />
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes - Admin */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes - Coach */}
              <Route
                path="/coach/*"
                element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes - Client */}
              <Route
                path="/client/*"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </TooltipProvider>
          </ImpersonationProvider>
        </ActiveRoleProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
