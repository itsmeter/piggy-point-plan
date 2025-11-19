import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { Progress } from "@/components/ui/progress";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const Reports = () => {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();

  // Calculate last 6 months of savings
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthTx = transactions.filter(t => {
      const txDate = new Date(t.transaction_date);
      return txDate >= monthStart && txDate <= monthEnd;
    });

    const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = monthTx.filter(t => t.type === 'expense' || t.type === 'project-contribution').reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      month: format(date, 'MMM'),
      saved: income - expenses,
      income,
      expenses
    };
  });

  // Category breakdown for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTx = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && (t.type === 'expense' || t.type === 'project-contribution');
  });

  const categoryTotals = currentMonthTx.reduce((acc, tx) => {
    const category = tx.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Number(tx.amount);
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

  // Budget vs Actual
  const activeBudgets = budgets.filter(b => b.status === 'active');

  const maxSaved = Math.max(...last6Months.map(m => m.saved), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Visualize your financial data</p>
        </div>

        {/* Saved Money Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Money per Month (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {last6Months.map((month) => {
                const percentage = maxSaved > 0 ? (month.saved / maxSaved) * 100 : 0;
                const isPositive = month.saved >= 0;

                return (
                  <div key={month.month}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{month.month}</span>
                      <span className={`font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        ₱{Math.abs(month.saved).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Progress 
                      value={Math.abs(percentage)} 
                      className={isPositive ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Income: ₱{month.income.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      <span>Expenses: ₱{month.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No expenses this month</p>
            ) : (
              <div className="space-y-4">
                {categoryData.map((cat) => {
                  const percentage = (cat.amount / totalExpenses) * 100;

                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{cat.category}</span>
                        <span className="font-semibold">
                          ₱{cat.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Expenses</span>
                    <span className="font-bold">
                      ₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual Spending</CardTitle>
          </CardHeader>
          <CardContent>
            {activeBudgets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active budgets</p>
            ) : (
              <div className="space-y-6">
                {activeBudgets.map((budget) => {
                  const amount = Number(budget.amount);
                  const spent = Number(budget.spent);
                  const percentage = (spent / amount) * 100;
                  const isOver = spent > amount;

                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{budget.name}</span>
                        <div className="text-right">
                          <div className={`font-semibold ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                            ₱{spent.toLocaleString('en-PH', { minimumFractionDigits: 2 })} / ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% used
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={Math.min(percentage, 100)} className={isOver ? '[&>div]:bg-destructive' : ''} />
                        {isOver && (
                          <p className="text-xs text-destructive">Over budget by ₱{(spent - amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
