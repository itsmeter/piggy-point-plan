import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PiggyBank, TrendingUp, Target, Award, Sparkles, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">PiggySaving</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button onClick={() => navigate("/signup")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Budget tracking that actually motivates you
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Replace Excel with
            <span className="block text-primary mt-2">Smart Budgeting</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track expenses, set budgets, and earn rewards. PiggySaving makes personal finance simple, 
            clear, and surprisingly fun.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg h-14 px-8" onClick={() => navigate("/signup")}>
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Track Everything"
            description="Monitor income, expenses, bills, and projects in one place"
          />
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Set Budgets"
            description="Create monthly and project budgets with smart alerts"
          />
          <FeatureCard
            icon={<Award className="h-8 w-8" />}
            title="Earn PiggyPoints"
            description="Complete goals and get rewarded with points"
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Customize Your Way"
            description="Unlock themes, icons, and backgrounds with points"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        <p>© 2024 PiggySaving. Made with ❤️ for better budgeting.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow duration-300">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
