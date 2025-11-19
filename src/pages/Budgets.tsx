import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddBudgetModal } from "@/components/AddBudgetModal";
import { useBudgets } from "@/hooks/useBudgets";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { UtensilsCrossed, Car, Home, Smartphone, ShoppingBag, Heart, GraduationCap, Briefcase } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  'Food & Dining': UtensilsCrossed,
  'Transportation': Car,
  'Rent': Home,
  'Utilities': Smartphone,
  'Shopping': ShoppingBag,
  'Entertainment': Heart,
  'Education': GraduationCap,
  'Other': Briefcase
};

const Budgets = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { budgets, loading, createBudget, deleteBudget } = useBudgets();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
            <p className="text-muted-foreground mt-1">Manage monthly and project budgets</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading budgets...</p>
            </CardContent>
          </Card>
        ) : budgets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No budgets yet — Create your first budget</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {budgets.map((budget) => {
              const amount = Number(budget.amount);
              const spent = Number(budget.spent);
              const percentage = (spent / amount) * 100;
              const remaining = amount - spent;
              const isOver = spent > amount;

              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {CATEGORY_ICONS[budget.name] && (
                          <div className="p-3 bg-primary/10 rounded-full">
                            {(() => {
                              const Icon = CATEGORY_ICONS[budget.name];
                              return <Icon className="h-6 w-6 text-primary" />;
                            })()}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{budget.name}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={budget.type === 'monthly' ? 'default' : 'secondary'}>
                              {budget.type}
                            </Badge>
                            <Badge variant={budget.status === 'active' ? 'default' : 'outline'}>
                              {budget.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Spent</span>
                          <span className={`font-semibold ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                            ₱{spent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={isOver ? '[&>div]:bg-destructive' : ''}
                        />
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-muted-foreground">
                            {percentage.toFixed(1)}% used
                          </span>
                          <span className="font-semibold text-foreground">
                            ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Remaining</span>
                          <span className={`font-bold ${isOver ? 'text-destructive' : 'text-success'}`}>
                            {isOver ? '-' : ''}₱{Math.abs(remaining).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {format(new Date(budget.start_date), 'MMM dd, yyyy')}
                          {budget.end_date && ` - ${format(new Date(budget.end_date), 'MMM dd, yyyy')}`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddBudgetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createBudget}
      />
    </DashboardLayout>
  );
};

export default Budgets;
