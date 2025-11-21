import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles, Frame, Check, Loader2 } from "lucide-react";
import { usePiggyPoints } from "@/hooks/usePiggyPoints";
import { useShopPurchases } from "@/hooks/useShopPurchases";
import coinIcon from "@/assets/coin.png";

const getItemIcon = (type: string) => {
  switch (type) {
    case 'theme': return Palette;
    case 'icons': return Sparkles;
    case 'frame': return Frame;
    default: return Sparkles;
  }
};

const Shop = () => {
  const { piggyPoints } = usePiggyPoints();
  const { shopItems, loading, purchaseItem, isPurchased } = useShopPurchases();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
              <img src={coinIcon} alt="PiggyPoints" className="h-12 w-12" />
            </div>
          </CardContent>
        </Card>

        {/* Shop Items */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shopItems.map((item) => {
            const Icon = getItemIcon(item.type);
            const owned = isPurchased(item.id);
            const canAfford = (piggyPoints?.total_points || 0) >= item.price;
            const gradient = item.config?.gradient;

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

                  {gradient && (
                    <div 
                      className="h-20 rounded-lg mb-4 border border-border"
                      style={{ background: gradient }}
                    />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <img src={coinIcon} alt="PiggyPoints" className="h-5 w-5" />
                      <span className="font-bold text-lg">{item.price}</span>
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>

                    {owned ? (
                      <Button disabled className="w-full">
                        <Check className="h-4 w-4 mr-2" />
                        Owned
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
      </div>
    </DashboardLayout>
  );
};

export default Shop;
