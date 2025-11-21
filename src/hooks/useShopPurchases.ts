import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { usePiggyPoints } from './usePiggyPoints';

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  config: any;
  preview_url: string | null;
  is_available: boolean;
}

interface UserPurchase {
  id: string;
  shop_item_id: string;
  user_id: string;
  is_active: boolean;
  purchased_at: string;
}

export function useShopPurchases() {
  const { user } = useAuth();
  const { piggyPoints, spendPoints, refreshPiggyPoints } = usePiggyPoints();
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPurchases(data || []);
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchShopItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_available', true)
        .order('type')
        .order('price');

      if (error) throw error;
      setShopItems(data || []);
    } catch (error: any) {
      console.error('Error fetching shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (item: ShopItem): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to make purchases',
        variant: 'destructive'
      });
      return false;
    }

    // Check if already purchased
    if (purchases.some(p => p.shop_item_id === item.id)) {
      toast({
        title: 'Already Owned',
        description: 'You already own this item',
        variant: 'destructive'
      });
      return false;
    }

    // Check points
    if (!piggyPoints || piggyPoints.total_points < item.price) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${item.price} points but only have ${piggyPoints?.total_points || 0}`,
        variant: 'destructive'
      });
      return false;
    }

    try {
      // Spend points first
      const pointsSpent = await spendPoints(item.price, item.name);
      if (!pointsSpent) return false;

      // Record purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          shop_item_id: item.id,
          user_id: user.id,
          is_active: item.type === 'theme' ? true : false // Auto-activate themes
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // If it's a theme, set it as active
      if (item.type === 'theme') {
        const { error: settingsError } = await supabase
          .from('user_settings')
          .update({ 
            active_theme_id: item.id,
            theme: 'custom' 
          })
          .eq('user_id', user.id);

        if (settingsError) throw settingsError;

        // Apply theme immediately
        applyTheme(item);
      }

      // Refresh purchases and points
      await fetchPurchases();
      await refreshPiggyPoints();

      toast({
        title: '🎉 Purchase Successful!',
        description: `${item.name} has been added to your collection${item.type === 'theme' ? ' and applied!' : ''}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'An error occurred during purchase',
        variant: 'destructive'
      });
      return false;
    }
  };

  const applyTheme = (item: ShopItem) => {
    if (!item.config) return;

    const root = document.documentElement;
    const config = item.config;

    // Apply theme colors
    if (config.primary) {
      root.style.setProperty('--primary', config.primary);
    }
    if (config.primaryGlow) {
      root.style.setProperty('--primary-glow', config.primaryGlow);
    }
    if (config.gradient) {
      root.style.setProperty('--gradient-primary', config.gradient);
    }

    // Store in localStorage as fallback
    localStorage.setItem('activeTheme', item.id);
  };

  const loadActiveTheme = async () => {
    if (!user) return;

    try {
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('active_theme_id')
        .eq('user_id', user.id)
        .single();

      if (error || !settings?.active_theme_id) return;

      // Fetch the theme item
      const { data: themeItem, error: themeError } = await supabase
        .from('shop_items')
        .select('*')
        .eq('id', settings.active_theme_id)
        .single();

      if (themeError || !themeItem) return;

      applyTheme(themeItem);
    } catch (error: any) {
      console.error('Error loading active theme:', error);
    }
  };

  const isPurchased = (itemId: string): boolean => {
    return purchases.some(p => p.shop_item_id === itemId);
  };

  useEffect(() => {
    if (user) {
      fetchPurchases();
      fetchShopItems();
      loadActiveTheme();
    }
  }, [user]);

  return {
    purchases,
    shopItems,
    loading,
    purchaseItem,
    isPurchased,
    refreshPurchases: fetchPurchases,
    loadActiveTheme
  };
}
