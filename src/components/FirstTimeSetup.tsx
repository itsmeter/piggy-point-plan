import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";

interface FirstTimeSetupProps {
  onComplete: () => void;
}

const FirstTimeSetup = ({ onComplete }: FirstTimeSetupProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    income: "",
    foodBudget: "",
    transportBudget: "",
    entertainmentBudget: "",
    shoppingBudget: "",
    hasBillsAndRent: false,
    internetBill: "",
    electricityBill: "",
    waterBill: "",
    rent: "",
    billsDueDate: "",
    rentDueDate: "",
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.income || !formData.foodBudget || !formData.transportBudget || 
          !formData.entertainmentBudget || !formData.shoppingBudget) {
        toast({
          title: "Missing Information",
          description: "Please fill in all budget categories",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (step === 2 && formData.hasBillsAndRent) {
      if (!formData.internetBill || !formData.electricityBill || !formData.waterBill || 
          !formData.rent || !formData.billsDueDate || !formData.rentDueDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all bill and rent details",
          variant: "destructive",
        });
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save data to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Save to user_settings
        await supabase.from('user_settings').upsert({
          user_id: user.id,
          monthly_income: parseFloat(parseFormattedNumber(formData.income)),
          food_budget: parseFloat(parseFormattedNumber(formData.foodBudget)),
          transportation_budget: parseFloat(parseFormattedNumber(formData.transportBudget)),
          entertainment_budget: parseFloat(parseFormattedNumber(formData.entertainmentBudget)),
          shopping_budget: parseFloat(parseFormattedNumber(formData.shoppingBudget)),
          has_bills: formData.hasBillsAndRent,
          internet_bill: formData.hasBillsAndRent ? parseFloat(parseFormattedNumber(formData.internetBill)) : 0,
          electricity_bill: formData.hasBillsAndRent ? parseFloat(parseFormattedNumber(formData.electricityBill)) : 0,
          water_bill: formData.hasBillsAndRent ? parseFloat(parseFormattedNumber(formData.waterBill)) : 0,
          rent: formData.hasBillsAndRent ? parseFloat(parseFormattedNumber(formData.rent)) : 0,
          bill_due_date: formData.hasBillsAndRent ? parseInt(formData.billsDueDate) : null,
          rent_due_date: formData.hasBillsAndRent ? parseInt(formData.rentDueDate) : null,
          first_setup_completed: true
        });

        // Create initial budgets
        const budgets = [
          { name: 'Food', amount: parseFloat(parseFormattedNumber(formData.foodBudget)) },
          { name: 'Transportation', amount: parseFloat(parseFormattedNumber(formData.transportBudget)) },
          { name: 'Entertainment', amount: parseFloat(parseFormattedNumber(formData.entertainmentBudget)) },
          { name: 'Shopping', amount: parseFloat(parseFormattedNumber(formData.shoppingBudget)) },
        ];

        if (formData.hasBillsAndRent) {
          budgets.push(
            { name: 'Bills', amount: parseFloat(parseFormattedNumber(formData.internetBill)) + parseFloat(parseFormattedNumber(formData.electricityBill)) + parseFloat(parseFormattedNumber(formData.waterBill)) },
            { name: 'Rent', amount: parseFloat(parseFormattedNumber(formData.rent)) }
          );
        }

        for (const budget of budgets) {
          await supabase.from('budgets').insert({
            user_id: user.id,
            name: budget.name,
            amount: budget.amount,
            type: 'monthly',
            start_date: new Date().toISOString().split('T')[0],
            status: 'active'
          });
        }

        // Award PiggyPoints
        await supabase.from('piggy_points').update({
          total_points: 250
        }).eq('user_id', user.id);

        toast({
          title: "🎉 Setup Complete!",
          description: "You've earned 250 PiggyPoints!",
        });
        onComplete();
      } catch (error) {
        console.error('Error saving setup:', error);
        toast({
          title: "Error",
          description: "Failed to save setup. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to PiggySaving!</DialogTitle>
          <DialogDescription>
            Let's set up your budget to get started (Step {step} of 3)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                  <Input
                    id="income"
                    type="text"
                    placeholder="0"
                    value={formData.income}
                    onChange={(e) => {
                      const value = parseFormattedNumber(e.target.value);
                      if (value === '' || !isNaN(Number(value))) {
                        setFormData({ ...formData, income: formatNumberWithCommas(value) });
                      }
                    }}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Monthly Budget Categories</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="food">Food</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                    <Input
                      id="food"
                      type="text"
                      placeholder="0"
                      value={formData.foodBudget}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        if (value === '' || !isNaN(Number(value))) {
                          setFormData({ ...formData, foodBudget: formatNumberWithCommas(value) });
                        }
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transport">Transportation</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                    <Input
                      id="transport"
                      type="text"
                      placeholder="0"
                      value={formData.transportBudget}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        if (value === '' || !isNaN(Number(value))) {
                          setFormData({ ...formData, transportBudget: formatNumberWithCommas(value) });
                        }
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entertainment">Entertainment</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                    <Input
                      id="entertainment"
                      type="text"
                      placeholder="0"
                      value={formData.entertainmentBudget}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        if (value === '' || !isNaN(Number(value))) {
                          setFormData({ ...formData, entertainmentBudget: formatNumberWithCommas(value) });
                        }
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopping">Shopping</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                    <Input
                      id="shopping"
                      type="text"
                      placeholder="0"
                      value={formData.shoppingBudget}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        if (value === '' || !isNaN(Number(value))) {
                          setFormData({ ...formData, shoppingBudget: formatNumberWithCommas(value) });
                        }
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <Label htmlFor="hasBills" className="font-medium">Do you pay bills and rent?</Label>
                  <p className="text-sm text-muted-foreground mt-1">We'll help you track them</p>
                </div>
                <Switch
                  id="hasBills"
                  checked={formData.hasBillsAndRent}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, hasBillsAndRent: checked })
                  }
                />
              </div>

              {formData.hasBillsAndRent && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Bill Amounts</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="internet">Internet Bill</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                      <Input
                        id="internet"
                        type="text"
                        placeholder="0"
                        value={formData.internetBill}
                        onChange={(e) => {
                          const value = parseFormattedNumber(e.target.value);
                          if (value === '' || !isNaN(Number(value))) {
                            setFormData({ ...formData, internetBill: formatNumberWithCommas(value) });
                          }
                        }}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="electricity">Electricity Bill</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                      <Input
                        id="electricity"
                        type="text"
                        placeholder="0"
                        value={formData.electricityBill}
                        onChange={(e) => {
                          const value = parseFormattedNumber(e.target.value);
                          if (value === '' || !isNaN(Number(value))) {
                            setFormData({ ...formData, electricityBill: formatNumberWithCommas(value) });
                          }
                        }}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="water">Water Bill</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                      <Input
                        id="water"
                        type="text"
                        placeholder="0"
                        value={formData.waterBill}
                        onChange={(e) => {
                          const value = parseFormattedNumber(e.target.value);
                          if (value === '' || !isNaN(Number(value))) {
                            setFormData({ ...formData, waterBill: formatNumberWithCommas(value) });
                          }
                        }}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                      <Input
                        id="rent"
                        type="text"
                        placeholder="0"
                        value={formData.rent}
                        onChange={(e) => {
                          const value = parseFormattedNumber(e.target.value);
                          if (value === '' || !isNaN(Number(value))) {
                            setFormData({ ...formData, rent: formatNumberWithCommas(value) });
                          }
                        }}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billsDate">Bills Due Date</Label>
                      <Input
                        id="billsDate"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Day (1-31)"
                        value={formData.billsDueDate}
                        onChange={(e) => setFormData({ ...formData, billsDueDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rentDate">Rent Due Date</Label>
                      <Input
                        id="rentDate"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Day (1-31)"
                        value={formData.rentDueDate}
                        onChange={(e) => setFormData({ ...formData, rentDueDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-8">
              <div className="flex justify-center">
                <div className="bg-piggy-gold/10 p-6 rounded-full animate-pulse-glow">
                  <Trophy className="h-16 w-16 text-piggy-gold" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">You're All Set!</h3>
              <p className="text-muted-foreground">
                Congratulations! You've earned your first <span className="font-bold text-piggy-gold">250 PiggyPoints</span>
              </p>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm">
                  Your budget has been set up. Start tracking your expenses to earn more points and unlock amazing rewards!
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {step > 1 && step < 3 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {step === 3 ? "Start Budgeting" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimeSetup;
