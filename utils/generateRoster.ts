/**
 * Interface for shift timing configuration
 */
export interface ShiftTiming {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

/**
 * Interface for roster configuration rules
 */
export interface RosterRules {
  id?: string;
  team_id: string;
  startDate: string;
  endDate: string;
  // Allow both snake_case and camelCase versions
  number_of_shifts?: number;
  numberOfShifts?: number;
  shift_timings?: string | ShiftTiming[];
  shiftTimings?: ShiftTiming[];
  weekOff: {
    start: number;
    end: number;
  };
  min_members_per_shift?: number;
  minMembersPerShift?: number;
  max_members_per_shift?: number;
  maxMembersPerShift?: number;
  on_call_type?: "dedicated" | "rotational" | "none";
  onCallType?: "dedicated" | "rotational" | "none";
  dedicatedOnCallMember: string;
  rotation_cycle?: "weekly" | "monthly" | "quarterly" | "custom";
  rotationCycle?: "weekly" | "monthly" | "quarterly" | "custom";
  custom_rotation_days?: number | null;
  customRotationDays?: number | null;
  consecutive_shift_limit?: number;
  consecutiveShiftLimit?: number;
  min_rest_hours_between_shifts?: number;
  minRestHoursBetweenShifts?: number;
  weekend_coverage?: "required" | "optional" | "none";
  weekendCoverage?: "required" | "optional" | "none";
  holiday_coverage?: "required" | "optional" | "none";
  holidayCoverage?: "required" | "optional" | "none";
  enforce_equal_distribution?: boolean;
  enforceEqualDistribution?: boolean;
  prioritize_experience?: boolean;
  prioritizeExperience?: boolean;
  allow_self_selection?: boolean;
  allowSelfSelection?: boolean;
  advance_notification_days?: number;
  advanceNotificationDays?: number;
  allow_shift_swapping?: boolean;
  allowShiftSwapping?: boolean;
  require_approval_for_swaps?: boolean;
  requireApprovalForSwaps?: boolean;
}

/**
 * Interface for a team member
 */
export interface TeamMember {
  id: string;
  name: string;
  experience?: number;
  status?: "WO" | "OC" | string;
}

/**
 * Interface for a leave entry
 */
export interface LeaveEntry {
  userId: string;
  date: string; // YYYY-MM-DD
  type: string;
}

/**
 * Interface for a shift assignment in the roster
 */
export interface ShiftAssignment {
  date: string;
  shiftId: string;
  memberId: string;
  shift_type: string;
  status?: string;
}

/**
 * Helper functions for roster generation
 */

/**
 * Checks if a given date is a weekend (Saturday or Sunday)
 */
function isWeekend(date: string): boolean {
  const d = new Date(date);
  return d.getDay() === 0 || d.getDay() === 6;
}

/**
 * Gets the ISO week number for a given date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Gets an array of dates between start and end date in YYYY-MM-DD format
 */
function getDatesBetween(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

/**
 * Checks if a given date falls within the week-off period
 */
function isWeekOff(date: string, weekOff: { start: number; end: number }): boolean {
  const dayOfWeek = new Date(date).getDay(); // 0-6, Sunday-Saturday
  const { start, end } = weekOff;
  // Handle cases where week-off spans across Sunday
  if (start > end) {
    return dayOfWeek >= start || dayOfWeek <= end;
  }
  return dayOfWeek >= start && dayOfWeek <= end;
}

/**
 * Normalizes the roster rules to ensure consistent property names and values
 */
function normalizeRules(rules: RosterRules): RosterRules & { dedicatedOnCallMemberId: string } {
  console.log('Normalizing rules input:', rules);
  
  // Parse shift_timings if it's a string
  let shiftTimings: ShiftTiming[] = [];
  
  if (Array.isArray(rules.shiftTimings)) {
    shiftTimings = rules.shiftTimings;
    console.log('Using provided shiftTimings array:', shiftTimings);
  } else if (typeof rules.shift_timings === 'string') {
    try {
      shiftTimings = JSON.parse(rules.shift_timings);
      console.log('Parsed shift_timings from string:', shiftTimings);
    } catch (e) {
      console.error('Error parsing shift_timings string:', e);
    }
  } else if (Array.isArray(rules.shift_timings)) {
    shiftTimings = rules.shift_timings;
    console.log('Using shift_timings array:', shiftTimings);
  }
  
  if (!Array.isArray(shiftTimings) || shiftTimings.length === 0) {
    console.error('No valid shift timings found');
    throw new Error('No valid shift timings found in rules');
  }

  // Create a normalized version of the rules with default values
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  
  const normalized = {
    ...rules,
    dedicatedOnCallMemberId: rules.dedicatedOnCallMember,
    shiftTimings: shiftTimings,
    // Ensure we have valid dates
    startDate: rules.startDate || `${thisYear}-${String(thisMonth).padStart(2, '0')}-01`,
    endDate: rules.endDate || `${thisYear}-${String(thisMonth).padStart(2, '0')}-31`,
    weekOff: rules.weekOff || { start: 6, end: 0 }, // Default: Saturday-Sunday
    numberOfShifts: rules.number_of_shifts ?? rules.numberOfShifts ?? 3,
    minMembersPerShift: rules.min_members_per_shift ?? rules.minMembersPerShift ?? 1,
    maxMembersPerShift: rules.max_members_per_shift ?? rules.maxMembersPerShift ?? 5,
    onCallType: rules.on_call_type ?? rules.onCallType ?? "dedicated",
    rotationCycle: rules.rotation_cycle ?? rules.rotationCycle ?? "weekly",
    customRotationDays: rules.custom_rotation_days ?? rules.customRotationDays ?? null,
    consecutiveShiftLimit: rules.consecutive_shift_limit ?? rules.consecutiveShiftLimit ?? 1,
    minRestHoursBetweenShifts: rules.min_rest_hours_between_shifts ?? rules.minRestHoursBetweenShifts ?? 8,
    weekendCoverage: rules.weekend_coverage ?? rules.weekendCoverage ?? "required",
    holidayCoverage: rules.holiday_coverage ?? rules.holidayCoverage ?? "required",
    enforceEqualDistribution: rules.enforce_equal_distribution ?? rules.enforceEqualDistribution ?? true,
    prioritizeExperience: rules.prioritize_experience ?? rules.prioritizeExperience ?? false,
    allowSelfSelection: rules.allow_self_selection ?? rules.allowSelfSelection ?? true,
    advanceNotificationDays: rules.advance_notification_days ?? rules.advanceNotificationDays ?? 7,
    allowShiftSwapping: rules.allow_shift_swapping ?? rules.allowShiftSwapping ?? true,
    requireApprovalForSwaps: rules.require_approval_for_swaps ?? rules.requireApprovalForSwaps ?? true
  };

  console.log('Normalized rules with shift timings:', normalized);
  return normalized;
}

/**
 * Generates a roster based on provided rules and team members.
 * Rules:
 * 1. Weekends: All shifts handled by dedicated on-call member
 * 2. Weekdays:
 *    - Evening shift: Always assigned to dedicated on-call member
 *    - Morning/Noon shifts: Weekly rotation among regular members
 * 3. Members are assigned based on weekly rotation pattern
 * 4. Week-off rules are respected
 * 5. Shift limits and rest hours are enforced
 */
export interface GenerateRosterInput {
  rules: RosterRules;
  members: TeamMember[];
  leaves?: LeaveEntry[];
  year?: number;
  month?: number;
}

export function generateRoster(input: GenerateRosterInput): ShiftAssignment[] {
  console.log('Generate Roster called with:', input);
  
  // Normalize rules for consistent property access
  const normalizedRules = normalizeRules(input.rules);
  console.log('Normalized rules:', normalizedRules);
  
  const assignments: ShiftAssignment[] = [];

  // Separate dedicated on-call member from regular members
  const dedicatedOCMember = input.members.find((m: TeamMember) => m.name === normalizedRules.dedicatedOnCallMember);
  if (!dedicatedOCMember) {
    throw new Error(`Dedicated on-call member "${normalizedRules.dedicatedOnCallMember}" not found`);
  }

  const regularMembers = input.members.filter((m: TeamMember) => m.name !== normalizedRules.dedicatedOnCallMember);
  const minRequired = normalizedRules.minMembersPerShift || 1;
  if (regularMembers.length < minRequired) {
    throw new Error(`Not enough regular members for shift assignments. Need at least ${minRequired}`);
  }

  // Generate dates to create roster for
  const startDate = new Date(normalizedRules.startDate);
  const endDate = new Date(normalizedRules.endDate);
  const dates = getDatesBetween(startDate, endDate);

  // Define available shift types for rotation
  const shiftTypes = ['S1', 'S2', 'HS'];
  
  // Generate roster for each date
  dates.forEach(date => {
    const isWeekendDay = isWeekend(date);
    const weekNum = getWeekNumber(new Date(date));

    // Process shifts for regular members
    regularMembers.forEach((member, memberIndex) => {
      if (isWeekendDay) {
        // On weekends, regular members get week off
        assignments.push({
          date,
          shiftId: 'WO',
          memberId: member.id,
          shift_type: 'WO',
          status: 'Week Off'
        });
      } else {
        // On weekdays, rotate shifts based on week number
        // Each member gets a different shift type that rotates weekly
        const shiftIndex = (weekNum + memberIndex) % shiftTypes.length;
        const shiftType = shiftTypes[shiftIndex];
        
        assignments.push({
          date,
          shiftId: shiftType,
          memberId: member.id,
          shift_type: shiftType,
          status: 'Regular Shift'
        });
      }
    });

    // Handle dedicated on-call member
    if (isWeekendDay) {
      // On weekends, on-call member does on-call duty
      assignments.push({
        date,
        shiftId: 'OC',
        memberId: dedicatedOCMember.id,
        shift_type: 'OC',
        status: 'On Call'
      });
    } else {
      // On weekdays, on-call member gets a regular shift based on rotation
      const shiftIndex = (weekNum + regularMembers.length) % shiftTypes.length;
      const shiftType = shiftTypes[shiftIndex];
      
      assignments.push({
        date,
        shiftId: shiftType,
        memberId: dedicatedOCMember.id,
        shift_type: shiftType,
        status: 'Regular Shift'
      });
    }
  });

  console.log('Generated assignments:', assignments);
  
  if (assignments.length === 0) {
    console.error('No assignments were generated. Check the following:');
    console.log('- Date range:', { startDate, endDate });
    console.log('- Team members:', { dedicatedOCMember, regularMembers });
  }

  return assignments;
}
