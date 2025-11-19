import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense' | 'project-contribution';
  category: string | null;
  details: string | null;
  transaction_date: string;
  created_at: string;
  project_id?: string | null;
}

export function useTransactions(limit?: number) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTransactions((data as Transaction[]) || []);
      
      // Calculate balance
      const totalIncome = (data || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalExpenses = (data || [])
        .filter(t => t.type === 'expense' || t.type === 'project-contribution')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      setBalance(totalIncome - totalExpenses);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
          amount: Number(transaction.amount)
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Transaction added successfully'
      });

      await fetchTransactions();
      return true;
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Transaction deleted'
      });

      await fetchTransactions();
      return true;
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    balance,
    addTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions
  };
}
