import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Shop = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PiggyPoints Shop</h1>
          <p className="text-muted-foreground mt-1">Spend your points on themes and customizations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customization Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Shop items coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Shop;
