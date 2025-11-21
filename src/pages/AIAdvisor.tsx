import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import georgeAvatar from "@/assets/george-avatar.png";
import peppaAvatar from "@/assets/peppa-avatar.png";
import { Loader2 } from "lucide-react";
import CharacterSelection from "@/components/ai-advisor/CharacterSelection";
import OnboardingQuestions from "@/components/ai-advisor/OnboardingQuestions";
import FinancialPlan from "@/components/ai-advisor/FinancialPlan";
import ChatInterface from "@/components/ai-advisor/ChatInterface";

export default function AIAdvisor() {
  const { settings, loading } = useAIAdvisor();
  const [currentStep, setCurrentStep] = useState<'character' | 'onboarding' | 'plan' | 'chat'>('character');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Determine current step based on settings
  const step = settings?.selected_character 
    ? settings.onboarding_completed 
      ? 'chat' 
      : 'onboarding'
    : 'character';

  console.log('AI Advisor - Current step:', step, 'Settings:', settings);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Financial Advisor</h1>
          <p className="text-muted-foreground">
            Get personalized financial advice from {settings?.selected_character === 'george' ? 'George' : 'Peppa'}
          </p>
        </div>

        {step === 'character' && (
          <CharacterSelection />
        )}

        {step === 'onboarding' && settings && (
          <OnboardingQuestions
            character={settings.selected_character}
            onComplete={() => setCurrentStep('chat')}
          />
        )}

        {step === 'chat' && settings && (
          <div className="space-y-6">
            {settings.financial_plan && (
              <FinancialPlan
                plan={settings.financial_plan}
                character={settings.selected_character}
                monthlyIncome={settings.monthly_income || 0}
              />
            )}
            <ChatInterface character={settings.selected_character} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}