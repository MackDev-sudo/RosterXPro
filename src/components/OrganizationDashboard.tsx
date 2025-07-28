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
import { CalendarDays, Users, Calendar } from "lucide-react";
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
  const [compOffBalance, setCompOffBalance] = useState<number>(0);
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
  const [onCallProfile, setOnCallProfile] = useState<any>(null);
  const [localCompOffBalance, setLocalCompOffBalance] = useState<number>(0);
  const [carryForwardBalance, setCarryForwardBalance] = useState<number>(0);
  // Add a state to track carry forward for the next month
  const [nextMonthCarryForward, setNextMonthCarryForward] = useState<number>(0);
  // Add state for upcoming leaves count
  const [upcomingLeavesCount, setUpcomingLeavesCount] = useState<number>(0);
  // Add state for applied leaves count
  const [appliedLeavesCount, setAppliedLeavesCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadOrganizationData();
      loadUserCompOffBalance();
    }
  }, [user]);

  // Load carry forward balance when team or month changes
  useEffect(() => {
    if (user && selectedTeam && selectedTeam.id !== "no-team") {
      // Load local calculation immediately for instant feedback
      loadLocalCarryForward();
      // Only try database if it exists (for now, skip it)
      // loadCarryForwardBalance();
    }
  }, [user, selectedTeam, currentMonth, currentYear]);

  // Update local comp-off balance when roster data or carry forward changes
  useEffect(() => {
    if (user && selectedTeam && selectedTeam.id !== "no-team") {
      const totalBalance = calculateTotalBalance();
      setLocalCompOffBalance(totalBalance);
    }
  }, [rosterData, carryForwardBalance, currentMonth, currentYear, user]);

  // Recalculate balance when roster data changes (for immediate updates)
  useEffect(() => {
    if (user && selectedTeam && selectedTeam.id !== "no-team") {
      // Small delay to ensure roster data is updated
      const timer = setTimeout(() => {
        const totalBalance = calculateTotalBalance();
        setLocalCompOffBalance(totalBalance);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [rosterData]);

  // Function to handle immediate balance updates when roster changes
  const handleRosterDataChange = async () => {
    await loadRosterData();
    // The useEffect above will automatically recalculate the balance
  };

  // Function to handle immediate balance updates when roster entry changes
  const handleRosterEntryChange = () => {
    // Force recalculation of balance immediately
    const totalBalance = calculateTotalBalance();
    setLocalCompOffBalance(totalBalance);
  };

  // Fetch comp-off balance for logged-in user (legacy function - keeping for compatibility)
  const loadUserCompOffBalance = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("roster_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("shift_type", "OC");
    if (error) {
      console.error("Error fetching comp-off balance:", error);
      setCompOffBalance(0);
      return;
    }
    setCompOffBalance(data ? data.length : 0);
  };

  // Load carry forward balance from database
  const loadCarryForwardBalance = async () => {
    if (!user || !selectedTeam || selectedTeam.id === "no-team") return;

    console.log(
      `Loading carry forward balance for user: ${user.id}, team: ${selectedTeam.id}, month: ${currentMonth}, year: ${currentYear}`
    );

    try {
      const balance = await organizationService.getCurrentCompOffBalance(
        user.id,
        selectedTeam.id,
        currentYear,
        currentMonth
      );
      setCarryForwardBalance(balance);
      console.log(`Loaded carry forward balance: ${balance}`);
    } catch (error) {
      console.error("Error loading carry forward balance:", error);
      console.error("Error details:", error);

      // Fallback: Calculate carry forward locally if database functions don't exist
      console.log("Falling back to local calculation...");
      const fallbackBalance = calculateLocalCarryForward();
      setCarryForwardBalance(fallbackBalance);
      console.log(`Fallback carry forward balance: ${fallbackBalance}`);
    }
  };

  // Also call local calculation immediately for immediate feedback
  const loadLocalCarryForward = () => {
    if (!user || !selectedTeam || selectedTeam.id === "no-team") return;

    const localBalance = calculateLocalCarryForward();
    console.log(`Immediate local carry forward: ${localBalance}`);
    setCarryForwardBalance(localBalance);
  };

  // Calculate total balance for the current month being viewed
  const calculateTotalBalance = (): number => {
    if (!user || !selectedTeam || selectedTeam.id === "no-team") return 0;

    const currentDate = new Date();
    const currentSystemMonth = currentDate.getMonth() + 1;
    const currentSystemYear = currentDate.getFullYear();

    // For current month, show only current month's balance
    if (
      currentMonth === currentSystemMonth &&
      currentYear === currentSystemYear
    ) {
      const currentMonthOC = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                entry.status === "OC" &&
                new Date(entry.date).getMonth() + 1 === currentMonth &&
                new Date(entry.date).getFullYear() === currentYear
            ).length
          );
        }
        return total;
      }, 0);

      const currentMonthCF = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                (entry.status === "CF" || entry.status === "CmO") &&
                new Date(entry.date).getMonth() + 1 === currentMonth &&
                new Date(entry.date).getFullYear() === currentYear
            ).length
          );
        }
        return total;
      }, 0);

      const balance = currentMonthOC - currentMonthCF;
      console.log(
        `Current month balance: OC=${currentMonthOC}, CF=${currentMonthCF}, balance=${balance}`
      );
      return Math.max(0, balance);
    }

    // For next month, show carry forward + current month's balance
    if (
      currentMonth === currentSystemMonth + 1 &&
      currentYear === currentSystemYear
    ) {
      // Calculate carry forward from current month's data
      const carryForwardOC = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                entry.status === "OC" &&
                new Date(entry.date).getMonth() + 1 === currentSystemMonth &&
                new Date(entry.date).getFullYear() === currentSystemYear
            ).length
          );
        }
        return total;
      }, 0);

      const carryForwardCF = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                (entry.status === "CF" || entry.status === "CmO") &&
                new Date(entry.date).getMonth() + 1 === currentSystemMonth &&
                new Date(entry.date).getFullYear() === currentSystemYear
            ).length
          );
        }
        return total;
      }, 0);

      const carryForward = carryForwardOC - carryForwardCF;

      const currentMonthOC = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                entry.status === "OC" &&
                new Date(entry.date).getMonth() + 1 === currentMonth &&
                new Date(entry.date).getFullYear() === currentYear
            ).length
          );
        }
        return total;
      }, 0);

      const currentMonthCF = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                (entry.status === "CF" || entry.status === "CmO") &&
                new Date(entry.date).getMonth() + 1 === currentMonth &&
                new Date(entry.date).getFullYear() === currentYear
            ).length
          );
        }
        return total;
      }, 0);

      const totalBalance = carryForward + currentMonthOC - currentMonthCF;
      console.log(
        `Next month total: carry forward=${carryForward} (from ${currentSystemMonth}/${currentSystemYear}: OC=${carryForwardOC}, CF=${carryForwardCF}), current month: OC=${currentMonthOC}, CF=${currentMonthCF}, total=${totalBalance}`
      );
      return Math.max(0, totalBalance);
    }

    // For past months, show historical balance (should be from database)
    if (currentMonth < currentSystemMonth || currentYear < currentSystemYear) {
      const currentMonthOC = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                entry.status === "OC" &&
                new Date(entry.date).getMonth() + 1 === currentMonth &&
                new Date(entry.date).getFullYear() === currentYear
            ).length
          );
        }
        return total;
      }, 0);

      const currentMonthCF = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                (entry.status === "CF" || entry.status === "CmO") &&
                new Date(entry.date).getMonth() + 1 === currentMonth &&
                new Date(entry.date).getFullYear() === currentYear
            ).length
          );
        }
        return total;
      }, 0);

      const balance = currentMonthOC - currentMonthCF;
      console.log(
        `Past month balance: OC=${currentMonthOC}, CF=${currentMonthCF}, balance=${balance}`
      );
      return Math.max(0, balance);
    }

    return 0;
  };

  // Calculate carry forward based on actual roster data
  const calculateLocalCarryForward = (): number => {
    if (!user || !selectedTeam || selectedTeam.id === "no-team") return 0;

    console.log(
      `calculateLocalCarryForward called with month: ${currentMonth}, year: ${currentYear}`
    );

    // For current month, no carry forward
    const currentDate = new Date();
    const currentSystemMonth = currentDate.getMonth() + 1;
    const currentSystemYear = currentDate.getFullYear();

    if (
      currentMonth === currentSystemMonth &&
      currentYear === currentSystemYear
    ) {
      console.log(`Current month - no carry forward`);
      return 0;
    }

    // For next month, calculate carry forward from current month's roster data
    if (
      currentMonth === currentSystemMonth + 1 &&
      currentYear === currentSystemYear
    ) {
      // Calculate current month's balance from roster data
      const currentMonthOC = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                entry.status === "OC" &&
                new Date(entry.date).getMonth() + 1 === currentSystemMonth &&
                new Date(entry.date).getFullYear() === currentSystemYear
            ).length
          );
        }
        return total;
      }, 0);

      const currentMonthCF = rosterData.reduce((total, member) => {
        if (member.user_id === user.id) {
          return (
            total +
            member.entries.filter(
              (entry) =>
                (entry.status === "CF" || entry.status === "CmO") &&
                new Date(entry.date).getMonth() + 1 === currentSystemMonth &&
                new Date(entry.date).getFullYear() === currentSystemYear
            ).length
          );
        }
        return total;
      }, 0);

      const carryForward = currentMonthOC - currentMonthCF;
      console.log(
        `Next month - carry forward from current month: OC=${currentMonthOC}, CF=${currentMonthCF}, carry forward=${carryForward}`
      );
      return Math.max(0, carryForward);
    }

    // For past months, return 0 (historical data should be read from database)
    if (currentMonth < currentSystemMonth || currentYear < currentSystemYear) {
      console.log(
        `Past month - no carry forward (should be read from database)`
      );
      return 0;
    }

    // For future months beyond next month, return 0
    console.log(`Future month beyond next - no carry forward`);
    return 0;
  };

  // Check if navigation is allowed
  const isNavigationAllowed = (
    targetMonth: number,
    targetYear: number
  ): boolean => {
    const currentDate = new Date();
    const currentSystemMonth = currentDate.getMonth() + 1; // 1-12
    const currentSystemYear = currentDate.getFullYear();

    // Allow current month and next month only
    if (targetYear === currentSystemYear) {
      return (
        targetMonth >= currentSystemMonth &&
        targetMonth <= currentSystemMonth + 1
      );
    } else if (
      targetYear === currentSystemYear + 1 &&
      currentSystemMonth === 12
    ) {
      // Allow January of next year if current month is December
      return targetMonth === 1;
    }

    return false;
  };

  // Check if month is in the past (read-only)
  const isPastMonth = (month: number, year: number): boolean => {
    const currentDate = new Date();
    const currentSystemMonth = currentDate.getMonth() + 1;
    const currentSystemYear = currentDate.getFullYear();

    return (
      year < currentSystemYear ||
      (year === currentSystemYear && month < currentSystemMonth)
    );
  };

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

  // Effect for on-call profile
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    // Find on-call user from roster data
    let ocUserId: string | null = null;
    for (const member of rosterData) {
      if (Array.isArray(member.entries)) {
        for (const entry of member.entries) {
          if (
            entry.status === "OC" &&
            entry.date >= startOfWeek.toISOString().split("T")[0] &&
            entry.date <= endOfWeek.toISOString().split("T")[0]
          ) {
            ocUserId = member.user_id;
            break;
          }
        }
      }
      if (ocUserId) break;
    }

    // Fetch on-call user profile
    if (ocUserId) {
      supabase
        .from("user_profiles")
        .select("username, email, phone")
        .eq("user_id", ocUserId)
        .single()
        .then(({ data }) => setOnCallProfile(data));
    } else {
      setOnCallProfile(null);
    }
  }, [rosterData]);

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

  // Helper to calculate comp-off balance for a given month/year from local rosterData
  const getCompOffBalanceForMonth = (month: number, year: number): number => {
    if (!user) return 0;
    const oc = rosterData.reduce((total, member) => {
      if (member.user_id === user.id) {
        return (
          total +
          member.entries.filter(
            (entry) =>
              entry.status === "OC" &&
              new Date(entry.date).getMonth() + 1 === month &&
              new Date(entry.date).getFullYear() === year
          ).length
        );
      }
      return total;
    }, 0);
    const cf = rosterData.reduce((total, member) => {
      if (member.user_id === user.id) {
        return (
          total +
          member.entries.filter(
            (entry) =>
              (entry.status === "CF" || entry.status === "CmO") &&
              new Date(entry.date).getMonth() + 1 === month &&
              new Date(entry.date).getFullYear() === year
          ).length
        );
      }
      return total;
    }, 0);
    return Math.max(0, oc - cf);
  };

  // Navigation handler
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentYear, currentMonth - 1);
    if (direction === "next") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    const newMonth = newDate.getMonth() + 1;
    const newYear = newDate.getFullYear();

    // Only allow forward navigation to next month
    if (direction === "next") {
      // Calculate current month's comp-off balance as carry forward for next month
      const cf = getCompOffBalanceForMonth(currentMonth, currentYear);
      setNextMonthCarryForward(cf);
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Calculate the comp-off balance to display in the card
  const getDisplayCompOffBalance = (): number => {
    // If on next month, use carry forward from previous month + this month's OC - CF
    const currentDate = new Date();
    const systemMonth = currentDate.getMonth() + 1;
    const systemYear = currentDate.getFullYear();
    if (currentMonth === systemMonth + 1 && currentYear === systemYear) {
      // Next month: use nextMonthCarryForward + this month's OC - CF
      const thisMonthOC =
        getCompOffBalanceForMonth(currentMonth, currentYear) +
        (getCompOffBalanceForMonth(currentMonth, currentYear) < 0 ? 0 : 0); // always non-negative
      return nextMonthCarryForward + thisMonthOC;
    }
    // For current month or any other, just show that month's balance
    return getCompOffBalanceForMonth(currentMonth, currentYear);
  };

  // Helper to calculate upcoming leaves count from leave_requests table
  const getUpcomingLeavesCount = (): number => {
    return upcomingLeavesCount;
  };

  // Function to refresh upcoming leaves count
  const refreshUpcomingLeavesCount = async () => {
    if (!user) return;

    try {
      const count = await organizationService.getUpcomingLeavesCount(user.id);
      console.log("Upcoming leaves count for user:", user.id, "Count:", count);
      setUpcomingLeavesCount(count);
    } catch (error) {
      console.error("Error refreshing upcoming leaves count:", error);
    }
  };

  // Function to refresh applied leaves count
  const refreshAppliedLeavesCount = async () => {
    if (!user || !selectedTeam || selectedTeam.id === "no-team") return;

    try {
      console.log("Refreshing applied leaves count for:", {
        userId: user.id,
        teamId: selectedTeam.id,
        month: currentMonth,
        year: currentYear,
        userRole: userRole,
      });

      let count = 0;

      if (userRole === "admin") {
        // For admin: get all team members' applied leaves
        const allTeamLeaves = await organizationService.getAllTeamAppliedLeaves(
          selectedTeam.id
        );
        // Filter for current month
        const currentMonthLeaves = allTeamLeaves.filter((leave) => {
          const leaveDate = new Date(leave.date);
          return (
            leaveDate.getMonth() + 1 === currentMonth &&
            leaveDate.getFullYear() === currentYear
          );
        });
        count = currentMonthLeaves.length;
      } else {
        // For member: get only current user's applied leaves
        count = await organizationService.getAppliedLeavesCount(
          user.id,
          selectedTeam.id,
          currentYear,
          currentMonth
        );
      }

      console.log(
        "Applied leaves count for user:",
        user.id,
        "Team:",
        selectedTeam.id,
        "Month:",
        currentMonth,
        "Year:",
        currentYear,
        "Role:",
        userRole,
        "Count:",
        count
      );
      setAppliedLeavesCount(count);
    } catch (error) {
      console.error("Error refreshing applied leaves count:", error);
    }
  };

  // Load upcoming leaves count on component mount
  useEffect(() => {
    if (user) {
      refreshUpcomingLeavesCount();
    }
  }, [user]);

  // Load applied leaves count when team or month changes
  useEffect(() => {
    if (user && selectedTeam && selectedTeam.id !== "no-team") {
      refreshAppliedLeavesCount();
    }
  }, [user, selectedTeam, currentMonth, currentYear]);

  // Helper to calculate applied leaves count from roster data
  const getAppliedLeavesCount = (): number => {
    console.log(
      "getAppliedLeavesCount called, current state value:",
      appliedLeavesCount
    );
    return appliedLeavesCount;
  };

  // Update comp-off balance card instantly on any roster change
  useEffect(() => {
    setLocalCompOffBalance(getDisplayCompOffBalance());
    // Also refresh applied leaves count when roster data changes
    refreshAppliedLeavesCount();
  }, [rosterData, currentMonth, currentYear, nextMonthCarryForward]);

  // Recalculate balance when roster data changes (for immediate updates)
  useEffect(() => {
    if (user && selectedTeam && selectedTeam.id !== "no-team") {
      // Small delay to ensure roster data is updated
      const timer = setTimeout(() => {
        const totalBalance = calculateTotalBalance();
        setLocalCompOffBalance(totalBalance);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [rosterData]);

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

  // Function to get static images for organization and project
  const getOrganizationImage = (): string => {
    return "/dashboard/company.png";
  };

  const getProjectImage = (): string => {
    return "/dashboard/project1.png";
  };

  if (showOnboarding) {
    return <OnboardingPage />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orgData) {
    return null; // This will show the simple dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Info Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
          <div className="flex items-center justify-between">
            {/* Left Side - Organization Info */}
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <img
                  src={getOrganizationImage()}
                  alt={`${orgData.organization.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to company.png if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = "/dashboard/company.png";
                  }}
                />
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
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={getOrganizationImage()}
                  alt={`${orgData.organization.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to company.png if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = "/dashboard/company.png";
                  }}
                />
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
              <div className="w-24 h-24  overflow-hidden">
                <img
                  src={getProjectImage()}
                  alt={`${orgData.project.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to project.png if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = "/dashboard/project1.png";
                  }}
                />
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
        {(() => {
          // Get current on-call date
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          // Find current on-call date from roster
          let ocDate: string | null = null;
          for (const member of rosterData) {
            if (Array.isArray(member.entries)) {
              for (const entry of member.entries) {
                if (
                  entry.status === "OC" &&
                  entry.date >= startOfWeek.toISOString().split("T")[0] &&
                  entry.date <= endOfWeek.toISOString().split("T")[0]
                ) {
                  ocDate = entry.date;
                  break;
                }
              }
            }
            if (ocDate) break;
          }

          return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 mb-8 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {onCallProfile?.username
                        ? onCallProfile.username
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
                      {onCallProfile?.username || "Not assigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">On Call time</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {/* {ocDate ? new Date(ocDate).toLocaleDateString() : "--"} */}
                      24 Hours
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Contact</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {onCallProfile?.phone || "--"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {onCallProfile?.email || "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        {/* Update all four cards to have consistent, compact design */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
              <CardTitle className="text-xs font-medium">Team Size</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-2">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {teamSize}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Active Members
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
              <CardTitle className="text-xs font-medium">
                Leaves Applied
              </CardTitle>
              <CalendarDays className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-2">
              <div className="space-y-1">
                <div
                  className={`text-2xl font-bold ${
                    getAppliedLeavesCount() > 4
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {getAppliedLeavesCount()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    This Month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
              <CardTitle className="text-xs font-medium">
                Upcoming Leaves
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpcomingLeave(true)}
                className="ml-2 h-5 w-20 p-0"
              >
                <span className="text-xs">+ Add Leave</span>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-2">
              <div className="space-y-1">
                <div
                  className={`text-2xl font-bold ${
                    getUpcomingLeavesCount() > 4
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {getUpcomingLeavesCount()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Approved Leaves
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
              <CardTitle className="text-xs font-medium">
                Comp-off Balance
              </CardTitle>
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-2">
              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <div
                    className={`text-2xl font-bold ${
                      getDisplayCompOffBalance() > 4
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {getDisplayCompOffBalance()}
                  </div>
                  {nextMonthCarryForward > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      (+{nextMonthCarryForward} carried forward)
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Available Days
                  </p>
                </div>
              </div>
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
          loadRosterData={handleRosterDataChange}
          onCompOffBalanceChange={setLocalCompOffBalance}
          onRosterEntryChange={handleRosterEntryChange}
          carryForwardBalance={carryForwardBalance}
          isNavigationAllowed={isNavigationAllowed}
          isPastMonth={isPastMonth}
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
        onClose={() => {
          setShowUpcomingLeave(false);
          // Refresh upcoming leaves count when modal is closed
          refreshUpcomingLeavesCount();
        }}
      />
      <Toaster />
    </div>
  );
};
