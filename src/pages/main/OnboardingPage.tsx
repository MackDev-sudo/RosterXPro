import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { organizationService } from '../../lib/organizationService';
import { authService } from '../../lib/auth';
import { clearAllAuthStorage } from '../../lib/storageUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, Plus, UserPlus, LogOut } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  
  const [createOrgForm, setCreateOrgForm] = useState({
    organizationName: '',
    projectName: '',
    organizationCode: '',
    projectCode: '',
    description: ''
  });

  const [joinOrgForm, setJoinOrgForm] = useState({
    organizationCode: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate form data
      if (!createOrgForm.organizationName.trim()) {
        throw new Error('Organization name is required');
      }
      if (!createOrgForm.projectName.trim()) {
        throw new Error('Project name is required');
      }
      if (!createOrgForm.organizationCode.trim()) {
        throw new Error('Organization code is required');
      }
      if (!createOrgForm.projectCode.trim()) {
        throw new Error('Project code is required');
      }

      // Check if organization code already exists
      const orgCodeExists = await organizationService.checkOrganizationCodeExists(createOrgForm.organizationCode);
      if (orgCodeExists) {
        throw new Error('Organization code already exists. Please choose a different code.');
      }

      // Check if project code already exists globally
      const projectCodeExists = await organizationService.checkProjectCodeExists(createOrgForm.projectCode);
      if (projectCodeExists) {
        throw new Error('Project code already exists. Please choose a different code.');
      }

      // Step 1: Create organization
      const organization = await organizationService.createOrganization({
        name: createOrgForm.organizationName,
        code: createOrgForm.organizationCode,
        description: createOrgForm.description || null,
        created_by: user.id
      });

      // Step 2: Create project within the organization
      await organizationService.createProject({
        name: createOrgForm.projectName,
        code: createOrgForm.projectCode,
        organization_id: organization.id,
        description: createOrgForm.description || null,
        created_by: user.id
      });

      // Step 3: Associate user with organization
      await organizationService.updateUserOrganization(user.id, organization.id);

      // Success! Show success message
      setSuccess(`Organization "${organization.name}" created successfully!`);
      
      // Clear form
      setCreateOrgForm({
        organizationName: '',
        projectName: '',
        organizationCode: '',
        projectCode: '',
        description: ''
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error instanceof Error ? error.message : 'Failed to create organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate form data
      if (!joinOrgForm.organizationCode.trim()) {
        throw new Error('Organization code is required');
      }

      // Check if organization code exists
      const orgExists = await organizationService.checkOrganizationCodeExists(joinOrgForm.organizationCode);
      if (!orgExists) {
        throw new Error('Organization code not found. Please check the code and try again.');
      }

      // Get organization data to join
      const organizationData = await organizationService.getOrganizationByCode(joinOrgForm.organizationCode);
      if (!organizationData) {
        throw new Error('Organization not found');
      }

      // Add user to organization with member role
      await organizationService.joinOrganization(user.id, organizationData.id);

      // Success! Show success message
      setSuccess(`Successfully joined "${organizationData.name}"!`);
      
      // Clear form
      setJoinOrgForm({
        organizationCode: ''
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error joining organization:', error);
      setError(error instanceof Error ? error.message : 'Failed to join organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    try {
      console.log('Clearing session and all auth storage...');
      
      // Clear Supabase session
      await authService.logout();
      
      // Clear all auth-related storage
      clearAllAuthStorage();
      
      // Force redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Error clearing session:', error);
      
      // Even if logout fails, clear storage and redirect
      clearAllAuthStorage();
      window.location.href = '/';
    }
  };

  // If user is not available, this shouldn't happen since App.tsx handles auth
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Enterprise Roster
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by creating a new organization or joining an existing one
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>First time here?</strong> You need to be associated with an organization to access the roster management features.
            </p>
          </div>
          
          {/* Debug Section */}
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
              <strong>Debug Info:</strong> Current user: {user?.email || 'None'} (ID: {user?.id || 'None'})
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
              Email confirmed: {user?.email_confirmed_at ? 'Yes' : 'No'}
            </p>
            <Button 
              onClick={handleClearSession}
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Clear Session & Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Organization
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Join Organization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Create New Organization
                </CardTitle>
                <CardDescription>
                  Set up your organization and first project to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder="e.g., TCS, Infosys, HPE"
                        value={createOrgForm.organizationName}
                        onChange={(e) => setCreateOrgForm({
                          ...createOrgForm,
                          organizationName: e.target.value
                        })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        type="text"
                        placeholder="e.g., Woodside Energy, GE"
                        value={createOrgForm.projectName}
                        onChange={(e) => setCreateOrgForm({
                          ...createOrgForm,
                          projectName: e.target.value
                        })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationCode">Organization Code</Label>
                      <Input
                        id="organizationCode"
                        type="text"
                        placeholder="e.g., TCS001, INF002"
                        value={createOrgForm.organizationCode}
                        onChange={(e) => setCreateOrgForm({
                          ...createOrgForm,
                          organizationCode: e.target.value.toUpperCase()
                        })}
                        required
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">Must be unique across all organizations</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projectCode">Project Code</Label>
                      <Input
                        id="projectCode"
                        type="text"
                        placeholder="e.g., WE001, GE002"
                        value={createOrgForm.projectCode}
                        onChange={(e) => setCreateOrgForm({
                          ...createOrgForm,
                          projectCode: e.target.value.toUpperCase()
                        })}
                        required
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">Must be unique across all projects</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your organization or project..."
                      value={createOrgForm.description}
                      onChange={(e) => setCreateOrgForm({
                        ...createOrgForm,
                        description: e.target.value
                      })}
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-green-600 text-sm">{success}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Organization...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Organization
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Join Existing Organization
                </CardTitle>
                <CardDescription>
                  Enter the organization code to join an existing team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinOrganization} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinOrgCode">Organization Code</Label>
                    <Input
                      id="joinOrgCode"
                      type="text"
                      placeholder="Enter organization code (e.g., TCS001)"
                      value={joinOrgForm.organizationCode}
                      onChange={(e) => setJoinOrgForm({
                        ...joinOrgForm,
                        organizationCode: e.target.value.toUpperCase()
                      })}
                      required
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Need help?</strong> Contact your organization administrator to get the correct organization code.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-green-600 text-sm">{success}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Joining Organization...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Organization
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Debug Section */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Debug Info
          </h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(user, null, 2)}
          </pre>
          <div className="mt-4">
            <Button
              variant="destructive"
              onClick={handleClearSession}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Clear Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
