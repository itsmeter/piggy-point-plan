import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import georgeAvatar from "@/assets/george-avatar.png";
import peppaAvatar from "@/assets/peppa-avatar.png";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OnboardingQuestionsProps {
  character: 'george' | 'peppa';
  onComplete: () => void;
}

export default function OnboardingQuestions({ character, onComplete }: OnboardingQuestionsProps) {
  const { completeOnboarding } = useAIAdvisor();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    rentOrMortgage: '',
    utilities: '',
    transportation: '',
    foodBudget: '',
    savingsGoal: '',
    spendingBehavior: 'moderate',
    financialPriorities: '',
    impulseBuying: 'sometimes',
    debtPayments: '',
    dependents: '0',
    otherExpenses: '',
  });

  const avatar = character === 'george' ? georgeAvatar : peppaAvatar;
  const characterName = character === 'george' ? 'George' : 'Peppa';
  const characterColor = character === 'george' ? 'blue' : 'red';

  const handleNext = () => {
    if (step === 1 && !formData.monthlyIncome) {
      toast({
        title: "Required Field",
        description: "Please enter your monthly income",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const income = parseFloat(formData.monthlyIncome);
    const plan = await completeOnboarding(income, formData);
    setLoading(false);
    
    if (plan) {
      onComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className={`border-2 border-${characterColor}-500/20`}>
        <CardHeader className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-${characterColor}-100 border-4 border-${characterColor}-500 mb-4">
            <img src={avatar} alt={characterName} className="w-full h-full object-cover" />
          </div>
          <CardTitle className="text-2xl">Let's Get Started!</CardTitle>
          <CardDescription>
            {characterName} needs some information to create your perfect financial plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">What's your monthly income? *</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="₱10,000"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentOrMortgage">Monthly Rent/Mortgage (if any)</Label>
                <Input
                  id="rentOrMortgage"
                  type="number"
                  placeholder="₱5,000"
                  value={formData.rentOrMortgage}
                  onChange={(e) => setFormData({ ...formData, rentOrMortgage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utilities">Monthly Utilities (electricity, water, internet)</Label>
                <Input
                  id="utilities"
                  type="number"
                  placeholder="₱2,000"
                  value={formData.utilities}
                  onChange={(e) => setFormData({ ...formData, utilities: e.target.value })}
                />
              </div>
              <Button onClick={handleNext} className="w-full">Next</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transportation">Monthly Transportation Costs</Label>
                <Input
                  id="transportation"
                  type="number"
                  placeholder="₱1,500"
                  value={formData.transportation}
                  onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foodBudget">Monthly Food Budget</Label>
                <Input
                  id="foodBudget"
                  type="number"
                  placeholder="₱3,000"
                  value={formData.foodBudget}
                  onChange={(e) => setFormData({ ...formData, foodBudget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debtPayments">Monthly Debt Payments (if any)</Label>
                <Input
                  id="debtPayments"
                  type="number"
                  placeholder="₱0"
                  value={formData.debtPayments}
                  onChange={(e) => setFormData({ ...formData, debtPayments: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="w-full">Back</Button>
                <Button onClick={handleNext} className="w-full">Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>How would you describe your spending behavior?</Label>
                <RadioGroup
                  value={formData.spendingBehavior}
                  onValueChange={(value) => setFormData({ ...formData, spendingBehavior: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="conservative" id="conservative" />
                    <Label htmlFor="conservative">Conservative - I save most of my income</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate - I balance saving and spending</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="liberal" id="liberal" />
                    <Label htmlFor="liberal">Liberal - I enjoy spending on things I like</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Do you tend to make impulse purchases?</Label>
                <RadioGroup
                  value={formData.impulseBuying}
                  onValueChange={(value) => setFormData({ ...formData, impulseBuying: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rarely" id="rarely" />
                    <Label htmlFor="rarely">Rarely</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sometimes" id="sometimes" />
                    <Label htmlFor="sometimes">Sometimes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="often" id="often" />
                    <Label htmlFor="often">Often</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="w-full">Back</Button>
                <Button onClick={handleNext} className="w-full">Next</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="savingsGoal">What are your savings goals for this month?</Label>
                <Textarea
                  id="savingsGoal"
                  placeholder="e.g., Save for emergency fund, save for a vacation, etc."
                  value={formData.savingsGoal}
                  onChange={(e) => setFormData({ ...formData, savingsGoal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="financialPriorities">What are your top financial priorities?</Label>
                <Textarea
                  id="financialPriorities"
                  placeholder="e.g., Pay off debt, build emergency fund, invest, etc."
                  value={formData.financialPriorities}
                  onChange={(e) => setFormData({ ...formData, financialPriorities: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherExpenses">Any other regular expenses?</Label>
                <Textarea
                  id="otherExpenses"
                  placeholder="e.g., Insurance, subscriptions, childcare, etc."
                  value={formData.otherExpenses}
                  onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setStep(3)} variant="outline" className="w-full">Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Your Plan...
                    </>
                  ) : (
                    'Create My Financial Plan'
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === step ? `bg-${characterColor}-500` : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}