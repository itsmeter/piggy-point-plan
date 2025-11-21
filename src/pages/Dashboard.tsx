import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, Calendar, Trophy, ArrowUpRight, ArrowDownRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import FirstTimeSetup from "@/components/FirstTimeSetup";
import { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { usePiggyPoints } from "@/hooks/usePiggyPoints";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [showSetup, setShowSetup] = useState(false);
  const { transactions, balance } = useTransactions(10);
  const { budgets } = useBudgets();
  const { piggyPoints } = usePiggyPoints();

  useEffect(() => {
    const checkFirstTimeSetup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('first_setup_completed')
        .eq('user_id', user.id)
        .single();

      if (settings && !settings.first_setup_completed) {
        setShowSetup(true);
      }
    };

    checkFirstTimeSetup();
  }, []);

  const handleSetupComplete = () => {
    setShowSetup(false);
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense' || t.type === 'project-contribution').reduce((sum, t) => sum + Number(t.amount), 0);

  const activeBudgets = budgets.filter(b => b.status === 'active');
  const totalBudget = activeBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + Number(b.spent), 0);
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview</p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₱{balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">{monthlyIncome > monthlyExpenses ? 'Positive' : 'Negative'} cash flow</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Budget
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₱{totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
              <Progress value={budgetPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">₱{totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })} spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Bills
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₱{monthlyExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">{monthlyTransactions.length} transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-piggy-gold/10 to-piggy-gold/5 border-piggy-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PiggyPoints
              </CardTitle>
              <Trophy className="h-4 w-4 text-piggy-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{piggyPoints?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Level {piggyPoints?.current_level || 1}</p>
            </CardContent>
          </Card>
        </div>


        {/* Income vs Expense */}
        <Card>
          <CardHeader><CardTitle>Income vs. Expense This Month</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-success" />
                    <span className="text-sm text-muted-foreground">Income</span>
                  </div>
                  <span className="font-semibold text-success">₱{monthlyIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <Progress value={monthlyIncome > 0 ? 100 : 0} className="[&>div]:bg-success" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Expenses</span>
                  </div>
                  <span className="font-semibold text-destructive">₱{monthlyExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <Progress value={monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0} className="[&>div]:bg-destructive" />
              </div>
              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Savings</span>
                <span className={`font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₱{(monthlyIncome - monthlyExpenses).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No transactions yet — Add your first transaction</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {tx.type === 'income' ? <ArrowDownRight className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{tx.category || 'Uncategorized'}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(tx.transaction_date), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {tx.type === 'income' ? '+' : '-'}₱{Number(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {showSetup && <FirstTimeSetup onComplete={handleSetupComplete} />}
    </DashboardLayout>
  );
};

export default Dashboard;
