import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  RotateCcw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from "@/components/ui/select";
import { useAuth } from "../hooks/useAuth";
import { organizationService } from "../lib/organizationService";
import { useState, useEffect } from "react";
import UpcommingLeaves from "./UpcommingLeaves";
import CreateRules from "./CreateRules";
import LeaveTracker from "./LeaveTracker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../lib/supabase";

interface UserCompOffBalance {
  user_id: string;
  balance: number;
}

/* // RosterTable subcomponent (copied from OrganizationDashboard)
const shiftOptions = [
  { label: "Morning (S1)", value: "S1" },
  { label: "Noon (S2)", value: "S2" },
  { label: "Night (S3)", value: "S3" },
  { label: "Hybrid (PS)", value: "PS" },
  { label: "On-Call (OC)", value: "OC" },
];
const leaveOptions = [
  { label: "Planned Leave (PL)", value: "PL" },
  { label: "Emergency Leave (EL)", value: "EL" },
  { label: "Sick Leave (SL)", value: "SL" },
  { label: "Comp-Off (CmO)", value: "CmO" },
]; */

const shiftMap: {
  [key: string]: {
    label: string;
    timing: string;
    bgColor: string;
    textColor: string;
  };
} = {
  S1: {
    label: "Sunrise Shift",
    timing: "6:00 AM - 2:00 PM",
    bgColor: "bg-[#FFD700]",
    textColor: "text-black",
  },
  S2: {
    label: "Midday Shift",
    timing: "2:00 PM - 11:00 PM",
    bgColor: "bg-[#FFA500]",
    textColor: "text-black",
  },
  S3: {
    label: "Moonlight Shift",
    timing: "10:00 PM - 7:00 AM",
    bgColor: "bg-[#1E90FF]",
    textColor: "text-white",
  },
  HS: {
    label: "Swing Shift",
    timing: "6:00 PM - 3:00 PM",
    bgColor: "bg-[#800080]",
    textColor: "text-white",
  },
  OC: {
    label: "On-Call",
    timing: "",
    bgColor: "bg-[#A9A9A9]",
    textColor: "text-white",
  },
  WO: {
    label: "Week-Offs",
    timing: "NIL",
    bgColor: "bg-[#C21E56]",
    textColor: "text-white",
  },
};
const leaveMap: {
  [key: string]: { label: string; bgColor: string; textColor: string };
} = {
  PL: { label: "Paid Leave", bgColor: "bg-[#32CD32]", textColor: "text-white" },
  SL: { label: "Sick Leave", bgColor: "bg-[#FF6347]", textColor: "text-white" },
  EL: {
    label: "Emergency Leave",
    bgColor: "bg-[#FF8C00]",
    textColor: "text-white",
  },
  CF: { label: "Comp-off", bgColor: "bg-[#20B2AA]", textColor: "text-white" },
  PtL: {
    label: "Paternity Leave",
    bgColor: "bg-[#8B4513]",
    textColor: "text-white",
  },
  ML: {
    label: "Maternity Leave",
    bgColor: "bg-[#DDA0DD]",
    textColor: "text-black",
  },
  CL: { label: "Care Leave", bgColor: "bg-[#D3D3D3]", textColor: "text-black" },
};

