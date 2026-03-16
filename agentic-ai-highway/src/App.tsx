import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import SubmitApplication from "./pages/SubmitApplication";
import TrackApplication from "./pages/TrackApplication";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLogs from "./pages/AuditLogs";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/portal/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/*" element={
            <DashboardLayout>
              <Routes>
                {/* Citizen Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRole="citizen"><Index /></ProtectedRoute>} />
                <Route path="/services" element={<Services />} />
                <Route path="/submit" element={<ProtectedRoute allowedRole="citizen"><SubmitApplication /></ProtectedRoute>} />
                <Route path="/track" element={<ProtectedRoute allowedRole="citizen"><TrackApplication /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/audit-logs" element={<ProtectedRoute allowedRole="admin"><AuditLogs /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
