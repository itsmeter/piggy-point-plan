import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, TrendingUp, Calendar, Target, Check, Gift, Loader2 } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useAchievementProgress } from "@/hooks/useAchievementProgress";
import { useDailyReward } from "@/hooks/useDailyReward";
import { usePiggyPoints } from "@/hooks/usePiggyPoints";
import { format } from "date-fns";
import coinIcon from "@/assets/coin.png";

const ACHIEVEMENT_ICONS: Record<string, any> = {
  'transactions': TrendingUp,
  'login_streak': Calendar,
  'budget_streak': Target,
  'projects_completed': Trophy,
  'setup_complete': Star
};

const Achievements = () => {
  const { achievements, userAchievements, loading, claimAchievement } = useAchievements();
  const { getProgressForType, loading: progressLoading } = useAchievementProgress();
  const { canClaim, claimDailyReward, loading: dailyLoading } = useDailyReward();
  const { piggyPoints } = usePiggyPoints();

  const isEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const canClaimAchievement = (achievement: any) => {
    const progress = getProgressForType(achievement.requirement_type);
    const requirement = achievement.requirement_value || 0;
    return progress >= requirement;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted-foreground mt-1">Track your budgeting milestones and earn PiggyPoints</p>
        </div>

        {/* Daily Reward Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Daily Reward</h3>
                  <p className="text-sm text-muted-foreground">
                    {canClaim 
                      ? "Claim your daily bonus! Streak bonuses available." 
                      : "Come back tomorrow for your next reward!"
                    }
                  </p>
                  {piggyPoints?.login_streak && piggyPoints.login_streak > 0 && (
                    <p className="text-xs text-primary mt-1">
                      🔥 {piggyPoints.login_streak} day streak!
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <img src={coinIcon} alt="Points" className="h-5 w-5" />
                    <span className="font-bold">50+</span>
                  </div>
                  <span className="text-xs text-muted-foreground">points</span>
                </div>
                <Button 
                  onClick={claimDailyReward} 
                  disabled={!canClaim || dailyLoading}
                  size="lg"
                >
                  {dailyLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : canClaim ? (
                    'Claim'
                  ) : (
                    'Claimed ✓'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-piggy-gold/10 to-piggy-gold/5 border-piggy-gold/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Trophy className="h-8 w-8 text-piggy-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {userAchievements.length}
                </div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {achievements.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {achievements.length > 0 ? Math.round((userAchievements.length / achievements.length) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading || progressLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Loading achievements...</p>
            </CardContent>
          </Card>
        ) : achievements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No achievements available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => {
              const earned = isEarned(achievement.id);
              const Icon = ACHIEVEMENT_ICONS[achievement.requirement_type] || Trophy;
              const earnedData = userAchievements.find(ua => ua.achievement_id === achievement.id);
              const currentProgress = getProgressForType(achievement.requirement_type);
              const requirement = achievement.requirement_value || 0;
              const progressPercent = Math.min((currentProgress / requirement) * 100, 100);
              const canClaim = canClaimAchievement(achievement) && !earned;

              return (
                <Card key={achievement.id} className={earned ? 'border-success bg-success/5' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${earned ? 'bg-success/20' : canClaim ? 'bg-primary/20' : 'bg-muted'}`}>
                          <Icon className={`h-6 w-6 ${earned ? 'text-success' : canClaim ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          {earned && earnedData && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Earned {format(new Date(earnedData.earned_at), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      {earned && (
                        <Badge variant="default" className="bg-success">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {achievement.description}
                    </p>

                    {/* Progress Bar */}
                    {!earned && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{currentProgress} / {requirement}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-piggy-gold" />
                        <span className="font-bold">{achievement.points_reward}</span>
                        <span className="text-sm text-muted-foreground">points</span>
                      </div>

                      {earned ? (
                        <Badge variant="outline">Claimed</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => claimAchievement(achievement.id)}
                          disabled={!canClaim}
                        >
                          {canClaim ? 'Claim Reward' : 'In Progress'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Achievements;
