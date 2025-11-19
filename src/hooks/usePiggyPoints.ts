import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface PiggyPoints {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  points_to_next_level: number;
  login_streak: number;
  last_login_date: string | null;
  created_at: string;
  updated_at: string;
}

export function usePiggyPoints() {
  const { user } = useAuth();
  const [piggyPoints, setPiggyPoints] = useState<PiggyPoints | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPiggyPoints = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('piggy_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setPiggyPoints(data);
    } catch (error: any) {
      console.error('Error fetching piggy points:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (points: number, reason?: string) => {
    if (!user || !piggyPoints) return;

    try {
      const newTotal = piggyPoints.total_points + points;
      let newLevel = piggyPoints.current_level;
      let pointsToNext = piggyPoints.points_to_next_level;

      // Calculate level up
      if (newTotal >= pointsToNext) {
        newLevel += 1;
        pointsToNext = newLevel * 1000; // Simple formula: level * 1000
      }

      const { error } = await supabase
        .from('piggy_points')
        .update({
          total_points: newTotal,
          current_level: newLevel,
          points_to_next_level: pointsToNext
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Points Earned!',
        description: `+${points} PiggyPoints${reason ? ` for ${reason}` : ''}${newLevel > piggyPoints.current_level ? ` 🎉 Level Up to ${newLevel}!` : ''}`
      });

      await fetchPiggyPoints();
      return true;
    } catch (error: any) {
      console.error('Error adding points:', error);
      return false;
    }
  };

  const spendPoints = async (points: number, reason: string) => {
    if (!user || !piggyPoints) return;

    if (piggyPoints.total_points < points) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${points} points but only have ${piggyPoints.total_points}`,
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('piggy_points')
        .update({
          total_points: piggyPoints.total_points - points
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Points Spent',
        description: `-${points} PiggyPoints for ${reason}`
      });

      await fetchPiggyPoints();
      return true;
    } catch (error: any) {
      console.error('Error spending points:', error);
      toast({
        title: 'Error',
        description: 'Failed to spend points',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPiggyPoints();
  }, [user]);

  return {
    piggyPoints,
    loading,
    addPoints,
    spendPoints,
    refreshPiggyPoints: fetchPiggyPoints
  };
}
