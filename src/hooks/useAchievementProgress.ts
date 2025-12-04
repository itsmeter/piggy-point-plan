import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AchievementProgress {
  transactions: number;
  login_streak: number;
  budget_streak: number;
  projects_completed: number;
  setup_complete: number;
}

export function useAchievementProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<AchievementProgress>({
    transactions: 0,
    login_streak: 0,
    budget_streak: 0,
    projects_completed: 0,
    setup_complete: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all progress data in parallel
      const [transactionsData, piggyPointsData, projectsData, settingsData] = await Promise.all([
        supabase.from('transactions').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('piggy_points').select('login_streak').eq('user_id', user.id).single(),
        supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('user_settings').select('first_setup_completed').eq('user_id', user.id).single()
      ]);

      setProgress({
        transactions: transactionsData.count || 0,
        login_streak: piggyPointsData.data?.login_streak || 0,
        budget_streak: 0, // This would need more complex tracking
        projects_completed: projectsData.count || 0,
        setup_complete: settingsData.data?.first_setup_completed ? 1 : 0
      });
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const getProgressForType = (type: string): number => {
    switch (type) {
      case 'transactions':
        return progress.transactions;
      case 'login_streak':
        return progress.login_streak;
      case 'budget_streak':
        return progress.budget_streak;
      case 'projects_completed':
        return progress.projects_completed;
      case 'setup_complete':
        return progress.setup_complete;
      default:
        return 0;
    }
  };

  return {
    progress,
    loading,
    getProgressForType,
    refreshProgress: fetchProgress
  };
}
