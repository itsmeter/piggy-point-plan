import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Projects from "./pages/Projects";
import Shop from "./pages/Shop";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import AIAdvisor from "./pages/AIAdvisor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Load user's active theme on app start
function ThemeLoader() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadTheme = async () => {
      try {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('active_theme_id')
          .eq('user_id', user.id)
          .single();

        if (!settings?.active_theme_id) return;

        const { data: themeItem } = await supabase
          .from('shop_items')
          .select('config')
          .eq('id', settings.active_theme_id)
          .single();

        if (!themeItem?.config) return;

        const root = document.documentElement;
        const config = themeItem.config as Record<string, any>;

        if (config.primary) root.style.setProperty('--primary', config.primary);
        if (config.primaryGlow) root.style.setProperty('--primary-glow', config.primaryGlow);
        if (config.gradient) root.style.setProperty('--gradient-primary', config.gradient);
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, [user]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeLoader />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-advisor" element={<AIAdvisor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
