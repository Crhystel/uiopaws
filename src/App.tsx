import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleBasedRedirect from "@/components/auth/RoleBasedRedirect";

// Pages
import Index from "./pages/Index";
import AnimalsPage from "./pages/AnimalsPage";
import AnimalDetailPage from "./pages/AnimalDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import UserDashboard from "./pages/UserDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnimalsPage from "./pages/admin/AdminAnimalsPage";
import AdminSheltersPage from "./pages/admin/AdminSheltersPage";
import AdminSpeciesPage from "./pages/admin/AdminSpeciesPage";
import AdminBreedsPage from "./pages/admin/AdminBreedsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/animals" element={<AnimalsPage />} />
          <Route path="/animals/:id" element={<AnimalDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/adopt/coming-soon" element={<ComingSoonPage />} />

          {/* Role-based redirect after login */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* User Dashboard */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Dashboard */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute requiredRole="Super Admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/animals"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminAnimalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/species"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminSpeciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/breeds"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminBreedsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shelters"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminSheltersPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
