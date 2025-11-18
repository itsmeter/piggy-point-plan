import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";

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

  const handleNext = () => {
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
      // Save data and complete setup
      toast({
        title: "🎉 Setup Complete!",
        description: "You've earned 250 PiggyPoints!",
      });
      onComplete();
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
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your monthly income"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Monthly Budget Categories</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="food">Food</Label>
                  <Input
                    id="food"
                    type="number"
                    placeholder="Food budget"
                    value={formData.foodBudget}
                    onChange={(e) => setFormData({ ...formData, foodBudget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transport">Transportation</Label>
                  <Input
                    id="transport"
                    type="number"
                    placeholder="Transportation budget"
                    value={formData.transportBudget}
                    onChange={(e) => setFormData({ ...formData, transportBudget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entertainment">Entertainment</Label>
                  <Input
                    id="entertainment"
                    type="number"
                    placeholder="Entertainment budget"
                    value={formData.entertainmentBudget}
                    onChange={(e) => setFormData({ ...formData, entertainmentBudget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopping">Shopping</Label>
                  <Input
                    id="shopping"
                    type="number"
                    placeholder="Shopping budget"
                    value={formData.shoppingBudget}
                    onChange={(e) => setFormData({ ...formData, shoppingBudget: e.target.value })}
                  />
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
                    <Input
                      id="internet"
                      type="number"
                      placeholder="Amount"
                      value={formData.internetBill}
                      onChange={(e) => setFormData({ ...formData, internetBill: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="electricity">Electricity Bill</Label>
                    <Input
                      id="electricity"
                      type="number"
                      placeholder="Amount"
                      value={formData.electricityBill}
                      onChange={(e) => setFormData({ ...formData, electricityBill: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="water">Water Bill</Label>
                    <Input
                      id="water"
                      type="number"
                      placeholder="Amount"
                      value={formData.waterBill}
                      onChange={(e) => setFormData({ ...formData, waterBill: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent</Label>
                    <Input
                      id="rent"
                      type="number"
                      placeholder="Amount"
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    />
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
