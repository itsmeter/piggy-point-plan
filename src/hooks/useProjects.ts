import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  budget: number | null;
  total_income: number;
  total_expense: number;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProjectContribution {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  created_at: string;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectContributions, setProjectContributions] = useState<ProjectContribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [projectsData, contributionsData] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('project_contributions')
          .select('*')
          .eq('user_id', user.id)
          .order('contribution_date', { ascending: false })
      ]);

      if (projectsData.error) throw projectsData.error;
      if (contributionsData.error) throw contributionsData.error;

      setProjects((projectsData.data as Project[]) || []);
      setProjectContributions((contributionsData.data as ProjectContribution[]) || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'total_income' | 'total_expense'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id,
          budget: project.budget ? Number(project.budget) : null,
          total_income: 0,
          total_expense: 0
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project created successfully'
      });

      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project updated'
      });

      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project deleted'
      });

      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
      return false;
    }
  };

  const addContribution = async (projectId: string, amount: number) => {
    if (!user) return;

    try {
      // Add to contribution history
      const { error: contribError } = await supabase
        .from('project_contributions')
        .insert({
          project_id: projectId,
          user_id: user.id,
          amount: Number(amount)
        });

      if (contribError) throw contribError;

      // Add transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: Number(amount),
          type: 'project-contribution',
          category: 'Project',
          details: 'Project contribution',
          transaction_date: new Date().toISOString(),
          project_id: projectId
        });

      if (txError) throw txError;

      // Update project total_expense
      const project = projects.find(p => p.id === projectId);
      if (project) {
        await updateProject(projectId, {
          total_expense: Number(project.total_expense) + Number(amount)
        });
      }

      toast({
        title: 'Success',
        description: 'Contribution added to project'
      });

      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Error adding contribution:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add contribution',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getProjectHistory = (projectId: string) => {
    return projectContributions.filter(c => c.project_id === projectId);
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    addContribution,
    getProjectHistory,
    refreshProjects: fetchProjects
  };
}
