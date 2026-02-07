import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { IdeaProvider } from "@/contexts/IdeaContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { ResetPassword } from "@/pages/ResetPassword";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { IdeaBucket } from "@/pages/IdeaBucket";
import { CalendarView } from "@/pages/CalendarView";
import { PastIdeas } from "@/pages/PastIdeas";
import { ArchiveView } from "@/pages/ArchiveView";
import { ManageSettings } from "@/pages/ManageSettings";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <IdeaProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ideas" element={<IdeaBucket />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/history" element={<PastIdeas />} />
          <Route path="/archive" element={<ArchiveView />} />
          <Route path="/settings" element={<ManageSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </IdeaProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
