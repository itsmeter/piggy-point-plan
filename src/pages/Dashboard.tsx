import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Calendar, Trophy, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import FirstTimeSetup from "@/components/FirstTimeSetup";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const isFirstTime = localStorage.getItem("isFirstTime");
    if (isFirstTime === "true") {
      setShowSetup(true);
    }
  }, []);

  const handleSetupComplete = () => {
    localStorage.removeItem("isFirstTime");
    setShowSetup(false);
  };

  const motivationalQuote = {
    text: "Every peso you save is a step closer to freedom.",
    icon: <Sparkles className="h-5 w-5" />,
  };

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
              <div className="text-2xl font-bold text-foreground">₱45,230.00</div>
              <p className="text-xs text-success flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
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
              <div className="text-2xl font-bold text-foreground">₱15,000.00</div>
              <Progress value={65} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">₱9,750 spent</p>
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
              <div className="text-2xl font-bold text-foreground">₱3,450.00</div>
              <p className="text-xs text-warning flex items-center mt-1">
                3 bills due this week
              </p>
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
              <div className="text-2xl font-bold text-foreground">1,250</div>
              <p className="text-xs text-muted-foreground mt-1">Level 5 • Gold Saver</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Motivational Quote */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {motivationalQuote.icon}
                Daily Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground italic text-lg leading-relaxed">
                "{motivationalQuote.text}"
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm">Copy Quote</Button>
                <Button variant="ghost" size="sm">Save</Button>
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expense */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Income vs Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Income</span>
                <span className="text-lg font-semibold text-success">₱25,000.00</span>
              </div>
              <Progress value={100} className="h-2 bg-success/20" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <span className="text-lg font-semibold text-destructive">₱9,750.00</span>
              </div>
              <Progress value={39} className="h-2 bg-destructive/20" />
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Savings</span>
                  <span className="text-lg font-bold text-success">₱15,250.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TransactionItem
                title="Grocery Shopping"
                category="Food"
                amount="₱1,250.00"
                date="Today, 2:30 PM"
                type="expense"
              />
              <TransactionItem
                title="Monthly Salary"
                category="Income"
                amount="₱25,000.00"
                date="Yesterday"
                type="income"
              />
              <TransactionItem
                title="Internet Bill"
                category="Bills"
                amount="₱1,500.00"
                date="2 days ago"
                type="expense"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {showSetup && <FirstTimeSetup onComplete={handleSetupComplete} />}
    </DashboardLayout>
  );
};

const TransactionItem = ({
  title,
  category,
  amount,
  date,
  type,
}: {
  title: string;
  category: string;
  amount: string;
  date: string;
  type: "income" | "expense";
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${type === "income" ? "bg-success/10" : "bg-destructive/10"}`}>
          {type === "income" ? (
            <ArrowUpRight className={`h-4 w-4 text-success`} />
          ) : (
            <ArrowDownRight className={`h-4 w-4 text-destructive`} />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{category} • {date}</p>
        </div>
      </div>
      <span className={`font-semibold ${type === "income" ? "text-success" : "text-foreground"}`}>
        {type === "income" ? "+" : "-"}{amount}
      </span>
    </div>
  );
};

export default Dashboard;
