import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, Building2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { organizationService } from '../lib/organizationService';

interface Project {
  id: string;
  name: string;
  code: string;
}

interface CreateTeamProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onTeamCreated?: () => void;
}

const CreateTeam: React.FC<CreateTeamProps> = ({ isOpen, onClose, projects, onTeamCreated }) => {
  const { user } = useAuth();
  const [teamForm, setTeamForm] = useState({
    teamCode: '',
    teamName: '',
    teamDescription: '',
    projectId: '',
    leadTeamName: '',
    leadTeamEmail: '',
    leadTeamPhone: '',
    projectManagerName: '',
    projectManagerEmail: '',
    projectManagerPhone: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate required fields
      if (!teamForm.teamCode || !teamForm.teamName || !teamForm.projectId) {
        setError('Please fill in all required fields');
        return;
      }

      // Check if team code already exists
      const teamCodeExists = await organizationService.checkTeamCodeExists(
        teamForm.teamCode,
        teamForm.projectId
      );

      if (teamCodeExists) {
        setError(`Team code "${teamForm.teamCode}" already exists in this project`);
        return;
      }

      // Create team
      const newTeam = await organizationService.createTeam({
        name: teamForm.teamName,
        description: teamForm.teamDescription || undefined,
        project_id: teamForm.projectId,
        created_by: user.id,
        team_lead_name: teamForm.leadTeamName || undefined,
        team_lead_email: teamForm.leadTeamEmail || undefined,
        team_lead_phone: teamForm.leadTeamPhone || undefined,
        project_manager_name: teamForm.projectManagerName || undefined,
        project_manager_email: teamForm.projectManagerEmail || undefined,
        project_manager_phone: teamForm.projectManagerPhone || undefined,
        team_code: teamForm.teamCode || undefined,
      });

      setSuccess(`Team "${newTeam.name}" created successfully!`);
      
      // Notify parent component that team was created
      if (onTeamCreated) {
        onTeamCreated();
      }
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        setTeamForm({
          teamCode: '',
          teamName: '',
          teamDescription: '',
          projectId: '',
          leadTeamName: '',
          leadTeamEmail: '',
          leadTeamPhone: '',
          projectManagerName: '',
          projectManagerEmail: '',
          projectManagerPhone: ''
        });
        setProjectSearch('');
        setError(null);
        setSuccess(null);
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating team:', error);
      setError(error?.message || 'Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTeamForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter projects based on search input
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.code.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    const selectedProject = projects.find(p => p.id === projectId);
    if (selectedProject) {
      setProjectSearch(`${selectedProject.name} (${selectedProject.code})`);
      handleInputChange('projectId', projectId);
      setShowProjectDropdown(false);
    }
  };

  // Get selected project for display
  const getSelectedProject = () => {
    return projects.find(p => p.id === teamForm.projectId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Team
          </DialogTitle>
          <DialogDescription>
            Set up a new team with team lead and project manager details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTeam} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800 text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Team Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Team Information
              </CardTitle>
              <CardDescription>
                Basic details about the team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamCode">Team Code</Label>
                  <Input
                    id="teamCode"
                    type="text"
                    placeholder="e.g., DEV001, QA002"
                    value={teamForm.teamCode}
                    onChange={(e) => handleInputChange('teamCode', e.target.value.toUpperCase())}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    type="text"
                    placeholder="e.g., Development Team, QA Team"
                    value={teamForm.teamName}
                    onChange={(e) => handleInputChange('teamName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Input
                      id="project"
                      type="text"
                      placeholder="Search projects by name or code..."
                      value={projectSearch}
                      onChange={(e) => {
                        setProjectSearch(e.target.value);
                        setShowProjectDropdown(true);
                      }}
                      onFocus={() => setShowProjectDropdown(true)}
                      className="pr-10"
                      required
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {showProjectDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                          <div
                            key={project.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleProjectSelect(project.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{project.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {project.code}
                                </Badge>
                              </div>
                              {teamForm.projectId === project.id && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No projects found matching "{projectSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {teamForm.projectId && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-gray-600">Selected:</span>
                    <Badge variant="secondary" className="text-xs">
                      {getSelectedProject()?.name} ({getSelectedProject()?.code})
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamDescription">Team Description</Label>
                <Textarea
                  id="teamDescription"
                  placeholder="Describe the team's purpose, responsibilities, and objectives..."
                  value={teamForm.teamDescription}
                  onChange={(e) => handleInputChange('teamDescription', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Team Lead Information
              </CardTitle>
              <CardDescription>
                Details about the team lead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leadTeamName">Team Lead Name</Label>
                <Input
                  id="leadTeamName"
                  type="text"
                  placeholder="Enter team lead full name"
                  value={teamForm.leadTeamName}
                  onChange={(e) => handleInputChange('leadTeamName', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadTeamEmail">Team Lead Email</Label>
                  <Input
                    id="leadTeamEmail"
                    type="email"
                    placeholder="teamlead@company.com"
                    value={teamForm.leadTeamEmail}
                    onChange={(e) => handleInputChange('leadTeamEmail', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leadTeamPhone">Team Lead Phone</Label>
                  <Input
                    id="leadTeamPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={teamForm.leadTeamPhone}
                    onChange={(e) => handleInputChange('leadTeamPhone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Manager Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Project Manager Information
              </CardTitle>
              <CardDescription>
                Details about the project manager
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectManagerName">Project Manager Name</Label>
                <Input
                  id="projectManagerName"
                  type="text"
                  placeholder="Enter project manager full name"
                  value={teamForm.projectManagerName}
                  onChange={(e) => handleInputChange('projectManagerName', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectManagerEmail">Project Manager Email</Label>
                  <Input
                    id="projectManagerEmail"
                    type="email"
                    placeholder="pm@company.com"
                    value={teamForm.projectManagerEmail}
                    onChange={(e) => handleInputChange('projectManagerEmail', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectManagerPhone">Project Manager Phone</Label>
                  <Input
                    id="projectManagerPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={teamForm.projectManagerPhone}
                    onChange={(e) => handleInputChange('projectManagerPhone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Team...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create Team
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeam;