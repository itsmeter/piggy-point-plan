import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { usePiggyPoints } from './usePiggyPoints';

const DAILY_REWARD_POINTS = 50;

export function useDailyReward() {
  const { user } = useAuth();
  const { addPoints, refreshPiggyPoints, piggyPoints } = usePiggyPoints();
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastClaimed, setLastClaimed] = useState<string | null>(null);

  const checkCanClaim = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('piggy_points')
        .select('last_daily_reward_claimed, login_streak')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const lastClaimedDate = data?.last_daily_reward_claimed;

      setLastClaimed(lastClaimedDate);
      setCanClaim(lastClaimedDate !== today);
    } catch (error) {
      console.error('Error checking daily reward:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyReward = async (): Promise<boolean> => {
    if (!user || !canClaim) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Calculate new streak
      let newStreak = 1;
      if (lastClaimed === yesterday) {
        newStreak = (piggyPoints?.login_streak || 0) + 1;
      }

      // Bonus points for streak
      const streakBonus = Math.min(newStreak * 10, 100); // Max 100 bonus
      const totalReward = DAILY_REWARD_POINTS + streakBonus;

      // Update last claimed date and streak
      const { error } = await supabase
        .from('piggy_points')
        .update({ 
          last_daily_reward_claimed: today,
          login_streak: newStreak,
          last_login_date: today
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Add points
      await addPoints(totalReward, `Daily Reward (${newStreak} day streak)`);

      toast({
        title: '🎁 Daily Reward Claimed!',
        description: `+${totalReward} points! ${newStreak > 1 ? `🔥 ${newStreak} day streak!` : 'Come back tomorrow for a streak bonus!'}`
      });

      setCanClaim(false);
      setLastClaimed(today);
      await refreshPiggyPoints();

      return true;
    } catch (error: any) {
      console.error('Error claiming daily reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim daily reward',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    checkCanClaim();
  }, [user]);

  return {
    canClaim,
    loading,
    claimDailyReward,
    lastClaimed,
    refreshDailyReward: checkCanClaim
  };
}
