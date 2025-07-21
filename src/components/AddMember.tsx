import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, User, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Team {
  id: string;
  name: string;
  team_code: string | null;
}

interface UserProfile {
  user_id: string;
  username: string;
  email: string;
}

interface AddMemberProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onMemberAdded?: () => void;
}

const AddMember: React.FC<AddMemberProps> = ({ isOpen, onClose, teams, onMemberAdded }) => {
  const { user } = useAuth();
  const [memberForm, setMemberForm] = useState({
    email: '',
    role: '',
    teamId: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEmailDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for users by email
  useEffect(() => {
    const searchUsers = async () => {
      if (emailSearch.length < 3) {
        setSearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id, username, email')
          .or(`email.ilike.%${emailSearch}%,username.ilike.%${emailSearch}%`)
          .limit(10);

        if (error) {
          console.error('Error searching users:', error);
          console.error('Search term:', emailSearch);
          return;
        }

        console.log('Search results:', data);
        console.log('Search term:', emailSearch);
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [emailSearch]);

  const handleEmailSearchChange = (value: string) => {
    setEmailSearch(value);
    setMemberForm({ ...memberForm, email: value });
    setShowEmailDropdown(true);
    setSelectedUser(null);
  };

  const handleUserSelect = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setEmailSearch(userProfile.email);
    setMemberForm({ ...memberForm, email: userProfile.email });
    setShowEmailDropdown(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!memberForm.email || !memberForm.role || !memberForm.teamId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to add members');
      return;
    }

    setIsLoading(true);

    try {
      // First, check if user exists in user_profiles
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id, username, email')
        .eq('email', memberForm.email)
        .single();

      if (userError || !userProfile) {
        setError('User not found. Please make sure the email is correct and the user has an account.');
        setIsLoading(false);
        return;
      }

      // Check if user is already a member of this team
      const { data: existingMember, error: checkError } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userProfile.user_id)
        .eq('team_id', memberForm.teamId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing member:', checkError);
        setError('Error checking if user is already a member');
        setIsLoading(false);
        return;
      }

      if (existingMember) {
        setError('This user is already a member of the selected team');
        setIsLoading(false);
        return;
      }

      // Add user to team
      const { error: insertError } = await supabase
        .from('team_members')
        .insert([
          {
            user_id: userProfile.user_id,
            team_id: memberForm.teamId,
            role: memberForm.role,
            joined_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('Error adding member:', insertError);
        setError('Failed to add member to team');
        setIsLoading(false);
        return;
      }

      setSuccess(`Successfully added ${userProfile.username} to the team!`);
      
      // Reset form
      setMemberForm({
        email: '',
        role: '',
        teamId: ''
      });
      setEmailSearch('');
      setSelectedUser(null);
      setSearchResults([]);

      // Call callback if provided
      if (onMemberAdded) {
        onMemberAdded();
      }

      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);

    } catch (error) {
      console.error('Error adding member:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMemberForm({
      email: '',
      role: '',
      teamId: ''
    });
    setEmailSearch('');
    setSelectedUser(null);
    setSearchResults([]);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Add Team Member</span>
          </DialogTitle>
          <DialogDescription>
            Search for a user by email or username and add them to a team with a specific role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddMember} className="space-y-6">
          {/* User Search */}
          <div className="space-y-2">
            <Label htmlFor="email">Search User by Email or Username *</Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter email address or username..."
                  value={emailSearch}
                  onChange={(e) => handleEmailSearchChange(e.target.value)}
                  onFocus={() => setShowEmailDropdown(true)}
                  className="pl-10"
                  required
                />
              </div>
              
              {/* Search Results Dropdown */}
              {showEmailDropdown && (emailSearch.length >= 3 || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-1">
                      {searchResults.map((userProfile) => (
                        <button
                          key={userProfile.user_id}
                          type="button"
                          onClick={() => handleUserSelect(userProfile)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {userProfile.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{userProfile.username}</div>
                              <div className="text-xs text-gray-500">{userProfile.email}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : emailSearch.length >= 3 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No users found with this email
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Type at least 3 characters to search
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Selected User Display */}
            {selectedUser && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-green-800">{selectedUser.username}</div>
                    <div className="text-xs text-green-600">{selectedUser.email}</div>
                  </div>
                  <Badge variant="outline" className="ml-auto bg-green-100 text-green-700 border-green-300">
                    Selected
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select 
              value={memberForm.role} 
              onValueChange={(value) => setMemberForm({ ...memberForm, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>Member</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span>Manager</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team">Select Team *</Label>
            <Select 
              value={memberForm.teamId} 
              onValueChange={(value) => setMemberForm({ ...memberForm, teamId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{team.name}</span>
                      {team.team_code && (
                        <Badge variant="outline" className="text-xs">
                          {team.team_code}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !memberForm.email || !memberForm.role || !memberForm.teamId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMember;
