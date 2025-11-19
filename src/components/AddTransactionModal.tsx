import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBudgets } from '@/hooks/useBudgets';
import { formatNumberWithCommas, parseFormattedNumber } from '@/lib/utils';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => Promise<boolean>;
}

const INCOME_CATEGORIES = ['Salary', 'Donation', 'Bonus'];

export function AddTransactionModal({ open, onClose, onSubmit }: AddTransactionModalProps) {
  const { budgets } = useBudgets();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    details: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const expenseCategories = budgets.map(b => b.name);

  useEffect(() => {
    // Reset category when type changes
    setFormData(prev => ({ ...prev, category: '' }));
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      return;
    }

    setLoading(true);
    const success = await onSubmit({
      ...formData,
      amount: parseFloat(parseFormattedNumber(formData.amount)),
      transaction_date: new Date(formData.transaction_date).toISOString()
    });

    setLoading(false);
    
    if (success) {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        details: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      onClose();
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                <Input
                  type="text"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = parseFormattedNumber(e.target.value);
                    if (value === '' || !isNaN(Number(value))) {
                      setFormData({ ...formData, amount: formatNumberWithCommas(value) });
                    }
                  }}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Note (Optional)</Label>
              <Textarea
                placeholder="Add details..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