const RosterTable: React.FC<{
  rosterData: any[];
  currentMonth: number;
  currentYear: number;
  selectedTeam: any;
  handleSelect: (userId: string, date: string, value: string) => void;
  pendingRoster: {
    [key: string]: { userId: string; date: string; value: string };
  };
  onCompOffBalanceChange?: (balance: number) => void;
  onRosterEntryChange?: () => void;
  carryForwardBalance?: number;
  monthNames?: string[];
  isPastMonth?: (month: number, year: number) => boolean;
  userRole?: string | null;
  getCompOffBalanceForUser?: (userId: string) => number;
}> = ({
  rosterData,
  currentMonth,
  currentYear,
  selectedTeam,
  handleSelect,
  pendingRoster,
  onCompOffBalanceChange,
  onRosterEntryChange,
  carryForwardBalance = 0,
  monthNames = [],
  isPastMonth,
  userRole,
  getCompOffBalanceForUser,
}) => {
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Local state for roster data to update UI immediately
  const [localRoster, setLocalRoster] = React.useState<any[]>(rosterData);

  React.useEffect(() => {
    setLocalRoster(rosterData);
  }, [rosterData]);

  const { user } = useAuth();
  const { toast } = useToast();

  // Update local state and call backend (placeholder)
  const handleSelectForTable = (
    userId: string,
    date: string,
    value: string
  ) => {
    // Validate comp-off selection
    if (value === "CF") {
      // Calculate current balance to check if user can apply CF
      const currentUserMember = localRoster.find(
        (member) => member.user_id === userId
      );
      if (currentUserMember) {
        const currentMonthOC = currentUserMember.entries.filter(
          (entry: any) =>
            entry.status === "OC" &&
            entry.date.startsWith(
              `${currentYear}-${String(currentMonth).padStart(2, "0")}`
            )
        ).length;

        const currentMonthCF = currentUserMember.entries.filter(
          (entry: any) =>
            (entry.status === "CF" || entry.status === "CmO") &&
            entry.date.startsWith(
              `${currentYear}-${String(currentMonth).padStart(2, "0")}`
            )
        ).length;

        const currentMonthBalance = currentMonthOC - currentMonthCF;
        const totalBalance = carryForwardBalance + currentMonthBalance;

        if (totalBalance <= 0) {
          // Show warning toast and prevent selection
          toast({
            variant: "destructive",
            title: "Insufficient Comp-off Balance",
            description:
              "You cannot apply comp-off when your balance is 0 or less.",
          });
          return;
        }
      }
    }

    setLocalRoster((prev) =>
      prev.map((member) => {
        if (member.user_id !== userId) return member;
        const entries = Array.isArray(member.entries)
          ? [...member.entries]
          : [];
        const idx = entries.findIndex((e) => e.date === date);
        if (idx !== -1) {
          entries[idx] = { ...entries[idx], status: value, date };
        } else {
          entries.push({ date, status: value });
        }
        return { ...member, entries };
      })
    );
    // Track pending changes
    handleSelect(userId, date, value);

    // Trigger immediate balance recalculation
    if (onRosterEntryChange) {
      onRosterEntryChange();
    }
  };

  // Note: Comp-off balance calculation is now handled in OrganizationDashboard
  // This useEffect has been removed to prevent conflicts with the centralized calculation

  const getStatusBadge = (status: string) => {
    if (shiftMap[status]) {
      const { bgColor, textColor } = shiftMap[status];
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${bgColor} ${textColor}`}
        >
          {status}
        </span>
      );
    }
    if (leaveMap[status]) {
      const { bgColor, textColor } = leaveMap[status];
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${bgColor} ${textColor}`}
        >
          {status}
        </span>
      );
    }
    if (status === "None" || !status) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-500">
          None
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700">
        {status}
      </span>
    );
  };

  const getEntryForDate = (entries: any[] = [], date: string) => {
    return entries.find((entry) => entry.date === date);
  };

  // Determine the user's team only once from orgData and user
  // const userTeamId = React.useMemo(() => {
  //   if (!orgData?.teams || !user?.id) return undefined;
  //   // Find the team where the user is a member
  //   const userTeam = orgData.teams.find((team: any) =>
  //     team.team_members?.some((member: any) => member.user_id === user.id)
  //   );
  //   return userTeam ? userTeam.id : undefined;
  // }, [orgData?.teams, user?.id]);

  // Prepare teams: user's team first, others sorted alphabetically, order does not change on selection
  // const teams = React.useMemo(() => {
  //   if (!orgData?.teams) return [];
  //   const userTeam = orgData.teams.find((t: any) => t.id === userTeamId);
  //   const others = orgData.teams
  //     .filter((t: any) => t.id !== userTeamId)
  //     .sort((a: any, b: any) => a.name.localeCompare(b.name));
  //   return userTeam ? [userTeam, ...others] : others;
  // }, [orgData?.teams, userTeamId]);

  // Tabs state: team id or 'leave-tracker'
  // const [activeTab, setActiveTab] = React.useState(
  //   selectedTeam?.id || (teams[0] && teams[0].id) || ""
  // );
  // React.useEffect(() => {
  //   setActiveTab(selectedTeam?.id || (teams[0] && teams[0].id) || "");
  // }, [selectedTeam, teams]);

  // const handleTabChange = (tabId: string) => {
  //   setActiveTab(tabId);
  //   if (tabId !== "leave-tracker") {
  //     const team = teams.find((t: any) => t.id === tabId);
  //     if (team) onTeamSelect(team);
  //   }
  // };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 sticky left-0 z-10 bg-white">
              Team Member
            </TableHead>
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
          {localRoster.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={days.length + 1}
                className="text-center py-8 text-gray-500"
              >
                No team members found for this team.
              </TableCell>
            </TableRow>
          ) : localRoster.every(
              (member) => !member.entries || member.entries.length === 0
            ) ? (
            <TableRow>
              <TableCell
                colSpan={days.length + 1}
                className="text-center py-8 text-gray-500"
              >
                No roster data available for {monthNames[currentMonth - 1]}{" "}
                {currentYear}.
                {isPastMonth && isPastMonth(currentMonth, currentYear)
                  ? " This is a past month with no data."
                  : " Please generate a roster for this month."}
              </TableCell>
            </TableRow>
          ) : (
            localRoster.map((member) => (
              <TableRow key={member.user_id}>
                <TableCell className="font-medium sticky left-0 z-10 bg-white">
                  <div className="flex items-center space-x-2 group relative">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer">
                      <span className="text-sm font-medium text-blue-600">
                        {member.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Custom Tooltip for member avatar */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap z-10 min-w-[160px]">
                      <div className="space-y-1">
                        <p className="font-semibold">{member.username}</p>
                        {member.email && (
                          <p className="text-gray-300">{member.email}</p>
                        )}
                        {member.phone && (
                          <p className="text-gray-300">{member.phone}</p>
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                    <div>
                      <div className="font-medium truncate max-w-[120px]">
                        {member.username.length > 15
                          ? member.username.substring(0, 15) + "..."
                          : member.username}
                      </div>
                      {userRole === "admin" && getCompOffBalanceForUser && (
                        <div className="text-xs text-blue-600 font-medium">
                          {getCompOffBalanceForUser(member.user_id)} CF
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                {days.map((day) => {
                  const dateStr = `${currentYear}-${currentMonth
                    .toString()
                    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                  const entry = getEntryForDate(member.entries, dateStr);
                  const value = entry?.status || "";
                  // canEdit logic here:
                  const isSelf = user?.id === member.user_id;
                  const isTeamAdmin = selectedTeam?.team_members?.some(
                    (tm: any) => tm.user_id === user?.id && tm.role === "admin"
                  );
                  const canEdit = isSelf || isTeamAdmin;
                  return (
                    <TableCell key={day} className="text-center">
                      {canEdit ? (
                        <Select
                          value={value}
                          onValueChange={(v) =>
                            handleSelectForTable(member.user_id, dateStr, v)
                          }
                        >
                          <SelectTrigger className="w-20 h-8 p-0 bg-transparent border-none shadow-none focus:ring-0 focus:outline-none focus:border-none ring-0 outline-none select-trigger [&>svg]:hidden group">
                            <span className="w-full flex justify-center relative">
                              {getStatusBadge(value || "None")}
                              {/* Tooltip only if value is set and not None */}
                              {value && value !== "None" && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 min-w-[140px] pointer-events-none">
                                  <div>
                                    <span className="font-bold">{value}</span> -{" "}
                                    {shiftMap[value]?.label ||
                                      leaveMap[value]?.label ||
                                      ""}
                                  </div>
                                  {shiftMap[value]?.timing && (
                                    <div>{shiftMap[value].timing}</div>
                                  )}
                                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
                                </span>
                              )}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Shifts</SelectLabel>
                              {Object.entries(shiftMap).map(([code, opt]) => (
                                <SelectItem key={code} value={code}>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`flex items-center justify-center rounded-full w-7 h-7 text-xs font-bold ${opt.bgColor} ${opt.textColor}`}
                                    >
                                      {code}
                                    </span>
                                    <div className="flex flex-col items-start">
                                      <span className="text-sm font-medium">
                                        {opt.label}
                                      </span>
                                      {opt.timing && (
                                        <span className="text-xs text-gray-500">
                                          {opt.timing}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Leaves</SelectLabel>
                              {Object.entries(leaveMap).map(([code, opt]) => {
                                // Check if this is CF and if user has insufficient balance
                                const isCF = code === "CF";
                                let isDisabled = false;

                                if (isCF && member.user_id === user?.id) {
                                  // Calculate current balance for this user
                                  const currentUserMember = localRoster.find(
                                    (m) => m.user_id === member.user_id
                                  );
                                  if (currentUserMember) {
                                    const currentMonthOC =
                                      currentUserMember.entries.filter(
                                        (entry: any) =>
                                          entry.status === "OC" &&
                                          entry.date.startsWith(
                                            `${currentYear}-${String(
                                              currentMonth
                                            ).padStart(2, "0")}`
                                          )
                                      ).length;

                                    const currentMonthCF =
                                      currentUserMember.entries.filter(
                                        (entry: any) =>
                                          (entry.status === "CF" ||
                                            entry.status === "CmO") &&
                                          entry.date.startsWith(
                                            `${currentYear}-${String(
                                              currentMonth
                                            ).padStart(2, "0")}`
                                          )
                                      ).length;

                                    const currentBalance =
                                      currentMonthOC - currentMonthCF;
                                    isDisabled = currentBalance <= 0;
                                  }
                                }

                                return (
                                  <SelectItem
                                    key={code}
                                    value={code}
                                    disabled={isDisabled}
                                    className={
                                      isDisabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`flex items-center justify-center rounded-full w-7 h-7 text-xs font-bold ${opt.bgColor} ${opt.textColor}`}
                                      >
                                        {code}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {opt.label}
                                        {isCF && (
                                          <span className="text-xs text-gray-500 ml-1">
                                            (Balance:{" "}
                                            {(() => {
                                              const currentUserMember =
                                                localRoster.find(
                                                  (m) =>
                                                    m.user_id === member.user_id
                                                );
                                              if (currentUserMember) {
                                                const currentMonthOC =
                                                  currentUserMember.entries.filter(
                                                    (entry: any) =>
                                                      entry.status === "OC" &&
                                                      entry.date.startsWith(
                                                        `${currentYear}-${String(
                                                          currentMonth
                                                        ).padStart(2, "0")}`
                                                      )
                                                  ).length;

                                                const currentMonthCF =
                                                  currentUserMember.entries.filter(
                                                    (entry: any) =>
                                                      (entry.status === "CF" ||
                                                        entry.status ===
                                                          "CmO") &&
                                                      entry.date.startsWith(
                                                        `${currentYear}-${String(
                                                          currentMonth
                                                        ).padStart(2, "0")}`
                                                      )
                                                  ).length;

                                                const currentMonthBalance =
                                                  currentMonthOC -
                                                  currentMonthCF;
                                                return (
                                                  carryForwardBalance +
                                                  currentMonthBalance
                                                );
                                              }
                                              return 0;
                                            })()}
                                            )
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="w-full flex justify-center relative">
                          {getStatusBadge(value || "None")}
                          {value && value !== "None" && (
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 min-w-[140px] pointer-events-none">
                              <div>
                                <span className="font-bold">{value}</span> -{" "}
                                {shiftMap[value]?.label ||
                                  leaveMap[value]?.label ||
                                  ""}
                              </div>
                              {shiftMap[value]?.timing && (
                                <div>{shiftMap[value].timing}</div>
                              )}
                              <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Props for TeamRoster
interface TeamRosterProps {
  orgData: any;
  selectedTeam: any;
  rosterData: any[];
  userRole: string | null;
  currentMonth: number;
  currentYear: number;
  monthNames: string[];
  navigateMonth: (direction: "prev" | "next") => void;
  setShowAddMember: (show: boolean) => void;
  setShowCreateTeam: (show: boolean) => void;
  onTeamSelect: (team: any) => void;
  loadRosterData: () => void;
  onCompOffBalanceChange?: (balance: number) => void;
  onRosterEntryChange?: () => void;
  carryForwardBalance?: number;
  isNavigationAllowed?: (month: number, year: number) => boolean;
  isPastMonth?: (month: number, year: number) => boolean;
}

const TeamRoster: React.FC<TeamRosterProps> = ({
  orgData,
  selectedTeam,
  rosterData,
  userRole,
  currentMonth,
  currentYear,
  monthNames,
  navigateMonth,
  setShowAddMember,
  setShowCreateTeam,
  onTeamSelect,
  loadRosterData,
  onCompOffBalanceChange,
  onRosterEntryChange,
  carryForwardBalance = 0,
  isNavigationAllowed,
  isPastMonth,
}) => {
  const { user } = useAuth();
  // Determine the user's team only once from orgData and user
  const userTeamId = React.useMemo(() => {
    if (!orgData?.teams || !user?.id) return undefined;
    // Find the team where the user is a member
    const userTeam = orgData.teams.find((team: any) =>
      team.team_members?.some((member: any) => member.user_id === user.id)
    );
    return userTeam ? userTeam.id : undefined;
  }, [orgData?.teams, user?.id]);

  // Prepare teams: user's team first, others sorted alphabetically, order does not change on selection
  const teams = React.useMemo(() => {
    if (!orgData?.teams) return [];
    const userTeam = orgData.teams.find((t: any) => t.id === userTeamId);
    const others = orgData.teams
      .filter((t: any) => t.id !== userTeamId)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    return userTeam ? [userTeam, ...others] : others;
  }, [orgData?.teams, userTeamId]);

  // Tabs state: team id or 'leave-tracker'
  const [activeTab, setActiveTab] = React.useState(
    selectedTeam?.id || (teams[0] && teams[0].id) || ""
  );
  React.useEffect(() => {
    setActiveTab(selectedTeam?.id || (teams[0] && teams[0].id) || "");
  }, [selectedTeam, teams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== "leave-tracker") {
      const team = teams.find((t: any) => t.id === tabId);
      if (team) onTeamSelect(team);
    }
  };

  // Local state for roster data to update UI immediately
  const [pendingRoster, setPendingRoster] = useState<{
    [key: string]: { userId: string; date: string; value: string };
  }>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Comp-off balance state for admin users
  const [userCompOffBalances, setUserCompOffBalances] = useState<
    UserCompOffBalance[]
  >([]);

  // Load comp-off balances for all team members when user is admin
  useEffect(() => {
    if (userRole === "admin" && selectedTeam) {
      loadAllTeamCompOffBalances();
    }
  }, [userRole, selectedTeam, currentMonth, currentYear]);

  const loadAllTeamCompOffBalances = async () => {
    try {
      console.log("Loading comp-off balances for admin user...");

      // Get all team members
      const { data: teamMembers, error: teamError } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", selectedTeam.id);

      if (teamError || !teamMembers) {
        console.error(
          "Error fetching team members for comp-off balances:",
          teamError
        );
        return;
      }

      console.log("Team members found:", teamMembers);

      // Calculate comp-off balances locally based on roster data
      const balances: UserCompOffBalance[] = [];

      for (const member of teamMembers) {
        try {
          console.log(
            `Calculating comp-off balance for user ${member.user_id} in team ${selectedTeam.id} for ${currentMonth}/${currentYear}`
          );

          // Calculate comp-off balance locally based on roster data
          const balance = await calculateLocalCompOffBalance(member.user_id);

          console.log(`Balance for user ${member.user_id}: ${balance}`);

          balances.push({
            user_id: member.user_id,
            balance: balance,
          });
        } catch (error) {
          console.error(
            `Error calculating comp-off balance for user ${member.user_id}:`,
            error
          );
          balances.push({
            user_id: member.user_id,
            balance: 0,
          });
        }
      }

      console.log("Final balances array:", balances);
      setUserCompOffBalances(balances);
    } catch (error) {
      console.error("Error loading team comp-off balances:", error);
    }
  };

  // Calculate comp-off balance locally based on roster data
  const calculateLocalCompOffBalance = async (
    userId: string
  ): Promise<number> => {
    try {
      console.log(`Calculating comp-off balance for user ${userId}`);
      console.log(`Current rosterData:`, rosterData);

      // Find the user's roster data
      const userRoster = rosterData.find((member) => member.user_id === userId);
      console.log(`User roster found:`, userRoster);

      if (!userRoster || !userRoster.entries) {
        console.log(
          `No roster data found for user ${userId}, trying database fallback`
        );
        return await calculateFromDatabase(userId);
      }

      console.log(`User entries:`, userRoster.entries);

      // Calculate OC and CF for current month
      let ocCount = 0;
      let cfCount = 0;

      userRoster.entries.forEach((entry: any) => {
        console.log(`Processing entry:`, entry);
        const entryDate = new Date(entry.date);
        const entryMonth = entryDate.getMonth() + 1;
        const entryYear = entryDate.getFullYear();

        console.log(
          `Entry date: ${entry.date}, month: ${entryMonth}, year: ${entryYear}`
        );
        console.log(
          `Current month: ${currentMonth}, current year: ${currentYear}`
        );

        if (entryMonth === currentMonth && entryYear === currentYear) {
          console.log(`Entry is in current month, status: ${entry.status}`);
          // Check both 'status' and 'shift_type' fields
          const status = entry.status || entry.shift_type;
          if (status === "OC") {
            ocCount++;
            console.log(`Found OC, count now: ${ocCount}`);
          } else if (status === "CF") {
            cfCount++;
            console.log(`Found CF, count now: ${cfCount}`);
          }
        }
      });

      const balance = ocCount - cfCount;
      console.log(
        `Final calculation for user ${userId}: OC=${ocCount}, CF=${cfCount}, balance=${balance}`
      );

      // If local calculation returns 0 but we expect some value, try database fallback
      if (balance === 0) {
        console.log(`Local calculation returned 0, trying database fallback`);
        return await calculateFromDatabase(userId);
      }

      return Math.max(0, balance); // Ensure balance is not negative
    } catch (error) {
      console.error(
        `Error in local comp-off calculation for user ${userId}:`,
        error
      );
      return await calculateFromDatabase(userId);
    }
  };

  // Fallback calculation from database
  const calculateFromDatabase = async (userId: string): Promise<number> => {
    try {
      console.log(`Calculating from database for user ${userId}`);

      const startDate = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-01`;
      const endDate = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-31`;

      console.log(`Querying database for dates: ${startDate} to ${endDate}`);

      const { data, error } = await supabase
        .from("roster_entries")
        .select("shift_type, date")
        .eq("user_id", userId)
        .eq("team_id", selectedTeam.id)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) {
        console.error("Database query error:", error);
        return 0;
      }

      console.log(`Database entries found:`, data);

      let ocCount = 0;
      let cfCount = 0;

      data?.forEach((entry: any) => {
        if (entry.shift_type === "OC") {
          ocCount++;
        } else if (entry.shift_type === "CF") {
          cfCount++;
        }
      });

      const balance = ocCount - cfCount;
      console.log(
        `Database calculation for user ${userId}: OC=${ocCount}, CF=${cfCount}, balance=${balance}`
      );
      return Math.max(0, balance);
    } catch (error) {
      console.error(`Error in database calculation for user ${userId}:`, error);
      return 0;
    }
  };

  const getCompOffBalanceForUser = (userId: string): number => {
    const userBalance = userCompOffBalances.find(
      (balance) => balance.user_id === userId
    );
    const balance = userBalance ? userBalance.balance : 0;
    console.log(
      `getCompOffBalanceForUser called for ${userId}, returning: ${balance}`
    );
    return balance;
  };

  const handleSelect = (userId: string, date: string, value: string) => {
    setPendingRoster((prev) => ({
      ...prev,
      [`${userId}_${date}`]: { userId, date, value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const teamId = selectedTeam?.id;
      if (!teamId) return;
      const updates = Object.values(pendingRoster);
      let allOk = true;
      for (const entry of updates) {
        const ok = await organizationService.updateRosterEntry(
          entry.userId,
          teamId,
          entry.date,
          entry.value
        );
        if (!ok) allOk = false;
      }
      setPendingRoster({});
      setSaveStatus(allOk ? "success" : "error");
      if (allOk && typeof loadRosterData === "function") {
        loadRosterData();
      }
    } catch (err) {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const [showUpcomingLeave, setShowUpcomingLeave] = useState(false);
  const [showCreateRules, setShowCreateRules] = useState(false);

  const handleSaveRules = (rules: any) => {
    console.log("Saving rules:", rules);
    // TODO: Implement saving rules to backend
  };

  // Generate Roster logic
  const [generating, setGenerating] = useState(false);
  const handleGenerateRoster = async () => {
    setGenerating(true);
    try {
      // 1. Fetch latest rules, team members, and leaves for selectedTeam
      const teamId = selectedTeam?.id;
      if (!teamId) return;

      // Replace these with actual API calls or context
      const rules = await organizationService.getRosterRules(teamId);
      if (!rules) {
        console.error("No roster rules found for team");
        return;
      }

      // Debug check the rules structure
      console.log("Roster Rules Structure:", JSON.stringify(rules, null, 2));

      // Rules are already normalized in organizationService.getRosterRules
      if (!Array.isArray(rules.shiftTimings)) {
        console.error(
          "Invalid rules format - missing or invalid shiftTimings array"
        );
        return;
      }

      const teamMembers = await organizationService.getTeamMembers(teamId);
      if (!teamMembers || teamMembers.length === 0) {
        console.error("No team members found for team");
        return;
      }

      const leaves = await organizationService.getLeaves(
        teamId,
        currentYear,
        currentMonth
      );
      // Ensure leaves is at least an empty array if no leaves found
      const safeLeaves = leaves || [];

      // 2. Generate roster
      // Import generateRoster
      const { generateRoster } = await import("../../utils/generateRoster");

      // Debug log the inputs
      console.log("Generating roster with:", {
        rules,
        teamMembers,
        leaves: safeLeaves,
        year: currentYear,
        month: currentMonth,
      });

      // Set start and end dates for the current month
      const startDate = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-${lastDay}`;

      const rosterRules = {
        ...rules,
        startDate,
        endDate,
      };

      console.log("Generating roster with dates:", { startDate, endDate });

      const assignments = generateRoster({
        rules: rosterRules,
        members: teamMembers,
        leaves: safeLeaves,
        year: currentYear,
        month: currentMonth,
      });
      // 3. Update roster table in backend
      await organizationService.saveGeneratedRoster(teamId, assignments);
      // 4. Refresh UI
      if (typeof loadRosterData === "function") {
        loadRosterData();
      }
    } catch (err) {
      console.error("Error generating roster:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="w-full flex justify-between overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex gap-2">
                  {teams.map((team: any) => (
                    <TabsTrigger
                      key={team.id}
                      value={team.id}
                      className="capitalize"
                    >
                      {team.name}
                    </TabsTrigger>
                  ))}
                </div>
                <div className="flex-1 flex justify-end">
                  <TabsTrigger value="leave-tracker">Leave Tracker</TabsTrigger>
                </div>
              </TabsList>
              {teams.map((team: any) => (
                <TabsContent key={team.id} value={team.id} className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle>Team Roster</CardTitle>
                      <CardDescription>
                        {!orgData.project
                          ? "You need to be assigned to a project and team to view roster"
                          : `Monthly roster schedule for ${team.name}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      {Object.keys(pendingRoster).length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </Button>
                      )}
                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            disabled={!orgData.project || generating}
                            onClick={handleGenerateRoster}
                          >
                            {generating ? "Generating..." : "Generate Roster"}
                          </Button>

                          <CreateRules
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                disabled={!orgData.project}
                              >
                                Create Rules
                              </Button>
                            }
                            onSave={handleSaveRules}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                            onClick={() => setShowAddMember(true)}
                            disabled={!orgData.project}
                          >
                            Add Member
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            onClick={() => setShowCreateTeam(true)}
                            disabled={!orgData.project}
                          >
                            Create Team
                          </Button>
                        </>
                      )}
                      <div className="flex items-center space-x-2 border-l pl-3 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth("prev")}
                          disabled={
                            !orgData.project ||
                            (isNavigationAllowed &&
                              !isNavigationAllowed(
                                currentMonth - 1,
                                currentYear
                              ))
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                          {monthNames[currentMonth - 1]} {currentYear}
                          {isPastMonth &&
                            isPastMonth(currentMonth, currentYear) && (
                              <span className="block text-xs text-gray-500">
                                (Read Only)
                              </span>
                            )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth("next")}
                          disabled={
                            !orgData.project ||
                            (isNavigationAllowed &&
                              !isNavigationAllowed(
                                currentMonth + 1,
                                currentYear
                              ))
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <RosterTable
                    rosterData={rosterData}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    selectedTeam={team}
                    handleSelect={handleSelect}
                    pendingRoster={pendingRoster}
                    onCompOffBalanceChange={onCompOffBalanceChange}
                    onRosterEntryChange={onRosterEntryChange}
                    carryForwardBalance={carryForwardBalance}
                    monthNames={monthNames}
                    isPastMonth={isPastMonth}
                    userRole={userRole}
                    getCompOffBalanceForUser={getCompOffBalanceForUser}
                  />
                </TabsContent>
              ))}
              <TabsContent value="leave-tracker" className="mt-6">
                <LeaveTracker selectedTeam={selectedTeam} userRole={userRole} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UpcommingLeaves
          open={showUpcomingLeave}
          onClose={() => setShowUpcomingLeave(false)}
        />
      </CardContent>
    </Card>
  );
};

export default TeamRoster;
