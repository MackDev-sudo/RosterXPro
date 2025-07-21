import { supabase } from "./supabase";
import type { Database } from "./supabase";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
type RosterEntry = Database["public"]["Tables"]["roster_entries"]["Row"];
type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];
type UpcomingLeave = Database["public"]["Tables"]["upcoming_leaves"]["Row"];

export interface UserOrganizationData {
  organization: Organization;
  project: Project;
  teams: Team[];
  selectedTeam: Team;
  teamLead: string | null;
  manager: string | null;
  onCall: string | null;
  teamSize: number;
  leavesApplied: number;
  upcomingLeaves: number;
  compOffBalance: number;
}

export interface RosterData {
  user_id: string;
  username: string;
  email: string;
  entries: RosterEntry[];
}

export interface LeaveInput {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  lrid?: string;
}

export const organizationService = {
  // Simple check if user exists in user_organizations table
  async userHasOrganization(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_organizations")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (error) {
        console.error("Error checking user organization:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking user organization:", error);
      return false;
    }
  },

  // Check if user is associated with an organization
  async getUserOrganizationData(
    userId: string
  ): Promise<UserOrganizationData | null> {
    try {
      // Get user organization association from user_organizations table
      const { data: userOrg, error: userOrgError } = await supabase
        .from("user_organizations")
        .select("organization_id")
        .eq("user_id", userId)
        .single();

      if (userOrgError || !userOrg?.organization_id) {
        return null;
      }

      // Get organization
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", userOrg.organization_id)
        .single();

      if (orgError || !organization) {
        return null;
      }

      // Get team member info (this might not exist yet for new users)
      const { data: teamMember } = await supabase
        .from("team_members")
        .select(
          `
          *,
          teams (
            *,
            projects (*)
          )
        `
        )
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      // Get the user's project (either from their team or first project in org)
      let project = null;
      let userTeamId = null;

      if (teamMember) {
        const team = teamMember.teams as any;
        project = team.projects;
        userTeamId = team.id;
      } else {
        // Get first project for this organization if user has no team
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("organization_id", userOrg.organization_id)
          .limit(1)
          .single();

        if (projectError || !projectData) {
          return null;
        }
        project = projectData;
      }

      // Change the teams query to include team_members with user_id and role
      const { data: allTeams, error: teamsError } = await supabase
        .from("teams")
        .select("*, team_members(user_id, role)")
        .eq("project_id", project.id)
        .order("name");

      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        return null;
      }

      // Create a default team structure for users without teams
      const defaultTeam = {
        id: "no-team",
        name: "No Team Assigned",
        description: null,
        project_id: project.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        team_lead_name: null,
        team_lead_email: null,
        team_lead_phone: null,
        project_manager_name: null,
        project_manager_email: null,
        project_manager_phone: null,
        team_code: null,
        team_lead_id: null,
        manager_id: null,
      };

      // Determine the selected team
      let selectedTeam = defaultTeam;
      if (userTeamId) {
        const userTeam = allTeams?.find((team) => team.id === userTeamId);
        if (userTeam) {
          selectedTeam = userTeam;
        }
      }

      // Get team lead and manager names for selected team
      let teamLead = null;
      let manager = null;

      if (selectedTeam.team_lead_id) {
        const { data: leadProfile } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("user_id", selectedTeam.team_lead_id)
          .single();
        teamLead = leadProfile?.username || null;
      }

      if (selectedTeam.manager_id) {
        const { data: managerProfile } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("user_id", selectedTeam.manager_id)
          .single();
        manager = managerProfile?.username || null;
      }

      // Get team size
      const { count: teamSize } = await supabase
        .from("team_members")
        .select("*", { count: "exact" })
        .eq("team_id", selectedTeam.id);

      // Get leaves applied this month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { count: leavesApplied } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("start_date", `${currentMonth}-01`)
        .lt("start_date", `${currentMonth}-32`);

      // Get upcoming leaves
      const today = new Date().toISOString().slice(0, 10);
      const { count: upcomingLeaves } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "approved")
        .gte("start_date", today);

      // Add default team to the list if user has no team
      const teams = allTeams || [];
      if (!userTeamId) {
        teams.unshift(defaultTeam);
      }

      return {
        organization,
        project,
        teams,
        selectedTeam,
        teamLead,
        manager,
        onCall: teamLead, // For now, assume team lead is on call, this can be made dynamic
        teamSize: teamSize || 0,
        leavesApplied: leavesApplied || 0,
        upcomingLeaves: upcomingLeaves || 0,
        compOffBalance: 0, // TODO: Implement comp-off balance calculation
      };
    } catch (error) {
      console.error("Error fetching user organization data:", error);
      return null;
    }
  },

  // Get roster data for a team for a specific month
  async getTeamRosterData(
    teamId: string,
    year: number,
    month: number
  ): Promise<RosterData[]> {
    try {
      // Handle case where user has no team yet
      if (teamId === "no-team") {
        return [];
      }

      // Define startDate and endDate before using them
      const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
      const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;
      // Fetch all team members for the team
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select(
          `
          user_id,
          user_profiles (username, email)
        `
        )
        .eq("team_id", teamId);

      if (membersError || !teamMembers) {
        return [];
      }

      // Fetch all roster entries for the team and month (not filtered by user)
      const { data: rosterEntries, error: entriesError } = await supabase
        .from("roster_entries")
        .select("*")
        .eq("team_id", teamId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (entriesError) {
        console.error("Error fetching roster entries:", entriesError);
        return [];
      }

      // Combine data
      const rosterData: RosterData[] = teamMembers.map((member) => {
        const userProfile = member.user_profiles as any;
        const userEntries = (
          rosterEntries?.filter((entry) => entry.user_id === member.user_id) ||
          []
        ).map((entry) => ({
          date: entry.date,
          status: entry.shift_type, // map shift_type to status for UI
        }));

        return {
          user_id: member.user_id,
          username: userProfile?.username || "",
          email: userProfile?.email || "",
          entries: userEntries,
        };
      });

      return rosterData;
    } catch (error) {
      console.error("Error fetching team roster data:", error);
      return [];
    }
  },

  // Create or update roster entry
  async updateRosterEntry(
    userId: string,
    teamId: string,
    date: string,
    shiftType: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("roster_entries").upsert(
        {
          user_id: userId,
          team_id: teamId,
          date,
          shift_type: shiftType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,team_id,date" }
      );

      if (error) {
        console.error("Error updating roster entry:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating roster entry:", error);
      return false;
    }
  },

  // Create organization
  async createOrganization(organizationData: {
    name: string;
    code: string;
    description?: string | null;
    created_by: string;
  }): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert({
          name: organizationData.name,
          code: organizationData.code,
          description: organizationData.description,
          created_by: organizationData.created_by,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create organization: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  },

  // Create project
  async createProject(projectData: {
    name: string;
    code: string;
    organization_id: string;
    description?: string | null;
    created_by: string;
  }): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: projectData.name,
          code: projectData.code,
          organization_id: projectData.organization_id,
          description: projectData.description,
          created_by: projectData.created_by,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  // Associate user with organization in user_organizations table
  async updateUserOrganization(
    userId: string,
    organizationId: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("user_organizations").insert({
        user_id: userId,
        organization_id: organizationId,
        role: "admin", // Default role for organization creator
      });

      if (error) {
        throw new Error(
          `Failed to associate user with organization: ${error.message}`
        );
      }
    } catch (error) {
      console.error("Error associating user with organization:", error);
      throw error;
    }
  },

  // Check if organization code already exists
  async checkOrganizationCodeExists(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("id")
        .eq("code", code)
        .limit(1);

      if (error) {
        console.error("Error checking organization code:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking organization code:", error);
      return false;
    }
  },

  // Check if project code already exists within an organization
  async checkProjectCodeExists(
    code: string,
    organizationId?: string
  ): Promise<boolean> {
    try {
      let query = supabase.from("projects").select("id").eq("code", code);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error("Error checking project code:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking project code:", error);
      return false;
    }
  },

  // Create team
  async createTeam(teamInput: {
    name: string;
    description?: string;
    project_id: string;
    created_by: string;
    team_lead_name?: string;
    team_lead_email?: string;
    team_lead_phone?: string;
    project_manager_name?: string;
    project_manager_email?: string;
    project_manager_phone?: string;
    team_code?: string;
  }): Promise<Team> {
    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamInput.name,
          description: teamInput.description || null,
          project_id: teamInput.project_id,
          created_by: teamInput.created_by,
          team_lead_name: teamInput.team_lead_name || null,
          team_lead_email: teamInput.team_lead_email || null,
          team_lead_phone: teamInput.team_lead_phone || null,
          project_manager_name: teamInput.project_manager_name || null,
          project_manager_email: teamInput.project_manager_email || null,
          project_manager_phone: teamInput.project_manager_phone || null,
          team_code: teamInput.team_code || null,
        })
        .select()
        .single();

      if (teamError) {
        console.error("Error creating team:", teamError);
        throw teamError;
      }

      // Add the creator as a team member
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: teamData.id,
          user_id: teamInput.created_by,
          role: "member",
        });

      if (memberError) {
        console.error("Error adding team member:", memberError);
        // If adding the team member fails, we could optionally delete the team
        // to maintain consistency, but for now we'll just throw the error
        throw memberError;
      }

      return teamData;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  },

  // Check if team code already exists within a project
  async checkTeamCodeExists(
    code: string,
    projectId?: string
  ): Promise<boolean> {
    try {
      let query = supabase.from("teams").select("id").eq("team_code", code);

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error("Error checking team code:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking team code:", error);
      return false;
    }
  },

  // Get organization by code
  async getOrganizationByCode(code: string): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("code", code)
        .single();

      if (error) {
        console.error("Error fetching organization by code:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching organization by code:", error);
      return null;
    }
  },

  // Join organization (add user to user_organizations with member role)
  async joinOrganization(
    userId: string,
    organizationId: string
  ): Promise<void> {
    try {
      // Check if user is already a member of this organization
      const { data: existing, error: checkError } = await supabase
        .from("user_organizations")
        .select("id")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(
          `Failed to check existing membership: ${checkError.message}`
        );
      }

      if (existing) {
        throw new Error("You are already a member of this organization");
      }

      // Add user to organization with member role
      const { error } = await supabase.from("user_organizations").insert({
        user_id: userId,
        organization_id: organizationId,
        role: "member", // Default role for joining users
      });

      if (error) {
        throw new Error(`Failed to join organization: ${error.message}`);
      }
    } catch (error) {
      console.error("Error joining organization:", error);
      throw error;
    }
  },

  // Add upcoming leaves for a user
  async addUpcomingLeaves(
    leaves: LeaveInput[],
    userId: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      const leavesWithUserId = leaves.map((leave) => ({
        ...leave,
        user_id: userId,
      }));

      const { error } = await supabase
        .from("upcoming_leaves")
        .insert(leavesWithUserId);

      if (error) {
        console.error("Error adding upcoming leaves:", error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in addUpcomingLeaves service:", error);
      return { success: false, error };
    }
  },
};

export type {
  Organization,
  Project,
  Team,
  TeamMember,
  RosterEntry,
  LeaveRequest,
  UpcomingLeave,
};
