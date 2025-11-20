import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import georgeAvatar from "@/assets/george-avatar.png";
import peppaAvatar from "@/assets/peppa-avatar.png";
import { useState } from "react";

export default function CharacterSelection() {
  const { selectCharacter } = useAIAdvisor();
  const [selecting, setSelecting] = useState(false);

  const handleSelect = async (character: 'george' | 'peppa') => {
    setSelecting(true);
    await selectCharacter(character);
    setSelecting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-piggy-gold/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Financial Advisor</CardTitle>
          <CardDescription>
            Select a character to help you manage your finances for the month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-500/30 hover:border-blue-500 transition-colors cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-blue-100 border-4 border-blue-500">
                  <img 
                    src={georgeAvatar} 
                    alt="George" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-600">George</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enthusiastic and energetic financial advisor who loves to help you achieve your goals with positivity!
                  </p>
                </div>
                <Button 
                  onClick={() => handleSelect('george')}
                  disabled={selecting}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Choose George
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500/30 hover:border-red-500 transition-colors cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-red-100 border-4 border-red-500">
                  <img 
                    src={peppaAvatar} 
                    alt="Peppa" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600">Peppa</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Caring and wise financial advisor who makes finances fun and easy to understand!
                  </p>
                </div>
                <Button 
                  onClick={() => handleSelect('peppa')}
                  disabled={selecting}
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  Choose Peppa
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}