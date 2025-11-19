import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, Trash2, DollarSign } from "lucide-react";
import { useState } from "react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { useProjects } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Projects = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [viewHistoryProject, setViewHistoryProject] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const { projects, loading, createProject, deleteProject, addContribution, getProjectHistory } = useProjects();

  const handleContribution = async () => {
    if (!selectedProject || !contributionAmount) return;

    const success = await addContribution(
      selectedProject,
      parseFloat(contributionAmount)
    );

    if (success) {
      setSelectedProject(null);
      setContributionAmount('');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">Track project-specific budgets and goals</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading projects...</p>
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No projects yet — Create your first project</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const budget = Number(project.budget || 0);
              const saved = Number(project.total_expense);
              const percentage = budget > 0 ? (saved / budget) * 100 : 0;
              const remaining = budget - saved;
              const daysRemaining = project.end_date 
                ? differenceInDays(new Date(project.end_date), new Date())
                : null;

              return (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        )}
                        <Badge variant={project.status === 'active' ? 'default' : 'outline'} className="mt-2">
                          {project.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budget > 0 && (
                        <>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold text-foreground">
                                ₱{saved.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <Progress value={Math.min(percentage, 100)} />
                            <div className="flex justify-between text-sm mt-2">
                              <span className="text-muted-foreground">
                                {percentage.toFixed(1)}% complete
                              </span>
                              <span className="font-semibold text-foreground">
                                ₱{budget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-muted-foreground">Remaining</span>
                              <span className="font-bold text-foreground">
                                ₱{remaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            {daysRemaining !== null && (
                              <div className="text-xs text-muted-foreground mb-3">
                                {daysRemaining > 0 
                                  ? `${daysRemaining} days remaining`
                                  : daysRemaining === 0
                                  ? 'Due today'
                                  : `${Math.abs(daysRemaining)} days overdue`
                                }
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedProject(project.id)}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Add Funds
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setViewHistoryProject(project.id)}
                              >
                                View History
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Started: {format(new Date(project.start_date), 'MMM dd, yyyy')}
                        {project.end_date && ` • Target: ${format(new Date(project.end_date), 'MMM dd, yyyy')}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddProjectModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createProject}
      />

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount (₱)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProject(null)}>
              Cancel
            </Button>
            <Button onClick={handleContribution}>
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewHistoryProject} onOpenChange={() => setViewHistoryProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contribution History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {viewHistoryProject && getProjectHistory(viewHistoryProject).map((contribution) => (
              <div key={contribution.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-semibold">₱{Number(contribution.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(contribution.contribution_date), 'MMM dd, yyyy - hh:mm a')}
                  </div>
                </div>
              </div>
            ))}
            {viewHistoryProject && getProjectHistory(viewHistoryProject).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No contributions yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Projects;
