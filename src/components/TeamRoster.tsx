import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useState } from "react";
import UpcommingLeaves from "./UpcommingLeaves";

// RosterTable subcomponent (copied from OrganizationDashboard)
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
];

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
}> = ({
  rosterData,
  currentMonth,
  currentYear,
  selectedTeam,
  handleSelect,
  pendingRoster,
}) => {
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Local state for roster data to update UI immediately
  const [localRoster, setLocalRoster] = React.useState<any[]>(rosterData);

  React.useEffect(() => {
    setLocalRoster(rosterData);
  }, [rosterData]);

  // Update local state and call backend (placeholder)
  const handleSelectForTable = (
    userId: string,
    date: string,
    value: string
  ) => {
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
  };

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

  const { user } = useAuth();
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
                      <div className="font-medium">{member.username}</div>
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
                              {Object.entries(leaveMap).map(([code, opt]) => (
                                <SelectItem key={code} value={code}>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`flex items-center justify-center rounded-full w-7 h-7 text-xs font-bold ${opt.bgColor} ${opt.textColor}`}
                                    >
                                      {code}
                                    </span>
                                    <span className="text-sm font-medium">
                                      {opt.label}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        disabled={!orgData.project}
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Generate Roster</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={() => setShowAddMember(true)}
                        disabled={!orgData.project}
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Add Member</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={() => setShowCreateTeam(true)}
                        disabled={!orgData.project}
                      >
                        <Users className="h-4 w-4" />
                        <span>Create Team</span>
                      </Button>
                      <div className="flex items-center space-x-2 border-l pl-3 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth("prev")}
                          disabled={!orgData.project}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                          {monthNames[currentMonth - 1]} {currentYear}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth("next")}
                          disabled={!orgData.project}
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
                  />
                </TabsContent>
              ))}
              <TabsContent value="leave-tracker" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Leave Tracker features coming soon...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UpcommingLeaves open={showUpcomingLeave} onClose={() => setShowUpcomingLeave(false)}
        />
      </CardContent>
    </Card>
  );
};

export default TeamRoster;
