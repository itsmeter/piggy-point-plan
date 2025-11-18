import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Receipt,
  Target,
  BarChart3,
  FolderKanban,
  Settings,
  Store,
  Award,
  PiggyBank,
  Menu,
  X,
  Trophy,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Budgets", href: "/budgets", icon: Target },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Shop", href: "/shop", icon: Store },
    { name: "Achievements", href: "/achievements", icon: Award },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // TODO: Implement actual logout
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">PiggySaving</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-piggy-gold/10 px-3 py-1 rounded-full">
              <Trophy className="h-4 w-4 text-piggy-gold" />
              <span className="text-sm font-semibold">1,250</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg">
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-4 py-3"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6">
            <PiggyBank className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">PiggySaving</span>
          </div>

          {/* PiggyPoints Badge */}
          <div className="mx-6 mb-6 p-4 bg-gradient-to-br from-piggy-gold/10 to-piggy-gold/5 border border-piggy-gold/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">PiggyPoints</span>
              <Trophy className="h-5 w-5 text-piggy-gold" />
            </div>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground mt-1">Level 5 • Gold Saver</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="pt-20 lg:pt-0 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <nav className="flex justify-around p-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
