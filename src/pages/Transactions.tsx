import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { useTransactions } from "@/hooks/useTransactions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Transactions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { transactions, loading, balance, addTransaction, deleteTransaction } = useTransactions();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">Track all your financial activity</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Current Balance</div>
            <div className="text-3xl font-bold text-foreground mt-1">
              ₱{balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions yet — Add your first transaction</p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isIncome = transaction.type === 'income';
                  const amount = Number(transaction.amount);
                  
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isIncome ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          {isIncome ? (
                            <ArrowDownRight className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {transaction.category || 'Uncategorized'}
                          </div>
                          {transaction.details && (
                            <div className="text-sm text-muted-foreground">
                              {transaction.details}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`font-semibold ${isIncome ? 'text-success' : 'text-destructive'}`}>
                            {isIncome ? '+' : '-'}₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </div>
                          <Badge variant={isIncome ? "default" : "secondary"} className="mt-1">
                            {transaction.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addTransaction}
      />
    </DashboardLayout>
  );
};

export default Transactions;
