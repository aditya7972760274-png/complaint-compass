import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/authContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ComplaintsListPage from "./pages/ComplaintsListPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import ClustersPage from "./pages/ClustersPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import IntelligencePage from "./pages/IntelligencePage";
import AnomalyDetectionPage from "./pages/AnomalyDetectionPage";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const LoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginRoute />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><ComplaintsListPage /></ProtectedRoute>} />
            <Route path="/complaints/new" element={<ProtectedRoute><NewComplaintPage /></ProtectedRoute>} />
            <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
            <Route path="/clusters" element={<ProtectedRoute><ClustersPage /></ProtectedRoute>} />
            <Route path="/knowledge-graph" element={<ProtectedRoute><KnowledgeGraphPage /></ProtectedRoute>} />
            <Route path="/intelligence" element={<ProtectedRoute><IntelligencePage /></ProtectedRoute>} />
            <Route path="/anomalies" element={<ProtectedRoute><AnomalyDetectionPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
