import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, Frame, Check, Loader2, Image, Gift } from "lucide-react";
import { usePiggyPoints } from "@/hooks/usePiggyPoints";
import { useShopPurchases } from "@/hooks/useShopPurchases";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import coinIcon from "@/assets/coin.png";

const getItemIcon = (type: string) => {
  switch (type) {
    case 'theme': return Palette;
    case 'icon': return Sparkles;
    case 'avatar_frame': return Frame;
    case 'background': return Image;
    default: return Sparkles;
  }
};

const ItemPreview = ({ item }: { item: any }) => {
  const config = item.config as Record<string, any> | null;
  
  if (!config) return null;

  switch (item.type) {
    case 'theme':
      return (
        <div 
          className="h-20 rounded-lg mb-4 border border-border"
          style={{ background: config.gradient }}
        />
      );
    case 'background':
      return (
        <div 
          className="h-20 rounded-lg mb-4 border border-border"
          style={{ 
            background: config.gradient,
            backgroundColor: config.backgroundColor 
          }}
        />
      );
    case 'avatar_frame':
      return (
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
            style={{ 
              borderColor: config.borderColor,
              borderWidth: config.borderWidth,
              borderStyle: config.borderStyle,
              borderImage: config.borderImage,
              boxShadow: config.glow
            }}
          >
            <span className="text-2xl">👤</span>
          </div>
        </div>
      );
    case 'icon':
      return (
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl"
            style={{ color: config.color }}
          >
            {config.emoji}
          </div>
        </div>
      );
    default:
      return null;
  }
};

const Shop = () => {
  const { user } = useAuth();
  const { piggyPoints } = usePiggyPoints();
  const { shopItems, loading, purchaseItem, isPurchased, equipItem } = useShopPurchases();
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveTheme = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_settings')
        .select('active_theme_id')
        .eq('user_id', user.id)
        .single();
      setActiveThemeId(data?.active_theme_id || null);
    };
    fetchActiveTheme();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const themes = shopItems.filter(i => i.type === 'theme');
  const backgrounds = shopItems.filter(i => i.type === 'background');
  const frames = shopItems.filter(i => i.type === 'avatar_frame');
  const icons = shopItems.filter(i => i.type === 'icon');

  const handleEquip = async (item: any) => {
    const success = await equipItem(item);
    if (success && item.type === 'theme') {
      setActiveThemeId(item.id);
    }
  };

  const renderItems = (items: any[]) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = getItemIcon(item.type);
        const config = item.config as Record<string, any> | null;
        const isDefault = config?.isDefault === true;
        const owned = isDefault || isPurchased(item.id);
        const canAfford = (piggyPoints?.total_points || 0) >= item.price;
        const isEquipped = activeThemeId === item.id || (isDefault && !activeThemeId);

        return (
          <Card key={item.id} className={`transition-all ${owned ? 'border-success/50' : ''} ${isEquipped ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.type.replace('_', ' ')}
                      </Badge>
                      {isDefault && (
                        <Badge variant="outline" className="text-xs">
                          <Gift className="h-3 w-3 mr-1" />
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isEquipped && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {owned && !isEquipped && (
                  <Badge variant="outline" className="border-success text-success">
                    <Check className="h-3 w-3 mr-1" />
                    Owned
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {item.description}
              </p>

              <ItemPreview item={item} />

              <div className="space-y-3">
                {!isDefault && (
                  <div className="flex items-center gap-2">
                    <img src={coinIcon} alt="PiggyPoints" className="h-5 w-5" />
                    <span className="font-bold text-lg">{item.price}</span>
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                )}

                {owned ? (
                  <Button
                    onClick={() => handleEquip(item)}
                    variant={isEquipped ? "secondary" : "outline"}
                    className="w-full"
                    disabled={isEquipped}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Currently Active
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Equip
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => purchaseItem(item)}
                    disabled={!canAfford}
                    className="w-full"
                  >
                    {canAfford ? 'Purchase' : 'Insufficient Points'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PiggyPoints Shop</h1>
          <p className="text-muted-foreground mt-1">Customize your experience with themes and items</p>
        </div>

        {/* Points Balance */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Your PiggyPoints</div>
                <div className="text-3xl font-bold text-foreground mt-1">
                  {piggyPoints?.total_points || 0}
                </div>
              </div>
              <img src={coinIcon} alt="PiggyPoints" className="h-12 w-12" />
            </div>
          </CardContent>
        </Card>

        {/* Shop Tabs */}
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Themes</span>
            </TabsTrigger>
            <TabsTrigger value="backgrounds" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Backgrounds</span>
            </TabsTrigger>
            <TabsTrigger value="frames" className="flex items-center gap-2">
              <Frame className="h-4 w-4" />
              <span className="hidden sm:inline">Frames</span>
            </TabsTrigger>
            <TabsTrigger value="icons" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Icons</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="themes" className="mt-6">
            {renderItems(themes)}
          </TabsContent>
          <TabsContent value="backgrounds" className="mt-6">
            {renderItems(backgrounds)}
          </TabsContent>
          <TabsContent value="frames" className="mt-6">
            {renderItems(frames)}
          </TabsContent>
          <TabsContent value="icons" className="mt-6">
            {renderItems(icons)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Shop;
