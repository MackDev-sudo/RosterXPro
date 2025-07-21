import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { organizationService } from "../lib/organizationService";
import { supabase } from "../lib/supabase";
import {
  type UserOrganizationData,
  type RosterData,
} from "../lib/organizationService";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import OnboardingPage from "../pages/main/OnboardingPage";
import CreateTeam from "./CreateTeam";
import AddMember from "./AddMember";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, Users, Clock, Calendar } from "lucide-react";
import TeamRoster from "./TeamRoster";
import UpcommingLeaves from "./UpcommingLeaves";
import { Button } from "./ui/button";
import { Toaster } from "@/components/ui/toaster";

const RosterTable: React.FC<{
  rosterData: RosterData[];
  currentMonth: number;
  currentYear: number;
}> = ({ rosterData, currentMonth, currentYear }) => {
  // Generate days of the month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WO":
        return <Badge variant="secondary">WO</Badge>;
      case "None":
        return <Badge variant="outline">None</Badge>;
      case "Morning":
        return <Badge variant="default">M</Badge>;
      case "Evening":
        return <Badge variant="default">E</Badge>;
      case "Night":
        return <Badge variant="default">N</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  const getEntryForDate = (entries: any[], date: string) => {
    return entries.find((entry) => entry.date === date);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">Team Member</TableHead>
            {days.map((day) => (
              <TableHead key={day} className="text-center min-w-[80px]">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(
                      currentYear,
                      currentMonth - 1,
                      day
                    ).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span>{day}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rosterData.map((member) => (
            <TableRow key={member.user_id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{member.username}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
              </TableCell>
              {days.map((day) => {
                const dateStr = `${currentYear}-${currentMonth
                  .toString()
                  .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                const entry = getEntryForDate(member.entries, dateStr);
                return (
                  <TableCell key={day} className="text-center">
                    {getStatusBadge(entry?.status || "None")}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const OrganizationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orgData, setOrgData] = useState<UserOrganizationData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamLead, setTeamLead] = useState<string | null>(null);
  const [manager, setManager] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<number>(0);
  const [rosterData, setRosterData] = useState<RosterData[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showUpcomingLeave, setShowUpcomingLeave] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrganizationData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeam && selectedTeam.id !== "no-team") {
      loadRosterData();
      loadTeamDetails();
    } else {
      // Clear roster data if no real team is selected
      setRosterData([]);
      setTeamSize(0);
    }
  }, [selectedTeam, currentMonth, currentYear]);

  const loadOrganizationData = async () => {
    if (!user) return;

    try {
      const data = await organizationService.getUserOrganizationData(user.id);
      setOrgData(data);

      // Get user's role in the organization
      const { data: userOrgData } = await supabase
        .from("user_organizations")
        .select("role")
        .eq("user_id", user.id)
        .single();

      setUserRole(userOrgData?.role || "member");

      if (data) {
        setSelectedTeam(data.selectedTeam);
        setTeamLead(data.teamLead);
        setManager(data.manager);
        setTeamSize(data.teamSize);
      }
    } catch (error) {
      console.error("Error loading organization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async () => {
    if (!selectedTeam || selectedTeam.id === "no-team") {
      setTeamLead(null);
      setManager(null);
      setTeamSize(0);
      return;
    }

    try {
      // Get team lead and manager names
      let teamLeadName = null;
      let managerName = null;

      if (selectedTeam.team_lead_id) {
        const { data: leadProfile } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("user_id", selectedTeam.team_lead_id)
          .single();
        teamLeadName = leadProfile?.username || null;
      }

      if (selectedTeam.manager_id) {
        const { data: managerProfile } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("user_id", selectedTeam.manager_id)
          .single();
        managerName = managerProfile?.username || null;
      }

      // Get team size
      const { count: teamSizeCount } = await supabase
        .from("team_members")
        .select("*", { count: "exact" })
        .eq("team_id", selectedTeam.id);

      setTeamLead(teamLeadName);
      setManager(managerName);
      setTeamSize(teamSizeCount || 0);
    } catch (error) {
      console.error("Error loading team details:", error);
    }
  };

  const handleTeamSelection = (team: any) => {
    setSelectedTeam(team);
  };

  // Function to get team lead and manager info for selected team
  const getTeamInfo = () => {
    if (!selectedTeam || selectedTeam.id === "no-team") {
      return {
        teamLead: null,
        manager: null,
      };
    }

    return {
      teamLead: teamLead || selectedTeam.team_lead_name,
      manager: manager || selectedTeam.project_manager_name,
    };
  };

  const teamInfo = getTeamInfo();

  const loadRosterData = async () => {
    if (!orgData || !selectedTeam || selectedTeam.id === "no-team") {
      setRosterData([]);
      return;
    }

    try {
      const data = await organizationService.getTeamRosterData(
        selectedTeam.id,
        currentYear,
        currentMonth
      );
      setRosterData(data);
    } catch (error) {
      console.error("Error loading roster data:", error);
      setRosterData([]);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleOpenOnboarding = () => {
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <OnboardingPage />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orgData) {
    return null; // This will show the simple dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar onOpenOnboarding={handleOpenOnboarding} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Info Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
          <div className="flex items-center justify-between">
            {/* Left Side - Organization Info */}
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {orgData.organization.name.charAt(0)}
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-3 ml-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {orgData.organization.name}
                  </h1>
                </div>
                {/* Show org code and user role below org name */}
                <div className="flex items-center space-x-3 ml-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Organization Code: {orgData.organization.code}
                  </Badge>
                  <Badge
                    variant={userRole === "admin" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {userRole === "admin" ? "👑 Admin" : "👤 Member"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Side - Team Info */}
            <div className="flex items-start space-x-8">
              {/* Team Lead */}
              <div className="group relative flex-1">
                <div className="flex flex-col items-center text-center cursor-pointer">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 font-semibold text-sm">
                      {teamInfo.teamLead
                        ? teamInfo.teamLead
                            .split(" ")
                            .map((n: string) => n.charAt(0))
                            .join("")
                        : "TL"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Team Lead</p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight max-w-[15ch] truncate">
                    {teamInfo.teamLead
                      ? (() => {
                          const nameParts = teamInfo.teamLead.split(" ");
                          return nameParts.length > 1
                            ? `${nameParts[0]} ${
                                nameParts[nameParts.length - 1]
                              }`
                            : teamInfo.teamLead;
                        })()
                      : "Not assigned"}
                  </p>
                </div>

                {/* Tooltip with contact details */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap z-10">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {teamInfo.teamLead || "No team lead assigned"}
                    </p>
                    {selectedTeam?.team_lead_email && (
                      <p className="text-gray-300">
                        📧 {selectedTeam.team_lead_email}
                      </p>
                    )}
                    {selectedTeam?.team_lead_phone && (
                      <p className="text-gray-300">
                        📞 {selectedTeam.team_lead_phone}
                      </p>
                    )}
                    {!selectedTeam?.team_lead_email &&
                      !selectedTeam?.team_lead_phone && (
                        <p className="text-gray-300">
                          Contact information not available
                        </p>
                      )}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="flex items-center justify-center">
                <div className="w-px h-24 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>
              </div>

              {/* Manager */}
              <div className="group relative flex-1">
                <div className="flex flex-col items-center text-center cursor-pointer">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                    <span className="text-purple-600 font-semibold text-sm">
                      {teamInfo.manager
                        ? teamInfo.manager
                            .split(" ")
                            .map((n: string) => n.charAt(0))
                            .join("")
                        : "M"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Manager</p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight max-w-[15ch] truncate">
                    {teamInfo.manager
                      ? (() => {
                          const nameParts = teamInfo.manager.split(" ");
                          return nameParts.length > 1
                            ? `${nameParts[0]} ${
                                nameParts[nameParts.length - 1]
                              }`
                            : teamInfo.manager;
                        })()
                      : "Not assigned"}
                  </p>
                </div>

                {/* Tooltip with contact details */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap z-10">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {teamInfo.manager || "No manager assigned"}
                    </p>
                    {selectedTeam?.project_manager_email && (
                      <p className="text-gray-300">
                        📧 {selectedTeam.project_manager_email}
                      </p>
                    )}
                    {selectedTeam?.project_manager_phone && (
                      <p className="text-gray-300">
                        📞 {selectedTeam.project_manager_phone}
                      </p>
                    )}
                    {!selectedTeam?.project_manager_email &&
                      !selectedTeam?.project_manager_phone && (
                        <p className="text-gray-300">
                          Contact information not available
                        </p>
                      )}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show organization info for users without project assignment, or project/team info if assigned */}
        {!orgData.project || selectedTeam?.id === "no-team" ? (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 mb-8 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-lg">
                  {orgData.organization.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Welcome to {orgData.organization.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Organization Code:{" "}
                  <span className="font-medium">
                    {orgData.organization.code}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-orange-100">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">🎯 Current Status:</span> You are
                a member of this organization but haven't been assigned to any
                project or team yet.
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">⏳ Next Steps:</span> A project
                admin will assign you to a specific project and team based on
                requirements.
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">📋 To View Roster:</span> You need
                to be part of a project and team to view roster details and
                schedules.
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">📞 Need Help?</span> Contact your
                organization administrator for project and team assignment.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 mb-8 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {orgData.organization.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  You are part of{" "}
                  <span className="font-bold">{orgData.project.name}</span>
                </h3>
                <p className="text-base text-gray-700 font-medium mb-2">
                  Project Code:{" "}
                  <span className="font-semibold">{orgData.project.code}</span>
                  {selectedTeam && selectedTeam.id !== "no-team" && (
                    <span className="ml-2">
                      | Team{" "}
                      <span className="font-semibold">{selectedTeam.name}</span>
                    </span>
                  )}
                </p>
                {/* Basic information for roles */}
                <div className="mt-2">
                  {userRole === "admin" && (
                    <div className="text-xs text-blue-900 bg-blue-100 rounded px-3 py-1 inline-block mb-1">
                      <span className="font-semibold">Admin:</span> Full access.
                      Can add members, generate roster, create teams, manage all
                      organization settings.
                    </div>
                  )}
                  {userRole === "manager" && (
                    <div className="text-xs text-purple-900 bg-purple-100 rounded px-3 py-1 inline-block mb-1">
                      <span className="font-semibold">Manager:</span> Can view
                      and manage team schedules, approve leaves, limited team
                      management.
                    </div>
                  )}
                  {userRole === "member" && (
                    <div className="text-xs text-gray-800 bg-gray-100 rounded px-3 py-1 inline-block mb-1">
                      <span className="font-semibold">Member:</span> Read-only
                      access. Can view own schedule, team roster, and leave
                      status.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* On Call Section - Compact */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 mb-8 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {teamInfo.teamLead
                    ? teamInfo.teamLead
                        .split(" ")
                        .map((n: string) => n.charAt(0))
                        .join("")
                    : "OC"}
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    On Call
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {teamInfo.teamLead || "Not assigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">On Call Since</p>
                <p className="text-sm font-semibold text-gray-900">--</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Contact</p>
                <p className="text-sm font-semibold text-gray-900">--</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-semibold text-gray-900">--</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamSize}</div>
              <p className="text-xs text-muted-foreground">
                Total team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leaves Applied
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orgData.leavesApplied}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Leaves
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpcomingLeave(true)}
                className="ml-2"
              >
                Add
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orgData.upcomingLeaves}</div>
              <p className="text-xs text-muted-foreground">Approved leaves</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comp-off Balance
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orgData.compOffBalance}</div>
              <p className="text-xs text-muted-foreground">Available days</p>
            </CardContent>
          </Card>
        </div>

        {/* Roster Table */}
        <TeamRoster
          orgData={orgData}
          selectedTeam={selectedTeam}
          rosterData={rosterData}
          userRole={userRole}
          currentMonth={currentMonth}
          currentYear={currentYear}
          monthNames={monthNames}
          navigateMonth={navigateMonth}
          setShowAddMember={setShowAddMember}
          setShowCreateTeam={setShowCreateTeam}
          onTeamSelect={handleTeamSelection}
          loadRosterData={loadRosterData}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Admin-only modals */}
      {userRole === "admin" && (
        <>
          {/* Create Team Modal */}
          <CreateTeam
            isOpen={showCreateTeam}
            onClose={() => setShowCreateTeam(false)}
            projects={
              orgData
                ? [
                    {
                      id: orgData.project.id,
                      name: orgData.project.name,
                      code: orgData.project.code,
                    },
                  ]
                : []
            }
            onTeamCreated={() => {
              // Refresh organization data to show the new team
              loadOrganizationData();
            }}
          />

          {/* Add Member Modal */}
          <AddMember
            isOpen={showAddMember}
            onClose={() => setShowAddMember(false)}
            teams={
              orgData
                ? orgData.teams.filter((team) => team.id !== "no-team")
                : []
            }
            onMemberAdded={() => {
              // Refresh organization data to update team size
              loadOrganizationData();
            }}
          />
        </>
      )}

      <UpcommingLeaves
        open={showUpcomingLeave}
        onClose={() => setShowUpcomingLeave(false)}
      />
      <Toaster />
    </div>
  );
};
