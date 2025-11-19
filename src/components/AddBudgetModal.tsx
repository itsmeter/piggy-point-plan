import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumberWithCommas, parseFormattedNumber } from '@/lib/utils';

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (budget: any) => Promise<boolean>;
}

export function AddBudgetModal({ open, onClose, onSubmit }: AddBudgetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'monthly' as 'monthly' | 'project',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) {
      return;
    }

    setLoading(true);
    const success = await onSubmit({
      ...formData,
      amount: parseFloat(parseFormattedNumber(formData.amount)),
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      status: 'active'
    });

    setLoading(false);
    
    if (success) {
      setFormData({
        name: '',
        amount: '',
        type: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label>Budget Name</Label>
              <Input
                placeholder="e.g., Monthly Groceries"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
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
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'monthly' | 'project') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
