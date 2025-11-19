import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles, Frame, Check } from "lucide-react";
import { usePiggyPoints } from "@/hooks/usePiggyPoints";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const SHOP_ITEMS = [
  {
    id: 'theme-ocean',
    name: 'Ocean Blue Theme',
    description: 'Cool blue gradient theme with wave animations',
    type: 'theme',
    price: 500,
    icon: Palette,
    preview: 'linear-gradient(135deg, hsl(210 100% 50%) 0%, hsl(200 100% 40%) 100%)'
  },
  {
    id: 'theme-sunset',
    name: 'Sunset Orange Theme',
    description: 'Warm orange and pink gradient theme',
    type: 'theme',
    price: 500,
    icon: Palette,
    preview: 'linear-gradient(135deg, hsl(25 100% 60%) 0%, hsl(340 100% 60%) 100%)'
  },
  {
    id: 'theme-forest',
    name: 'Forest Green Theme',
    description: 'Nature-inspired green gradient theme',
    type: 'theme',
    price: 500,
    icon: Palette,
    preview: 'linear-gradient(135deg, hsl(140 60% 40%) 0%, hsl(120 60% 30%) 100%)'
  },
  {
    id: 'icons-premium',
    name: 'Premium Icon Pack',
    description: '50+ additional icons for transactions',
    type: 'icons',
    price: 750,
    icon: Sparkles
  },
  {
    id: 'frame-gold',
    name: 'Gold Avatar Frame',
    description: 'Show off with a golden border',
    type: 'frame',
    price: 300,
    icon: Frame
  },
  {
    id: 'frame-diamond',
    name: 'Diamond Avatar Frame',
    description: 'Exclusive diamond-studded frame',
    type: 'frame',
    price: 1000,
    icon: Frame
  }
];

const Shop = () => {
  const { piggyPoints, spendPoints } = usePiggyPoints();
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const handlePurchase = async (item: typeof SHOP_ITEMS[0]) => {
    if (purchased.has(item.id)) {
      toast({
        title: 'Already Owned',
        description: 'You already own this item',
        variant: 'destructive'
      });
      return;
    }

    const success = await spendPoints(item.price, item.name);
    if (success) {
      setPurchased(new Set([...purchased, item.id]));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PiggyPoints Shop</h1>
          <p className="text-muted-foreground mt-1">Spend your points on themes and customizations</p>
        </div>

        {/* Points Balance */}
        <Card className="bg-gradient-to-br from-piggy-gold/10 to-piggy-gold/5 border-piggy-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Your PiggyPoints</div>
                <div className="text-3xl font-bold text-foreground mt-1">
                  {piggyPoints?.total_points || 0}
                </div>
              </div>
              <Sparkles className="h-12 w-12 text-piggy-gold" />
            </div>
          </CardContent>
        </Card>

        {/* Shop Items */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SHOP_ITEMS.map((item) => {
            const Icon = item.icon;
            const owned = purchased.has(item.id);
            const canAfford = (piggyPoints?.total_points || 0) >= item.price;

            return (
              <Card key={item.id} className={owned ? 'border-success' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    {owned && (
                      <Badge variant="default" className="bg-success">
                        <Check className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>

                  {item.preview && (
                    <div 
                      className="h-20 rounded-lg mb-4"
                      style={{ background: item.preview }}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-piggy-gold" />
                      <span className="font-bold text-lg">{item.price}</span>
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>

                    {owned ? (
                      <Button disabled>Owned</Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                      >
                        {canAfford ? 'Purchase' : 'Not Enough Points'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Shop;
