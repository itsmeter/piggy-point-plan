import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePiggyPoints } from "@/hooks/usePiggyPoints";
import { useTransactions } from "@/hooks/useTransactions";
import {
  LayoutDashboard,
  Receipt,
  Target,
  BarChart3,
  FolderKanban,
  Settings,
  Store,
  Award,
  Menu,
  X,
  Trophy,
  LogOut,
  Eye,
  EyeOff,
  Wallet
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { piggyPoints } = usePiggyPoints();
  const { balance } = useTransactions();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

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

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="PiggyPoints" className="h-8 w-8" />
            <span className="font-bold text-lg">PiggyPoints</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-lg">
              <Wallet className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold">
                {balanceHidden ? '••••••' : `₱${balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setBalanceHidden(!balanceHidden)}
              >
                {balanceHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <div className="flex items-center gap-1 bg-piggy-gold/10 px-2 py-1 rounded-lg">
              <Trophy className="h-3 w-3 text-piggy-gold" />
              <span className="text-xs font-semibold">{piggyPoints?.total_points || 0}</span>
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
            <img src={logo} alt="PiggyPoints" className="h-10 w-10" />
            <span className="font-bold text-xl">PiggyPoints</span>
          </div>

          {/* PiggyPoints and Balance Display */}
          <div className="mx-6 mb-6 space-y-3">
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Balance</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setBalanceHidden(!balanceHidden)}
                >
                  {balanceHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <div className="text-2xl font-bold">
                {balanceHidden ? '••••••' : `₱${balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-piggy-gold/10 to-piggy-gold/5 border border-piggy-gold/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">PiggyPoints</span>
                <Trophy className="h-5 w-5 text-piggy-gold" />
              </div>
              <div className="text-2xl font-bold">{piggyPoints?.total_points || 0}</div>
            </div>
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
