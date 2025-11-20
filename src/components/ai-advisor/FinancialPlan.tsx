import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import georgeAvatar from "@/assets/george-avatar.png";
import peppaAvatar from "@/assets/peppa-avatar.png";

interface FinancialPlanProps {
  plan: string;
  character: 'george' | 'peppa';
  monthlyIncome: number;
}

export default function FinancialPlan({ plan, character, monthlyIncome }: FinancialPlanProps) {
  const avatar = character === 'george' ? georgeAvatar : peppaAvatar;
  const characterName = character === 'george' ? 'George' : 'Peppa';
  const characterColor = character === 'george' ? 'blue' : 'red';

  return (
    <Card className={`border-2 border-${characterColor}-500/20`}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full overflow-hidden bg-${characterColor}-100 border-2 border-${characterColor}-500`}>
            <img src={avatar} alt={characterName} className="w-full h-full object-cover" />
          </div>
          <div>
            <CardTitle className="text-xl">Your Monthly Financial Plan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on ₱{monthlyIncome.toLocaleString()} monthly income
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
            {plan}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}