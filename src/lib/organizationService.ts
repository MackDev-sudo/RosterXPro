import { supabase } from "./supabase";
import type { Database } from "./supabase";
import type {
  RosterRules,
  LeaveEntry,
  ShiftAssignment as RosterAssignment,
} from "../../utils/generateRoster";

// Database Types
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type RosterEntry = Database["public"]["Tables"]["roster_entries"]["Row"];
export type LeaveRequest =
  Database["public"]["Tables"]["leave_requests"]["Row"];

// Interface Definitions
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
  entries: {
    date: string;
    status: string;
  }[];
}

export interface LeaveInput {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  lrid?: string;
}

// Local Types
type TeamMember = {
  id: string;
  name: string;
};

// Service Implementation
export const organizationService = {
  // 1. Get roster rules for a team
  async getRosterRules(teamId: string): Promise<RosterRules | null> {
    const { data, error } = await supabase
      .from("roster_rules")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return null;

    // Convert from snake_case to camelCase and parse JSON string
    const shiftTimings =
      typeof data.shift_timings === "string"
        ? JSON.parse(data.shift_timings)
        : data.shift_timings;

    return {
      ...data,
      numberOfShifts: data.number_of_shifts,
      shiftTimings,
      minMembersPerShift: data.min_members_per_shift,
      maxMembersPerShift: data.max_members_per_shift,
      onCallType: data.on_call_type,
      onCallMinMembers: data.on_call_min_members,
      onCallMaxMembers: data.on_call_max_members,
      rotationCycle: data.rotation_cycle,
      customRotationDays: data.custom_rotation_days,
      consecutiveShiftLimit: data.consecutive_shift_limit,
      minRestHoursBetweenShifts: data.min_rest_hours_between_shifts,
      weekendCoverage: data.weekend_coverage,
      holidayCoverage: data.holiday_coverage,
      enforceEqualDistribution: data.enforce_equal_distribution,
      prioritizeExperience: data.prioritize_experience,
      allowSelfSelection: data.allow_self_selection,
      advanceNotificationDays: data.advance_notification_days,
      allowShiftSwapping: data.allow_shift_swapping,
      requireApprovalForSwaps: data.require_approval_for_swaps,
      dedicatedOnCallMember: data.dedicated_on_call_member,
    } as RosterRules;
  },

  // 2. Get team members with profile info
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("user_id, user_profiles(username)")
      .eq("team_id", teamId);
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.user_id,
      name: row.user_profiles?.username || "Unknown",
    }));
  },

  // 3. Get leaves for a team in a month
  async getLeaves(
    teamId: string,
    year: number,
    month: number
  ): Promise<LeaveEntry[]> {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-31`;
    const { data, error } = await supabase
      .from("leave_requests")
      .select("user_id, start_date, end_date")
      .eq("team_id", teamId)
      .or(`start_date.gte.${start},end_date.lte.${end}`);
    if (error || !data) return [];
    // Flatten leave periods to daily entries
    const leaves: LeaveEntry[] = [];
    data.forEach((row: any) => {
      const startDate = new Date(row.start_date);
      const endDate = new Date(row.end_date);
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        leaves.push({
          userId: row.user_id,
          date: d.toISOString().slice(0, 10),
          type: "Leave",
        });
      }
    });
    return leaves;
  },

  // 4. Save generated roster assignments
  async saveGeneratedRoster(
    teamId: string,
    assignments: RosterAssignment[]
  ): Promise<boolean> {
    try {
      // Define the type for our roster entry matching the database schema
      type RosterEntryRow = {
        user_id: string;
        team_id: string;
        date: string;
        shift_type: string;
        notes?: string;
        created_at?: string;
        updated_at?: string;
        created_by?: string;
      };

      console.log("Received assignments:", assignments);

      if (!Array.isArray(assignments) || assignments.length === 0) {
        console.error("No assignments received or invalid format");
        return false;
      }

      // Create all rows from the assignments
      const allRows: RosterEntryRow[] = assignments
        .map((assignment) => {
          if (
            !assignment.memberId ||
            !assignment.date ||
            !assignment.shift_type
          ) {
            console.error("Invalid assignment:", assignment);
            return null;
          }

          console.log("Processing assignment:", assignment);
          const entry: RosterEntryRow = {
            user_id: assignment.memberId,
            team_id: teamId,
            date: assignment.date,
            shift_type: assignment.shift_type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: undefined,
          };

          // Add notes based on shift type
          switch (assignment.shift_type) {
            case "OC":
              entry.notes = "On-Call Assignment";
              break;
            case "WO":
              entry.notes = "Week Off";
              break;
            case "S1":
              entry.notes = "Regular Shift";
              break;
          }

          return entry;
        })
        .filter((entry): entry is RosterEntryRow => entry !== null);

      // Remove any duplicate entries based on unique constraint
      const uniqueRows = allRows.reduce((acc: RosterEntryRow[], current) => {
        const exists = acc.find(
          (item) =>
            item.user_id === current.user_id &&
            item.team_id === current.team_id &&
            item.date === current.date
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Log the first row for debugging
      console.log("Sample roster entry:", uniqueRows[0]);

      // Upsert entries - this will insert new records or update existing ones
      const { error: upsertError } = await supabase
        .from("roster_entries")
        .upsert(uniqueRows, {
          onConflict: "user_id,team_id,date", // Specify the unique constraint
        });

      if (upsertError) {
        console.error("Error upserting roster entries:", upsertError);
        return false;
      }

      return true;

      if (upsertError) {
        console.error("Error saving roster:", upsertError);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in saveGenerateRoster:", err);
      return false;
    }
  },

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
  // Comp-off carry forward functions
  async getCurrentCompOffBalance(
    userId: string,
    teamId: string,
    year: number,
    month: number
  ): Promise<number> {
    console.log(
      `Service: Getting comp-off balance for user: ${userId}, team: ${teamId}, year: ${year}, month: ${month}`
    );

    try {
      const { data, error } = await supabase.rpc(
        "get_current_comp_off_balance",
        {
          p_user_id: userId,
          p_team_id: teamId,
          p_year: year,
          p_month: month,
        }
      );

      console.log(`Service: RPC response - data: ${data}, error:`, error);

      if (error) {
        console.error("Error getting comp-off balance:", error);
        // If the function doesn't exist, throw an error to trigger fallback
        if (error.code === "PGRST202") {
          throw new Error("Database function not found - using fallback");
        }
        return 0;
      }

      const result = data || 0;
      console.log(`Service: Returning balance: ${result}`);
      return result;
    } catch (error) {
      console.error("Error getting comp-off balance:", error);
      // Re-throw the error so the fallback can be triggered
      throw error;
    }
  },

  async calculateAndStoreCarryForward(
    userId: string,
    teamId: string,
    year: number,
    month: number
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc(
        "calculate_carry_forward_balance",
        {
          p_user_id: userId,
          p_team_id: teamId,
          p_year: year,
          p_month: month,
        }
      );

      if (error) {
        console.error("Error calculating carry forward:", error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error("Error calculating carry forward:", error);
      return 0;
    }
  },

  async getCarryForwardHistory(
    userId: string,
    teamId: string,
    limit: number = 12
  ): Promise<
    Array<{ year: number; month: number; carry_forward_balance: number }>
  > {
    try {
      const { data, error } = await supabase
        .from("comp_off_carry_forward")
        .select("year, month, carry_forward_balance")
        .eq("user_id", userId)
        .eq("team_id", teamId)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error getting carry forward history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error getting carry forward history:", error);
      return [];
    }
  },

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

      // Get upcoming leaves
      const upcomingLeaves = await this.getUpcomingLeavesCount(userId);

      // Get leaves applied this month
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7);
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      const { count: leavesApplied } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("start_date", `${currentMonth}-01`)
        .lt(
          "start_date",
          `${currentMonth}-${String(lastDayOfMonth).padStart(2, "0")}`
        );

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

  // Fetch all roster entries for a user and team up to and including a given year and month
  async getUserRosterEntriesUpToMonth(
    userId: string,
    teamId: string,
    year: number,
    month: number
  ) {
    // Calculate the last date of the given month
    const endDate = new Date(year, month, 0); // JS months are 1-based for day 0
    const endDateStr = endDate.toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("roster_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("team_id", teamId)
      .lte("date", endDateStr);
    if (error) {
      console.error("Error fetching user roster entries up to month:", error);
      return [];
    }
    return data || [];
  },

  // Save monthly comp-off balance
  async saveMonthlyCompOffBalance(
    userId: string,
    teamId: string,
    year: number,
    month: number,
    ocDays: number,
    cfDays: number,
    balance: number,
    carryForwardBalance: number
  ): Promise<void> {
    const { error } = await supabase.from("comp_off_monthly_balance").upsert({
      user_id: userId,
      team_id: teamId,
      year,
      month,
      oc_days: ocDays,
      cf_days: cfDays,
      balance,
      carry_forward_balance: carryForwardBalance,
    });

    if (error) {
      console.error("Error saving monthly comp-off balance:", error);
      throw error;
    }
  },

  // Get monthly comp-off balance
  async getMonthlyCompOffBalance(
    userId: string,
    teamId: string,
    year: number,
    month: number
  ): Promise<any> {
    const { data, error } = await supabase
      .from("comp_off_monthly_balance")
      .select("*")
      .eq("user_id", userId)
      .eq("team_id", teamId)
      .eq("year", year)
      .eq("month", month)
      .single();

    if (error) {
      console.error("Error fetching monthly comp-off balance:", error);
      throw error;
    }

    return data;
  },

  // Get upcoming leaves count for a user
  async getUpcomingLeavesCount(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { count, error } = await supabase
        .from("upcoming_leaves")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("start_date", today);

      if (error) {
        console.error("Error fetching upcoming leaves count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getUpcomingLeavesCount:", error);
      return 0;
    }
  },

  // Get all team members' upcoming leaves (for admin view)
  async getAllTeamUpcomingLeaves(teamId: string): Promise<any[]> {
    try {
      // First get all team member IDs
      const { data: teamMembers, error: teamError } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId);

      if (teamError || !teamMembers) {
        console.error("Error fetching team members:", teamError);
        return [];
      }

      const userIds = teamMembers.map((member) => member.user_id);
      const today = new Date().toISOString().slice(0, 10);

      // Then get upcoming leaves for all team members
      const { data, error } = await supabase
        .from("upcoming_leaves")
        .select("*")
        .in("user_id", userIds)
        .gte("start_date", today);

      if (error) {
        console.error("Error fetching all team upcoming leaves:", error);
        return [];
      }

      // Get user profiles separately to avoid join issues
      if (data && data.length > 0) {
        const { data: userProfiles, error: profileError } = await supabase
          .from("user_profiles")
          .select("user_id, username, email")
          .in("user_id", userIds);

        if (profileError) {
          console.error("Error fetching user profiles:", profileError);
        }

        const profileMap = new Map();
        if (userProfiles) {
          userProfiles.forEach((profile) => {
            profileMap.set(profile.user_id, profile);
          });
        }

        return data.map((item) => ({
          ...item,
          username: profileMap.get(item.user_id)?.username || "",
          email: profileMap.get(item.user_id)?.email || "",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error in getAllTeamUpcomingLeaves:", error);
      return [];
    }
  },

  // Get user's upcoming leaves (for member view)
  async getUserUpcomingLeaves(userId: string): Promise<any[]> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("upcoming_leaves")
        .select("*")
        .eq("user_id", userId)
        .gte("start_date", today);

      if (error) {
        console.error("Error fetching user upcoming leaves:", error);
        return [];
      }

      // Get user profile separately to avoid join issues
      if (data && data.length > 0) {
        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("username, email")
          .eq("user_id", userId)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        }

        return data.map((item) => ({
          ...item,
          username: userProfile?.username || "",
          email: userProfile?.email || "",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error in getUserUpcomingLeaves:", error);
      return [];
    }
  },

  // Get all team members' applied leaves (for admin view)
  async getAllTeamAppliedLeaves(teamId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("roster_entries")
        .select("*")
        .eq("team_id", teamId)
        .in("shift_type", ["PL", "SL", "EL", "PtL", "ML", "CL"]);

      if (error) {
        console.error("Error fetching all team applied leaves:", error);
        return [];
      }

      // Get user profiles separately to avoid join issues
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((item) => item.user_id))];
        const { data: userProfiles, error: profileError } = await supabase
          .from("user_profiles")
          .select("user_id, username, email")
          .in("user_id", userIds);

        if (profileError) {
          console.error("Error fetching user profiles:", profileError);
        }

        const profileMap = new Map();
        if (userProfiles) {
          userProfiles.forEach((profile) => {
            profileMap.set(profile.user_id, profile);
          });
        }

        return data.map((item) => ({
          ...item,
          username: profileMap.get(item.user_id)?.username || "",
          email: profileMap.get(item.user_id)?.email || "",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error in getAllTeamAppliedLeaves:", error);
      return [];
    }
  },

  // Get user's applied leaves (for member view)
  async getUserAppliedLeaves(userId: string, teamId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("roster_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("team_id", teamId)
        .in("shift_type", ["PL", "SL", "EL", "PtL", "ML", "CL"]);

      if (error) {
        console.error("Error fetching user applied leaves:", error);
        return [];
      }

      // Get user profile separately to avoid join issues
      if (data && data.length > 0) {
        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("username, email")
          .eq("user_id", userId)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        }

        return data.map((item) => ({
          ...item,
          username: userProfile?.username || "",
          email: userProfile?.email || "",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error in getUserAppliedLeaves:", error);
      return [];
    }
  },

  // Get applied leaves count for a user in current month
  async getAppliedLeavesCount(
    userId: string,
    teamId: string,
    year: number,
    month: number
  ): Promise<number> {
    try {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

      console.log("Querying applied leaves with params:", {
        userId,
        teamId,
        startDate,
        endDate,
        leaveCodes: ["PL", "SL", "EL", "PtL", "ML", "CL"],
      });

      const { count, error } = await supabase
        .from("roster_entries")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("team_id", teamId)
        .in("shift_type", ["PL", "SL", "EL", "PtL", "ML", "CL"])
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) {
        console.error("Error fetching applied leaves count:", error);
        return 0;
      }

      console.log("Applied leaves query result:", { count, error });
      return count || 0;
    } catch (error) {
      console.error("Error in getAppliedLeavesCount:", error);
      return 0;
    }
  },
};

// End of file
