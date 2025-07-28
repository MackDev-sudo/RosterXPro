import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Clock, 
  Users, 
  RotateCcw, 
  Shield, 
  Calendar,
  Info
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface ShiftTime {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface WeekOff {
  start: number; // 0-6 (Sunday-Saturday)
  end: number;   // 0-6 (Sunday-Saturday)
}

interface RosterRules {
  // Basic Configuration
  numberOfShifts: number;
  shiftTimings: ShiftTime[];
  weekOff: WeekOff;
  
  // Staffing Requirements
  minMembersPerShift: number;
  maxMembersPerShift: number;
  
  // On-Call Configuration
  onCallType: "dedicated" | "rotational" | "none";
  onCallMinMembers: number;
  onCallMaxMembers: number;
  
  // Rotation Settings
  rotationCycle: "weekly" | "monthly" | "quarterly" | "custom";
  customRotationDays: number;
  
  // Advanced Settings
  consecutiveShiftLimit: number;
  minRestHoursBetweenShifts: number;
  weekendCoverage: "required" | "optional" | "none";
  holidayCoverage: "required" | "optional" | "none";
  
  // Fairness & Distribution
  enforceEqualDistribution: boolean;
  prioritizeExperience: boolean;
  allowSelfSelection: boolean;
  
  // Notification Settings
  advanceNotificationDays: number;
  allowShiftSwapping: boolean;
  requireApprovalForSwaps: boolean;
}

interface TeamMember {
id: string; // user_id
profileId: string; // user_profiles.id
name: string;
}

interface CreateRulesProps {
  onSave: (rules: RosterRules) => void;
  existingRules?: Partial<RosterRules>;
  trigger?: React.ReactNode;
}

const CreateRules: React.FC<CreateRulesProps> = ({ 
  onSave, 
  existingRules, 
  trigger
}) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // Fetch the logged-in user's team and its members, including user_profiles.id
  useEffect(() => {
    async function fetchTeamMembers() {
      if (!user?.id) return;
      // 1. Find the team where the user is a member or admin
      const { data: teamMemberRows, error: tmErr } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .limit(1);
      if (tmErr || !teamMemberRows || teamMemberRows.length === 0) return;
      const teamId = teamMemberRows[0].team_id;
      // 2. Get all team members for that team, join with user_profiles for name and id
      const { data: members, error: memErr } = await supabase
        .from('team_members')
        .select('user_id, user_profiles(id, username)')
        .eq('team_id', teamId);
      if (memErr || !members) return;
      setTeamMembers(
        members.map((m: any) => ({
          id: m.user_id, // user_id
          profileId: m.user_profiles?.id, // user_profiles.id
          name: m.user_profiles?.username || 'Unknown',
        }))
      );
    }
    fetchTeamMembers();
  }, [user?.id]);
  const [dedicatedOnCallMember, setDedicatedOnCallMember] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const defaultShifts: ShiftTime[] = [
    { id: "1", name: "Morning", startTime: "06:00", endTime: "14:00", isActive: true },
    { id: "2", name: "Noon", startTime: "14:00", endTime: "18:00", isActive: true },
    { id: "3", name: "Evening", startTime: "18:00", endTime: "22:00", isActive: true },
    { id: "4", name: "Night", startTime: "22:00", endTime: "06:00", isActive: true },
    { id: "5", name: "On-Call", startTime: "00:00", endTime: "23:59", isActive: true },
  ];
  const [rules, setRules] = useState<RosterRules>({
    numberOfShifts: existingRules?.numberOfShifts || 3,
    shiftTimings: existingRules?.shiftTimings || defaultShifts,
    weekOff: existingRules?.weekOff || { start: 6, end: 0 }, // Default: Saturday-Sunday
    minMembersPerShift: existingRules?.minMembersPerShift || 2,
    maxMembersPerShift: existingRules?.maxMembersPerShift || 5,
    onCallType: existingRules?.onCallType || "rotational",
    onCallMinMembers: existingRules?.onCallMinMembers || 1,
    onCallMaxMembers: existingRules?.onCallMaxMembers || 2,
    rotationCycle: existingRules?.rotationCycle || "weekly",
    customRotationDays: existingRules?.customRotationDays || 7,
    consecutiveShiftLimit: existingRules?.consecutiveShiftLimit || 3,
    minRestHoursBetweenShifts: existingRules?.minRestHoursBetweenShifts || 8,
    weekendCoverage: existingRules?.weekendCoverage || "required",
    holidayCoverage: existingRules?.holidayCoverage || "required",
    enforceEqualDistribution: existingRules?.enforceEqualDistribution ?? true,
    prioritizeExperience: existingRules?.prioritizeExperience ?? false,
    allowSelfSelection: existingRules?.allowSelfSelection ?? true,
    advanceNotificationDays: existingRules?.advanceNotificationDays || 7,
    allowShiftSwapping: existingRules?.allowShiftSwapping ?? true,
    requireApprovalForSwaps: existingRules?.requireApprovalForSwaps ?? true,
  });

  // Always set min/max to 1 for dedicated
  React.useEffect(() => {
    if (rules.onCallType === "dedicated") {
      if (rules.onCallMinMembers !== 1) updateRules("onCallMinMembers", 1);
      if (rules.onCallMaxMembers !== 1) updateRules("onCallMaxMembers", 1);
    }
  }, [rules.onCallType]);

  const updateRules = (field: keyof RosterRules, value: any) => {
    setRules(prev => ({ ...prev, [field]: value }));
  };

  const updateShiftTiming = (id: string, field: keyof ShiftTime, value: any) => {
    const updatedShifts = rules.shiftTimings.map(shift =>
      shift.id === id ? { ...shift, [field]: value } : shift
    );
    updateRules("shiftTimings", updatedShifts);
  };

  const handleSave = () => {
    // Save to Supabase roster_rules table
    async function saveRosterRules() {
      if (!user?.id || teamMembers.length === 0) {
        onSave({ ...rules });
        setOpen(false);
        return;
      }
      // Find the team_id for the logged-in user
      const { data: teamMemberRows, error: tmErr } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .limit(1);
      if (tmErr || !teamMemberRows || teamMemberRows.length === 0) {
        onSave({ ...rules });
        setOpen(false);
        return;
      }
      const teamId = teamMemberRows[0].team_id;

      // Find user_profiles.id for current user
      const { data: profileRows, error: profileErr } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      if (profileErr || !profileRows || profileRows.length === 0) {
        // Optionally show error toast
        console.error('Could not find user profile for current user.');
        setOpen(false);
        return;
      }
      const createdById = profileRows[0].id;

      // Always use the actual number of shifts from shiftTimings
      const payload = {
        team_id: teamId,
        number_of_shifts: rules.shiftTimings.filter(s => s.isActive).length,
        shift_timings: JSON.stringify(rules.shiftTimings),
        week_off: JSON.stringify(rules.weekOff),
        min_members_per_shift: rules.minMembersPerShift,
        max_members_per_shift: rules.maxMembersPerShift,
        on_call_type: rules.onCallType,
        // Save the name instead of profileId for dedicated_on_call_member
        dedicated_on_call_member: rules.onCallType === 'dedicated'
          ? (teamMembers.find(m => m.id === dedicatedOnCallMember)?.name || null)
          : null,
        rotation_cycle: rules.rotationCycle,
        custom_rotation_days: rules.rotationCycle === 'custom' ? rules.customRotationDays : null,
        consecutive_shift_limit: rules.consecutiveShiftLimit,
        min_rest_hours_between_shifts: rules.minRestHoursBetweenShifts,
        weekend_coverage: rules.weekendCoverage,
        holiday_coverage: rules.holidayCoverage,
        enforce_equal_distribution: rules.enforceEqualDistribution,
        prioritize_experience: rules.prioritizeExperience,
        allow_self_selection: rules.allowSelfSelection,
        advance_notification_days: rules.advanceNotificationDays,
        allow_shift_swapping: rules.allowShiftSwapping,
        require_approval_for_swaps: rules.requireApprovalForSwaps,
        created_by: createdById,
      };
      const { error: insertError } = await supabase
        .from('roster_rules')
        .insert([payload]);
      if (insertError) {
        // Optionally show error toast
        console.error('Error saving roster rules:', insertError.message);
      } else {
        onSave({ ...rules });
      }
      setOpen(false);
    }
    saveRosterRules();
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Configure Roster Rules
    </Button>
  );

  // Track active tab to reset summary/finalized state if user navigates away
  const [activeTab, setActiveTab] = useState("basic");

  // Reset summary/finalized if user leaves summary tab without saving
  React.useEffect(() => {
    if (activeTab !== "summary" && (showSummary || finalized)) {
      setShowSummary(false);
      setFinalized(false);
    }
  }, [activeTab]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Roster Generation Rules
          </DialogTitle>
          <DialogDescription>
            Configure the rules and parameters for automatic roster generation. 
            These settings will determine how shifts are assigned and distributed among team members.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Setup</TabsTrigger>
            <TabsTrigger value="shifts">Shift Management</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Rules</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Staffing Requirements
                </CardTitle>
                <CardDescription>
                  Define the minimum and maximum number of team members for each shift
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minMembers">Minimum Members per Shift</Label>
                    <Input
                      id="minMembers"
                      type="number"
                      min="1"
                      value={rules.minMembersPerShift}
                      onChange={(e) => updateRules("minMembersPerShift", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Maximum Members per Shift</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min="1"
                      value={rules.maxMembersPerShift}
                      onChange={(e) => updateRules("maxMembersPerShift", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  On-Call Configuration
                </CardTitle>
                <CardDescription>
                  Configure on-call responsibilities and rotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="onCallType">On-Call Type</Label>
                  <Select 
                    value={rules.onCallType} 
                    onValueChange={(value: "dedicated" | "rotational" | "none") => 
                      updateRules("onCallType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select on-call type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dedicated">Dedicated On-Call Team</SelectItem>
                      <SelectItem value="rotational">Rotational On-Call</SelectItem>
                      <SelectItem value="none">No On-Call Coverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {rules.onCallType === "dedicated" && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="dedicatedOnCallMember">Select Dedicated On-Call Member</Label>
                    <Select
                      value={dedicatedOnCallMember}
                      onValueChange={setDedicatedOnCallMember}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers && teamMembers.length > 0 &&
                          teamMembers.map((member) => (
                            <SelectItem key={member.profileId} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Rotation Cycle
                </CardTitle>
                <CardDescription>
                  Define how frequently shift assignments rotate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rotationCycle">Rotation Frequency</Label>
                  <Select 
                    value={rules.rotationCycle} 
                    onValueChange={(value: "weekly" | "monthly" | "quarterly" | "custom") => 
                      updateRules("rotationCycle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rotation cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly Rotation</SelectItem>
                      <SelectItem value="monthly">Monthly Rotation</SelectItem>
                      <SelectItem value="quarterly">Quarterly Rotation</SelectItem>
                      <SelectItem value="custom">Custom Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {rules.rotationCycle === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="customDays">Custom Rotation (Days)</Label>
                    <Input
                      id="customDays"
                      type="number"
                      min="1"
                      value={rules.customRotationDays}
                      onChange={(e) => updateRules("customRotationDays", parseInt(e.target.value))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Shift Timings Configuration
                </CardTitle>
                <CardDescription>
                  Update your shift schedules and working hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Week-off Configuration</CardTitle>
                    <CardDescription>
                      Select two consecutive days for weekly offs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Day</Label>
                          <Select
                            value={String(rules.weekOff.start)}
                            onValueChange={(value) => {
                              const startDay = parseInt(value);
                              const endDay = (startDay + 1) % 7;
                              updateRules("weekOff", { start: startDay, end: endDay });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select start day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Sunday</SelectItem>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>End Day (Auto-selected)</Label>
                          <Input
                            disabled
                            value={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rules.weekOff.end]}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Week-off will be {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rules.weekOff.start]}-
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rules.weekOff.end]}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Total Shifts: {rules.shiftTimings.length}</p>
                    <p className="text-xs text-muted-foreground">
                      Update each shift's timing and status
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  {rules.shiftTimings.map((shift) => (
                    <div key={shift.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{shift.name}</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`start-time-${shift.id}`}>Start Time</Label>
                          <Input
                            id={`start-time-${shift.id}`}
                            type="time"
                            value={shift.startTime}
                            onChange={(e) => updateShiftTiming(shift.id, "startTime", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`end-time-${shift.id}`}>End Time</Label>
                          <Input
                            id={`end-time-${shift.id}`}
                            type="time"
                            value={shift.endTime}
                            onChange={(e) => updateShiftTiming(shift.id, "endTime", e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                          <input
                            id={`active-${shift.id}`}
                            type="checkbox"
                            checked={shift.isActive}
                            onChange={(e) => updateShiftTiming(shift.id, "isActive", e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor={`active-${shift.id}`}>Active</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work-Life Balance</CardTitle>
                <CardDescription>
                  Configure rules to ensure fair distribution and adequate rest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consecutiveLimit">Max Consecutive Shifts</Label>
                    <Input
                      id="consecutiveLimit"
                      type="number"
                      min="1"
                      max="10"
                      value={rules.consecutiveShiftLimit}
                      onChange={(e) => updateRules("consecutiveShiftLimit", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restHours">Min Rest Hours Between Shifts</Label>
                    <Input
                      id="restHours"
                      type="number"
                      min="0"
                      max="24"
                      value={rules.minRestHoursBetweenShifts}
                      onChange={(e) => updateRules("minRestHoursBetweenShifts", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Requirements</CardTitle>
                <CardDescription>
                  Define coverage requirements for weekends and holidays
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekendCoverage">Weekend Coverage</Label>
                    <Select 
                      value={rules.weekendCoverage} 
                      onValueChange={(value: "required" | "optional" | "none") => 
                        updateRules("weekendCoverage", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="none">No Coverage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="holidayCoverage">Holiday Coverage</Label>
                    <Select 
                      value={rules.holidayCoverage} 
                      onValueChange={(value: "required" | "optional" | "none") => 
                        updateRules("holidayCoverage", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="none">No Coverage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution & Fairness</CardTitle>
                <CardDescription>
                  Configure how shifts are distributed among team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      id="equalDistribution"
                      type="checkbox"
                      checked={rules.enforceEqualDistribution}
                      onChange={(e) => updateRules("enforceEqualDistribution", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="equalDistribution">Enforce Equal Distribution</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="prioritizeExperience"
                      type="checkbox"
                      checked={rules.prioritizeExperience}
                      onChange={(e) => updateRules("prioritizeExperience", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="prioritizeExperience">Prioritize Experience Level</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="allowSelfSelection"
                      type="checkbox"
                      checked={rules.allowSelfSelection}
                      onChange={(e) => updateRules("allowSelfSelection", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="allowSelfSelection">Allow Self-Selection</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how and when team members are notified about schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="advanceNotification">Advance Notification (Days)</Label>
                  <Input
                    id="advanceNotification"
                    type="number"
                    min="1"
                    max="30"
                    value={rules.advanceNotificationDays}
                    onChange={(e) => updateRules("advanceNotificationDays", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days in advance to notify team members of their schedule
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shift Management</CardTitle>
                <CardDescription>
                  Configure shift swapping and change management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      id="allowSwapping"
                      type="checkbox"
                      checked={rules.allowShiftSwapping}
                      onChange={(e) => updateRules("allowShiftSwapping", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="allowSwapping">Allow Shift Swapping</Label>
                  </div>
                  {rules.allowShiftSwapping && (
                    <div className="flex items-center space-x-2 ml-6">
                      <input
                        id="requireApproval"
                        type="checkbox"
                        checked={rules.requireApprovalForSwaps}
                        onChange={(e) => updateRules("requireApprovalForSwaps", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="requireApproval">Require Manager Approval</Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Review & Finalize
                </CardTitle>
                <CardDescription>
                  Review all your roster rules and finalize before saving.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showSummary ? (
                  <Button onClick={() => { setShowSummary(true); setFinalized(true); }}>
                    Finalize
                  </Button>
                ) : (
                  <div className="text-sm space-y-2">
                    <p><strong>Week-offs:</strong> {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rules.weekOff.start]}-{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rules.weekOff.end]}</p>
                    <p><strong>Shifts:</strong> {rules.shiftTimings.filter(s => s.isActive).length} active shifts configured</p>
                    <ul className="ml-4 list-disc">
                      {rules.shiftTimings.filter(s => s.isActive).map((s) => (
                        <li key={s.id}>{s.name}: {s.startTime} - {s.endTime}</li>
                      ))}
                    </ul>
                    <p><strong>Staffing:</strong> {rules.minMembersPerShift}-{rules.maxMembersPerShift} members per shift</p>
                    <p><strong>On-Call:</strong> {
                      rules.onCallType === "none"
                        ? "No on-call"
                        : rules.onCallType === "dedicated"
                          ? `Dedicated (${dedicatedOnCallMember ? teamMembers.find(m => m.id === dedicatedOnCallMember)?.name || 'N/A' : 'N/A'})`
                          : 'Rotational'
                    }</p>
                    <p><strong>Rotation:</strong> {rules.rotationCycle === "custom" ? `Every ${rules.customRotationDays} days` : rules.rotationCycle}</p>
                    <p><strong>Rest Hours:</strong> {rules.minRestHoursBetweenShifts} hours</p>
                    <p><strong>Weekend Coverage:</strong> {rules.weekendCoverage}</p>
                    <p><strong>Holiday Coverage:</strong> {rules.holidayCoverage}</p>
                    <p><strong>Notification:</strong> {rules.advanceNotificationDays} days advance notice</p>
                    <p><strong>Shift Swapping:</strong> {rules.allowShiftSwapping ? 'Allowed' : 'Not Allowed'}{rules.allowShiftSwapping && rules.requireApprovalForSwaps ? ' (Manager Approval Required)' : ''}</p>
                    <p><strong>Distribution:</strong> {
                      [
                        rules.enforceEqualDistribution ? 'Equal' : 'Flexible',
                        rules.prioritizeExperience ? 'Prioritize Experience' : null,
                        rules.allowSelfSelection ? 'Self-Selection Allowed' : null
                      ].filter(Boolean).join(', ')
                    }</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!finalized}>
            Save Rules
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRules;
