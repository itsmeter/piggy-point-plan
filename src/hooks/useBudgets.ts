import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  spent: number;
  type: 'monthly' | 'project';
  status: 'active' | 'completed' | 'archived';
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBudgets((data as Budget[]) || []);
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load budgets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'spent'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .insert({
          ...budget,
          user_id: user.id,
          amount: Number(budget.amount),
          spent: 0
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Budget created successfully'
      });

      await fetchBudgets();
      return true;
    } catch (error: any) {
      console.error('Error creating budget:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create budget',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Budget updated'
      });

      await fetchBudgets();
      return true;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to update budget',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Budget deleted'
      });

      await fetchBudgets();
      return true;
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete budget',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  return {
    budgets,
    loading,
    createBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets: fetchBudgets
  };
}
