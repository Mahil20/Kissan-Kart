
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import VendorsPage from "./pages/VendorsPage";
import VendorProfilePage from "./pages/VendorProfilePage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import BecomeVendorPage from "./pages/BecomeVendorPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/:id" element={<VendorProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/dashboard" 
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/become-vendor" 
              element={
                <ProtectedRoute>
                  <BecomeVendorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanelPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
