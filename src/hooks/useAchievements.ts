import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { usePiggyPoints } from './usePiggyPoints';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  requirement_type: string;
  requirement_value: number | null;
  points_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const { addPoints } = usePiggyPoints();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [achievementsData, userAchievementsData] = await Promise.all([
        supabase.from('achievements').select('*'),
        supabase.from('user_achievements').select('*').eq('user_id', user.id)
      ]);

      if (achievementsData.error) throw achievementsData.error;
      if (userAchievementsData.error) throw userAchievementsData.error;

      setAchievements(achievementsData.data || []);
      setUserAchievements(userAchievementsData.data || []);
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (achievementId: string) => {
    if (!user) return;

    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    // Check if already claimed
    const alreadyClaimed = userAchievements.some(ua => ua.achievement_id === achievementId);
    if (alreadyClaimed) {
      toast({
        title: 'Already Claimed',
        description: 'You have already claimed this achievement',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId
        });

      if (error) throw error;

      // Award points
      await addPoints(achievement.points_reward, achievement.name);

      toast({
        title: 'Achievement Unlocked! 🏆',
        description: `${achievement.name} - Earned ${achievement.points_reward} points!`
      });

      await fetchAchievements();
      return true;
    } catch (error: any) {
      console.error('Error claiming achievement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim achievement',
        variant: 'destructive'
      });
      return false;
    }
  };

  const checkAchievement = async (type: string, value: number) => {
    if (!user) return;

    const eligibleAchievements = achievements.filter(a => 
      a.requirement_type === type &&
      (a.requirement_value || 0) <= value &&
      !userAchievements.some(ua => ua.achievement_id === a.id)
    );

    for (const achievement of eligibleAchievements) {
      await claimAchievement(achievement.id);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  return {
    achievements,
    userAchievements,
    loading,
    claimAchievement,
    checkAchievement,
    refreshAchievements: fetchAchievements
  };
}
