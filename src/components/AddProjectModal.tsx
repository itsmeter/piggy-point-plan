import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatNumberWithCommas, parseFormattedNumber } from '@/lib/utils';

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: any) => Promise<boolean>;
}

export function AddProjectModal({ open, onClose, onSubmit }: AddProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      return;
    }

    setLoading(true);
    const success = await onSubmit({
      ...formData,
      budget: formData.budget ? parseFloat(parseFormattedNumber(formData.budget)) : null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      status: 'active'
    });

    setLoading(false);
    
    if (success) {
      setFormData({
        name: '',
        description: '',
        budget: '',
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
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input
                placeholder="e.g., Emergency Fund"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your goal..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                <Input
                  type="text"
                  placeholder="0"
                  value={formData.budget}
                  onChange={(e) => {
                    const value = parseFormattedNumber(e.target.value);
                    if (value === '' || !isNaN(Number(value))) {
                      setFormData({ ...formData, budget: formatNumberWithCommas(value) });
                    }
                  }}
                  className="pl-8"
                />
              </div>
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

            <div>
              <Label>Target Date (Optional)</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
