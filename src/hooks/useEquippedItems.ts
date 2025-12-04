import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface EquippedItems {
  activeTheme: any | null;
  activeFrame: any | null;
  activeIcon: any | null;
  activeBackground: any | null;
}

interface UserProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useEquippedItems() {
  const { user } = useAuth();
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({
    activeTheme: null,
    activeFrame: null,
    activeIcon: null,
    activeBackground: null
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEquippedItems = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user settings with equipped item IDs
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('active_theme_id, active_frame_id, active_icon_id, active_background_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Collect all item IDs to fetch
      const itemIds = [
        settings?.active_theme_id,
        settings?.active_frame_id,
        settings?.active_icon_id,
        settings?.active_background_id
      ].filter(Boolean);

      if (itemIds.length === 0) {
        setEquippedItems({
          activeTheme: null,
          activeFrame: null,
          activeIcon: null,
          activeBackground: null
        });
        setLoading(false);
        return;
      }

      // Fetch all equipped items in one query
      const { data: items, error: itemsError } = await supabase
        .from('shop_items')
        .select('*')
        .in('id', itemIds);

      if (itemsError) throw itemsError;

      // Map items to their categories
      const itemMap = new Map(items?.map(item => [item.id, item]) || []);

      setEquippedItems({
        activeTheme: settings?.active_theme_id ? itemMap.get(settings.active_theme_id) || null : null,
        activeFrame: settings?.active_frame_id ? itemMap.get(settings.active_frame_id) || null : null,
        activeIcon: settings?.active_icon_id ? itemMap.get(settings.active_icon_id) || null : null,
        activeBackground: settings?.active_background_id ? itemMap.get(settings.active_background_id) || null : null
      });
    } catch (error) {
      console.error('Error fetching equipped items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquippedItems();
  }, [user]);

  // Real-time subscription for user_settings changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('equipped-items-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh equipped items when settings change
          fetchEquippedItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    equippedItems,
    profile,
    loading,
    refreshEquippedItems: fetchEquippedItems
  };
}
