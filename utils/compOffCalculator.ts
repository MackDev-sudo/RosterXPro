import { ShiftAssignment } from "./generateRoster";

/**
 * Interface for comp-off balance calculation result
 */
export interface CompOffBalance {
  memberId: string;
  memberName?: string;
  totalOnCallDays: number;
  compOffBalance: number;
  compOffUsed?: number;
  compOffRemaining?: number;
}

/**
 * Interface for comp-off usage tracking
 */
export interface CompOffUsage {
  memberId: string;
  date: string;
  reason?: string;
}

/**
 * Calculates comp-off balance based on on-call assignments
 * Rule: 1 On-call day = 1 Comp-off day
 *
 * @param assignments Array of shift assignments
 * @param members Optional array of team members for name mapping
 * @param compOffUsage Optional array of comp-off usage records
 * @returns Array of comp-off balances for each member
 */
export function calculateCompOffBalance(
  assignments: ShiftAssignment[],
  members?: Array<{ id: string; name: string }>,
  compOffUsage?: CompOffUsage[]
): CompOffBalance[] {
  // Group assignments by member ID
  const memberAssignments = new Map<string, ShiftAssignment[]>();

  assignments.forEach((assignment) => {
    const memberId = assignment.memberId;
    if (!memberAssignments.has(memberId)) {
      memberAssignments.set(memberId, []);
    }
    memberAssignments.get(memberId)!.push(assignment);
  });

  // Calculate comp-off balance for each member
  const compOffBalances: CompOffBalance[] = [];

  memberAssignments.forEach((memberAssignments, memberId) => {
    // Count on-call assignments (shift_type: 'OC' or status: 'On Call')
    const onCallDays = memberAssignments.filter(
      (assignment) =>
        assignment.shift_type === "OC" ||
        assignment.status === "On Call" ||
        assignment.shiftId === "OC"
    ).length;

    // Calculate comp-off used by this member
    const compOffUsedCount =
      compOffUsage?.filter((usage) => usage.memberId === memberId).length || 0;

    // Find member name if members array is provided
    const memberName = members?.find((m) => m.id === memberId)?.name;

    const balance: CompOffBalance = {
      memberId,
      memberName,
      totalOnCallDays: onCallDays,
      compOffBalance: onCallDays, // 1:1 ratio
      compOffUsed: compOffUsedCount,
      compOffRemaining: onCallDays - compOffUsedCount,
    };

    compOffBalances.push(balance);
  });

  // Sort by member name or ID for consistent ordering
  compOffBalances.sort((a, b) => {
    const nameA = a.memberName || a.memberId;
    const nameB = b.memberName || b.memberId;
    return nameA.localeCompare(nameB);
  });

  return compOffBalances;
}

/**
 * Calculates comp-off balance for a specific member
 *
 * @param memberId The ID of the member
 * @param assignments Array of shift assignments
 * @param compOffUsage Optional array of comp-off usage records
 * @returns Comp-off balance for the specific member
 */
export function calculateMemberCompOffBalance(
  memberId: string,
  assignments: ShiftAssignment[],
  compOffUsage?: CompOffUsage[]
): CompOffBalance | null {
  const memberAssignments = assignments.filter(
    (assignment) => assignment.memberId === memberId
  );

  // Count on-call assignments
  const onCallDays = memberAssignments.filter(
    (assignment) =>
      assignment.shift_type === "OC" ||
      assignment.status === "On Call" ||
      assignment.shiftId === "OC"
  ).length;

  // Calculate comp-off used by this member
  const compOffUsedCount =
    compOffUsage?.filter((usage) => usage.memberId === memberId).length || 0;

  return {
    memberId,
    totalOnCallDays: onCallDays,
    compOffBalance: onCallDays,
    compOffUsed: compOffUsedCount,
    compOffRemaining: onCallDays - compOffUsedCount,
  };
}

/**
 * Gets comp-off statistics for a date range
 *
 * @param assignments Array of shift assignments
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @param members Optional array of team members for name mapping
 * @returns Comp-off statistics for the date range
 */
export function getCompOffStatistics(
  assignments: ShiftAssignment[],
  startDate: string,
  endDate: string,
  members?: Array<{ id: string; name: string }>
): {
  totalOnCallDays: number;
  totalCompOffsEarned: number;
  memberBreakdown: CompOffBalance[];
} {
  // Filter assignments within date range
  const filteredAssignments = assignments.filter((assignment) => {
    const assignmentDate = assignment.date;
    return assignmentDate >= startDate && assignmentDate <= endDate;
  });

  const memberBalances = calculateCompOffBalance(filteredAssignments, members);

  const totalOnCallDays = memberBalances.reduce(
    (sum, balance) => sum + balance.totalOnCallDays,
    0
  );
  const totalCompOffsEarned = memberBalances.reduce(
    (sum, balance) => sum + balance.compOffBalance,
    0
  );

  return {
    totalOnCallDays,
    totalCompOffsEarned,
    memberBreakdown: memberBalances,
  };
}

/**
 * Validates if a member can use comp-off on a specific date
 *
 * @param memberId The ID of the member
 * @param date The date to use comp-off (YYYY-MM-DD)
 * @param assignments Array of shift assignments
 * @param existingCompOffUsage Existing comp-off usage records
 * @returns Object indicating if comp-off can be used and reason if not
 */
export function canUseCompOff(
  memberId: string,
  date: string,
  assignments: ShiftAssignment[],
  existingCompOffUsage: CompOffUsage[] = []
): {
  canUse: boolean;
  reason?: string;
  availableBalance: number;
} {
  // Calculate current balance
  const balance = calculateMemberCompOffBalance(
    memberId,
    assignments,
    existingCompOffUsage
  );

  if (!balance) {
    return {
      canUse: false,
      reason: "No shift assignments found for this member",
      availableBalance: 0,
    };
  }

  const availableBalance = balance.compOffRemaining || 0;

  if (availableBalance <= 0) {
    return {
      canUse: false,
      reason: "No comp-off balance available",
      availableBalance,
    };
  }

  // Check if comp-off is already used on this date
  const alreadyUsed = existingCompOffUsage.some(
    (usage) => usage.memberId === memberId && usage.date === date
  );

  if (alreadyUsed) {
    return {
      canUse: false,
      reason: "Comp-off already used on this date",
      availableBalance,
    };
  }

  return {
    canUse: true,
    availableBalance,
  };
}
