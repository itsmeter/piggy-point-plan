import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Achievements = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted-foreground mt-1">Track your budgeting milestones</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Badge Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Achievement badges coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Achievements;
