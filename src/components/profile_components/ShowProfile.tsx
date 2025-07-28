import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Building2,
  Users,
  Edit,
  Shield,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  phone: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface Team {
  id: string;
  name: string;
  project_id: string;
  team_code?: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  organization_id: string;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface ShowProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShowProfile: React.FC<ShowProfileProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile();
    }
  }, [isOpen, user]);

  const loadUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error loading user profile:", profileError);
      } else {
        setProfile(profileData);
      }

      // Load user organization details
      const { data: userOrgData, error: userOrgError } = await supabase
        .from("user_organizations")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (!userOrgError && userOrgData && userOrgData.length > 0) {
        const userOrg = userOrgData[0];

        // Load organization details
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", userOrg.organization_id)
          .single();

        if (!orgError && orgData) {
          setOrganization(orgData);
        }
      }

      // Load team member details
      const { data: teamMemberData, error: teamMemberError } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (!teamMemberError && teamMemberData && teamMemberData.length > 0) {
        const member = teamMemberData[0];
        setTeamMember(member);
        setUserRole(member.role);

        // Load team details
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("id", member.team_id)
          .single();

        if (!teamError && teamData) {
          setTeam(teamData);

          // Load project details using team's project_id
          if (teamData.project_id) {
            const { data: projectData, error: projectError } = await supabase
              .from("projects")
              .select("*")
              .eq("id", teamData.project_id)
              .single();

            if (!projectError && projectData) {
              setProject(projectData);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysSince = (dateString: string) => {
    const joinDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading profile...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile?.username || "Profile"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {profile?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {profile?.username || "User"}
              </h3>
              <p className="text-sm text-gray-500">
                {organization?.name || "Organization"}
              </p>
              <p className="text-xs text-gray-400">
                {userRole
                  ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
                  : "User"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Contact Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 flex-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">
                      {profile?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">
                      {profile?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Account Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 flex-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Member Since
                    </p>
                    <p className="text-sm text-gray-600">
                      {profile?.created_at
                        ? formatDate(profile.created_at)
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">User ID</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {user?.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project & Team Information */}
          {(project || team) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Project & Team
                </h4>

                <div className="space-y-3">
                  {/* Project and Team in same row */}
                  <div className="flex items-center gap-6">
                    {project && (
                      <div className="flex items-center gap-3 flex-1">
                        <Building className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Project
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            {project.name}
                          </p>
                          <p className="text-xs text-blue-500 font-mono bg-blue-50 px-2 py-1 rounded">
                            Code: {project.code}
                          </p>
                        </div>
                      </div>
                    )}

                    {team && (
                      <div className="flex items-center gap-3 flex-1">
                        <Users className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Team
                          </p>
                          <p className="text-sm font-semibold text-green-600">
                            {team.name}
                          </p>
                          <p className="text-xs text-green-500 font-mono bg-green-50 px-2 py-1 rounded">
                            Code: {team.team_code || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team Member Since below */}
                  {teamMember && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Team Member Since
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(teamMember.joined_at)} (
                          {calculateDaysSince(teamMember.joined_at)} days)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowProfile;
