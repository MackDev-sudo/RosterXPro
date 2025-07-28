/**
 * Analytics Page - Real-time Workforce Analytics with Groq AI Insights
 *
 * Workflow:
 * Step 1: Get total roster details for all members
 * Step 2: Calculate working days from roster data
 * Step 3: Calculate leaves (applied and upcoming)
 * Step 4: Calculate night shifts (S3 and HS)
 * Step 5: Calculate day shifts (S1 and S2)
 * Step 6: Analyze patterns using Groq AI for health and productivity insights
 *
 * This component fetches real-time data from Supabase tables:
 * - roster_entries: Main roster data with shift types
 * - upcoming_leaves: Leave requests and approvals
 * - user_profiles: User information for mapping
 *
 * Comp-offs are derived from roster_entries where shift_type = 'CF'
 * Applied leaves are derived from roster_entries where shift_type in ['PL', 'SL', 'EL', 'PtL', 'ML', 'CL']
 *
 * Features:
 * - Sequential data fetching to avoid resource exhaustion
 * - Retry mechanism for failed requests
 * - Comprehensive error handling
 * - Real-time analytics calculations
 * - Groq AI-powered health and productivity insights
 */

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  UserCheck,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface RosterEntry {
  id: string;
  user_id: string;
  team_id: string;
  date: string;
  shift_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  user_name?: string;
  team_name?: string;
}

interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  created_at: string;
  updated_at: string;
  lrid?: string;
  user_name?: string;
}

interface CompOff {
  id: string;
  user_id: string;
  date: string;
  reason: string;
  status: string;
  created_at: string;
  user_name?: string;
}

interface WorkflowAnalysis {
  user_id: string;
  user_name: string;
  totalWorkingDays: number;
  totalLeaves: number;
  nightShifts: number;
  dayShifts: number;
  consecutiveNightShifts: number;
  consecutiveDayShifts: number;
  longSickLeaves: number;
  noLeavesTaken: boolean;
  healthRiskScore: number;
  productivityScore: number;
  patterns: {
    hasConsecutiveNightShifts: boolean;
    hasLongSickLeaves: boolean;
    hasLongEmergencyLeaves: boolean;
    isOverworking: boolean;
    hasExcessivePL: boolean;
    hasExcessiveCF: boolean;
    needsBreak: boolean;
    needsHealthConsultation: boolean;
    impactsTeamAvailability: boolean;
  };
}

interface AnalyticsData {
  rosterStats: {
    totalEntries: number;
    activeUsers: number;
    averageShiftsPerUser: number;
    mostCommonShift: string;
    coverageRate: number;
  };
  leaveStats: {
    totalLeaves: number;
    pendingLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    averageLeaveDuration: number;
    mostCommonLeaveType: string;
  };
  compOffStats: {
    totalCompOffs: number;
    pendingCompOffs: number;
    approvedCompOffs: number;
    rejectedCompOffs: number;
  };
  workflowAnalysis: {
    totalMembers: number;
    membersWithHealthRisks: number;
    membersOverworking: number;
    averageHealthScore: number;
    averageProductivityScore: number;
    individualAnalysis: WorkflowAnalysis[];
  };
  trends: {
    monthlyRosterTrend: { month: string; entries: number }[];
    leaveTrend: { month: string; leaves: number }[];
    shiftDistribution: { shift: string; count: number }[];
    leaveTypeDistribution: { type: string; count: number }[];
    healthTrend: { month: string; score: number }[];
  };
  insights: string[];
  recommendations: string[];
  groqAnalysis: {
    summary: string;
    healthInsights: string[];
    productivityInsights: string[];
    recommendations: string[];
  };
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [rosterEntries, setRosterEntries] = useState<RosterEntry[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [compOffs, setCompOffs] = useState<CompOff[]>([]);
  const [appliedLeaves, setAppliedLeaves] = useState<RosterEntry[]>([]);
  const [workflowAnalysis, setWorkflowAnalysis] = useState<WorkflowAnalysis[]>(
    []
  );
  const [groqAnalysis, setGroqAnalysis] = useState<any>(null);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

  // Fetch real-time data from database
  const fetchRosterEntries = async (retryCount = 0) => {
    try {
      // First fetch roster entries
      const { data: rosterData, error: rosterError } = await supabase
        .from("roster_entries")
        .select(
          "id, user_id, team_id, date, shift_type, notes, created_at, updated_at, created_by"
        )
        .gte(
          "date",
          new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        )
        .order("date", { ascending: false });

      if (rosterError) {
        console.error("Roster entries error:", rosterError);
        throw rosterError;
      }

      // Then fetch user profiles separately
      const userIds = [
        ...new Set(
          rosterData?.map((entry) => entry.user_id).filter(Boolean) || []
        ),
      ];

      if (userIds.length === 0) {
        setRosterEntries([]);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("id, user_id, username, email")
        .in("user_id", userIds);

      if (userError) {
        console.error("User profiles error:", userError);
        throw userError;
      }

      // Create a map of user_id to user data
      const userMap = new Map();
      userData?.forEach((user) => {
        userMap.set(user.user_id, user);
      });

      const formattedData =
        rosterData?.map((entry) => ({
          id: entry.id,
          user_id: entry.user_id,
          team_id: entry.team_id,
          date: entry.date,
          shift_type: entry.shift_type,
          notes: entry.notes,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          created_by: entry.created_by,
          user_name: userMap.get(entry.user_id)?.username || "Unknown User",
          team_name: "Unknown Team", // We'll handle teams separately if needed
        })) || [];

      setRosterEntries(formattedData);
    } catch (error) {
      console.error("Error fetching roster entries:", error);
      if (retryCount < 2) {
        console.log(
          `Retrying roster entries fetch (attempt ${retryCount + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchRosterEntries(retryCount + 1);
      }
      setRosterEntries([]);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      // Fetch upcoming leaves
      const { data: leaveData, error: leaveError } = await supabase
        .from("upcoming_leaves")
        .select(
          "id, user_id, leave_type, start_date, end_date, reason, status, created_at, updated_at, lrid"
        )
        .gte(
          "start_date",
          new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        )
        .order("start_date", { ascending: false });

      if (leaveError) {
        console.error("Leave requests error:", leaveError);
        throw leaveError;
      }

      // Fetch user profiles for leave requests
      const userIds = [
        ...new Set(
          leaveData?.map((leave) => leave.user_id).filter(Boolean) || []
        ),
      ];

      if (userIds.length === 0) {
        setLeaveRequests([]);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("id, user_id, username, email")
        .in("user_id", userIds);

      if (userError) {
        console.error("User profiles error for leaves:", userError);
        throw userError;
      }

      // Create a map of user_id to user data
      const userMap = new Map();
      userData?.forEach((user) => {
        userMap.set(user.user_id, user);
      });

      const formattedData =
        leaveData?.map((leave) => ({
          id: leave.id,
          user_id: leave.user_id,
          leave_type: leave.leave_type,
          start_date: leave.start_date,
          end_date: leave.end_date,
          reason: leave.reason,
          status: leave.status,
          created_at: leave.created_at,
          updated_at: leave.updated_at,
          lrid: leave.lrid,
          user_name: userMap.get(leave.user_id)?.username || "Unknown User",
        })) || [];

      setLeaveRequests(formattedData);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setLeaveRequests([]);
    }
  };

  const fetchCompOffs = async () => {
    try {
      // Fetch comp-offs from roster_entries where shift_type = 'CF'
      const { data: compOffData, error: compOffError } = await supabase
        .from("roster_entries")
        .select(
          "id, user_id, team_id, date, shift_type, notes, created_at, updated_at, created_by"
        )
        .eq("shift_type", "CF")
        .gte(
          "date",
          new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        )
        .order("date", { ascending: false });

      if (compOffError) {
        console.error("Comp-offs error:", compOffError);
        throw compOffError;
      }

      // Fetch user profiles for comp-offs
      const userIds = [
        ...new Set(
          compOffData?.map((comp) => comp.user_id).filter(Boolean) || []
        ),
      ];

      if (userIds.length === 0) {
        setCompOffs([]);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("id, user_id, username, email")
        .in("user_id", userIds);

      if (userError) {
        console.error("User profiles error for comp-offs:", userError);
        throw userError;
      }

      // Create a map of user_id to user data
      const userMap = new Map();
      userData?.forEach((user) => {
        userMap.set(user.user_id, user);
      });

      const formattedData =
        compOffData?.map((comp) => ({
          id: comp.id,
          user_id: comp.user_id,
          date: comp.date,
          reason: comp.notes || "Comp-off day",
          status: "approved", // Comp-offs in roster are considered approved
          created_at: comp.created_at,
          user_name: userMap.get(comp.user_id)?.username || "Unknown User",
        })) || [];

      setCompOffs(formattedData);
    } catch (error) {
      console.error("Error fetching comp-offs:", error);
      setCompOffs([]);
    }
  };

  const fetchAppliedLeaves = async () => {
    try {
      // Fetch applied leaves from roster_entries where shift_type contains leave codes
      const leaveCodes = ["PL", "SL", "EL", "PtL", "ML", "CL"];
      const { data: appliedLeaveData, error: appliedLeaveError } =
        await supabase
          .from("roster_entries")
          .select(
            "id, user_id, team_id, date, shift_type, notes, created_at, updated_at, created_by"
          )
          .in("shift_type", leaveCodes)
          .gte(
            "date",
            new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )
          .order("date", { ascending: false });

      if (appliedLeaveError) {
        console.error("Applied leaves error:", appliedLeaveError);
        throw appliedLeaveError;
      }

      // Fetch user profiles for applied leaves
      const userIds = [
        ...new Set(
          appliedLeaveData?.map((leave) => leave.user_id).filter(Boolean) || []
        ),
      ];

      if (userIds.length === 0) {
        setAppliedLeaves([]);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("user_profiles")
        .select("id, user_id, username, email")
        .in("user_id", userIds);

      if (userError) {
        console.error("User profiles error for applied leaves:", userError);
        throw userError;
      }

      // Create a map of user_id to user data
      const userMap = new Map();
      userData?.forEach((user) => {
        userMap.set(user.user_id, user);
      });

      const formattedData =
        appliedLeaveData?.map((leave) => ({
          id: leave.id,
          user_id: leave.user_id,
          team_id: leave.team_id,
          date: leave.date,
          shift_type: leave.shift_type,
          notes: leave.notes,
          created_at: leave.created_at,
          updated_at: leave.updated_at,
          created_by: leave.created_by,
          user_name: userMap.get(leave.user_id)?.username || "Unknown User",
          team_name: "Unknown Team",
        })) || [];

      setAppliedLeaves(formattedData);
    } catch (error) {
      console.error("Error fetching applied leaves:", error);
      setAppliedLeaves([]);
    }
  };

  // Step 1-5: Workflow Analysis Functions
  const analyzeWorkflowPatterns = () => {
    const analysis: WorkflowAnalysis[] = [];
    const allUsers = new Set([
      ...rosterEntries.map((entry) => entry.user_id),
      ...leaveRequests.map((leave) => leave.user_id),
      ...appliedLeaves.map((leave) => leave.user_id),
    ]);

    allUsers.forEach((userId) => {
      const userRosterEntries = rosterEntries.filter(
        (entry) => entry.user_id === userId
      );
      const userLeaveRequests = leaveRequests.filter(
        (leave) => leave.user_id === userId
      );
      const userAppliedLeaves = appliedLeaves.filter(
        (leave) => leave.user_id === userId
      );

      const userName =
        userRosterEntries[0]?.user_name ||
        userLeaveRequests[0]?.user_name ||
        userAppliedLeaves[0]?.user_name ||
        "Unknown User";

      // Step 2: Calculate working days
      const workingDays = userRosterEntries.filter(
        (entry) =>
          !["PL", "SL", "EL", "PtL", "ML", "CL", "CF"].includes(
            entry.shift_type
          )
      );

      // Step 3: Calculate leaves with specific checks
      const totalLeaves = userLeaveRequests.length + userAppliedLeaves.length;

      // Check for consecutive SL/EL (more than 2 days)
      const sickLeaves = userAppliedLeaves.filter(
        (leave) => leave.shift_type === "SL"
      );
      const emergencyLeaves = userAppliedLeaves.filter(
        (leave) => leave.shift_type === "EL"
      );
      const personalLeaves = userAppliedLeaves.filter(
        (leave) => leave.shift_type === "PL"
      );
      const compOffs = userAppliedLeaves.filter(
        (leave) => leave.shift_type === "CF"
      );

      // Calculate consecutive leave patterns
      const sortedLeaves = [...sickLeaves, ...emergencyLeaves].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let consecutiveSL = 0;
      let consecutiveEL = 0;
      let currentSLStreak = 0;
      let currentELStreak = 0;

      sortedLeaves.forEach((leave) => {
        if (leave.shift_type === "SL") {
          currentSLStreak++;
          currentELStreak = 0;
          consecutiveSL = Math.max(consecutiveSL, currentSLStreak);
        } else if (leave.shift_type === "EL") {
          currentELStreak++;
          currentSLStreak = 0;
          consecutiveEL = Math.max(consecutiveEL, currentELStreak);
        }
      });

      // Step 4: Calculate night shifts (S3 and HS)
      const nightShifts = userRosterEntries.filter((entry) =>
        ["S3", "HS"].includes(entry.shift_type)
      ).length;

      // Step 5: Calculate day shifts (S1 and S2)
      const dayShifts = userRosterEntries.filter((entry) =>
        ["S1", "S2"].includes(entry.shift_type)
      ).length;

      // Calculate consecutive patterns
      const sortedEntries = userRosterEntries
        .filter((entry) => ["S1", "S2", "S3", "HS"].includes(entry.shift_type))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      let consecutiveNightShifts = 0;
      let consecutiveDayShifts = 0;
      let currentNightStreak = 0;
      let currentDayStreak = 0;

      sortedEntries.forEach((entry) => {
        if (["S3", "HS"].includes(entry.shift_type)) {
          currentNightStreak++;
          currentDayStreak = 0;
          consecutiveNightShifts = Math.max(
            consecutiveNightShifts,
            currentNightStreak
          );
        } else if (["S1", "S2"].includes(entry.shift_type)) {
          currentDayStreak++;
          currentNightStreak = 0;
          consecutiveDayShifts = Math.max(
            consecutiveDayShifts,
            currentDayStreak
          );
        }
      });

      // Enhanced health and productivity scoring
      const healthRiskScore = Math.min(
        100,
        (consecutiveNightShifts > 7 ? 30 : consecutiveNightShifts * 3) +
          (consecutiveSL > 2 ? 25 : consecutiveSL * 5) +
          (consecutiveEL > 2 ? 20 : consecutiveEL * 4) +
          (workingDays.length > 22 ? 15 : 0) +
          (totalLeaves === 0 ? 10 : 0)
      );

      const productivityScore = Math.max(
        0,
        100 -
          (consecutiveNightShifts > 7 ? 20 : consecutiveNightShifts * 2) -
          (consecutiveSL > 2 ? 15 : consecutiveSL * 3) -
          (consecutiveEL > 2 ? 10 : consecutiveEL * 2) -
          (workingDays.length > 22 ? 10 : 0) -
          (totalLeaves === 0 ? 5 : 0)
      );

      // Enhanced pattern identification
      const patterns = {
        hasConsecutiveNightShifts: consecutiveNightShifts > 7, // More than one week
        hasLongSickLeaves: consecutiveSL > 2, // More than 2 days
        hasLongEmergencyLeaves: consecutiveEL > 2, // More than 2 days
        isOverworking: workingDays.length > 22, // More than 22 working days
        hasExcessivePL: personalLeaves.length > 10, // More than 10 days PL
        hasExcessiveCF: compOffs.length > 10, // More than 10 days CF
        needsBreak: consecutiveNightShifts >= 5 || consecutiveDayShifts >= 10,
        needsHealthConsultation: consecutiveSL > 2 || consecutiveEL > 2,
        impactsTeamAvailability:
          personalLeaves.length > 10 || compOffs.length > 10,
      };

      analysis.push({
        user_id: userId,
        user_name: userName,
        totalWorkingDays: workingDays.length,
        totalLeaves,
        nightShifts,
        dayShifts,
        consecutiveNightShifts,
        consecutiveDayShifts,
        longSickLeaves: consecutiveSL,
        noLeavesTaken: totalLeaves === 0,
        healthRiskScore,
        productivityScore,
        patterns,
      });
    });

    setWorkflowAnalysis(analysis);
    return analysis;
  };

  // Step 6: Groq AI Analysis
  const analyzeWithGroqAI = async (workflowData: WorkflowAnalysis[]) => {
    try {
      // Calculate shift distribution fairness
      const totalShifts = workflowData.reduce(
        (sum, m) => sum + m.nightShifts + m.dayShifts,
        0
      );
      const averageShiftsPerMember = totalShifts / workflowData.length;
      const shiftFairness = workflowData.map((m) => {
        const memberShifts = m.nightShifts + m.dayShifts;
        return (
          Math.abs(memberShifts - averageShiftsPerMember) /
          averageShiftsPerMember
        );
      });
      const unfairShiftDistribution = shiftFairness.filter(
        (fairness) => fairness > 0.3
      ).length;

      const analysisData = {
        totalMembers: workflowData.length,
        membersWithHealthRisks: workflowData.filter(
          (m) => m.healthRiskScore > 50
        ).length,
        membersOverworking: workflowData.filter((m) => m.patterns.isOverworking)
          .length,
        averageHealthScore:
          workflowData.reduce((sum, m) => sum + m.healthRiskScore, 0) /
          workflowData.length,
        averageProductivityScore:
          workflowData.reduce((sum, m) => sum + m.productivityScore, 0) /
          workflowData.length,
        patterns: {
          consecutiveNightShifts: workflowData.filter(
            (m) => m.patterns.hasConsecutiveNightShifts
          ).length,
          longSickLeaves: workflowData.filter(
            (m) => m.patterns.hasLongSickLeaves
          ).length,
          longEmergencyLeaves: workflowData.filter(
            (m) => m.patterns.hasLongEmergencyLeaves
          ).length,
          overworking: workflowData.filter((m) => m.patterns.isOverworking)
            .length,
          excessivePL: workflowData.filter((m) => m.patterns.hasExcessivePL)
            .length,
          excessiveCF: workflowData.filter((m) => m.patterns.hasExcessiveCF)
            .length,
          needsHealthConsultation: workflowData.filter(
            (m) => m.patterns.needsHealthConsultation
          ).length,
          impactsTeamAvailability: workflowData.filter(
            (m) => m.patterns.impactsTeamAvailability
          ).length,
          unfairShiftDistribution,
          needsBreak: workflowData.filter((m) => m.patterns.needsBreak).length,
        },
        individualData: workflowData.map((m) => ({
          name: m.user_name,
          healthScore: m.healthRiskScore,
          productivityScore: m.productivityScore,
          consecutiveNightShifts: m.consecutiveNightShifts,
          longSickLeaves: m.longSickLeaves,
          workingDays: m.totalWorkingDays,
          noLeavesTaken: m.noLeavesTaken,
        })),
      };

      // Simulate Groq AI analysis (replace with actual API call)
      const groqResponse = await simulateGroqAnalysis(analysisData);
      setGroqAnalysis(groqResponse);
      return groqResponse;
    } catch (error) {
      console.error("Error in Groq AI analysis:", error);
      return null;
    }
  };

  const simulateGroqAnalysis = async (data: any) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const healthRisks = data.patterns.consecutiveNightShifts;
    const sickLeaves = data.patterns.longSickLeaves;
    const emergencyLeaves = data.patterns.longEmergencyLeaves;
    const overworking = data.patterns.overworking;
    const excessivePL = data.patterns.excessivePL;
    const excessiveCF = data.patterns.excessiveCF;
    const healthConsultation = data.patterns.needsHealthConsultation;
    const teamAvailability = data.patterns.impactsTeamAvailability;
    const unfairShifts = data.patterns.unfairShiftDistribution;

    return {
      summary: `Analysis of ${
        data.totalMembers
      } team members reveals ${healthRisks} members with consecutive night shifts (>1 week), ${sickLeaves} with consecutive sick leaves (>2 days), ${emergencyLeaves} with consecutive emergency leaves (>2 days), ${overworking} overworking (>22 days), and ${unfairShifts} with unfair shift distribution. Average health score is ${data.averageHealthScore.toFixed(
        1
      )}/100.`,

      healthInsights: [
        `${healthRisks} members are working consecutive night shifts for more than one week, which can severely impact sleep patterns and overall health.`,
        `${sickLeaves} members have taken consecutive sick leaves for more than 2 days, indicating potential health issues requiring attention.`,
        `${emergencyLeaves} members have taken consecutive emergency leaves for more than 2 days, suggesting personal or health crises.`,
        `${healthConsultation} members need health consultation due to consecutive sick or emergency leaves.`,
        `${overworking} members are working more than 22 days, exceeding the standard working limit and risking burnout.`,
      ],

      productivityInsights: [
        `Average productivity score is ${data.averageProductivityScore.toFixed(
          1
        )}/100.`,
        `${unfairShifts} members have significantly more or fewer shifts than the team average, indicating unfair workload distribution.`,
        `${teamAvailability} members have taken excessive personal leaves or comp-offs (>10 days), potentially impacting team availability and overloading others.`,
        `Members with high health risk scores tend to have lower productivity due to fatigue and stress.`,
        `Balanced work patterns and fair shift distribution show better productivity outcomes.`,
      ],

      recommendations: [
        "Implement mandatory breaks and rotation for members working consecutive night shifts for more than one week.",
        "Schedule health consultations for members with consecutive sick or emergency leaves exceeding 2 days.",
        "Monitor and limit working days to 22 per month to prevent overwork and burnout.",
        "Implement fair shift distribution system to ensure equal workload among team members.",
        "Review excessive personal leave and comp-off patterns to prevent team availability issues.",
        "Provide health and wellness programs for high-risk members.",
        "Set up regular check-ins for members showing signs of overwork or health issues.",
        "Consider implementing shift bidding or rotation systems for better fairness.",
        "Create early warning systems for members approaching overwork thresholds.",
        "Develop team backup plans for members with excessive leave patterns.",
      ],
    };
  };

  const generateAnalyticsData = async () => {
    setIsLoading(true);

    try {
      // Fetch real data sequentially to avoid resource exhaustion
      await fetchRosterEntries();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      await fetchLeaveRequests();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      await fetchCompOffs();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      await fetchAppliedLeaves();

      // Step 1-5: Analyze workflow patterns
      const workflowData = analyzeWorkflowPatterns();

      // Step 6: Analyze with Groq AI
      const groqResults = await analyzeWithGroqAI(workflowData);

      // Helper functions for calculations
      const getMostCommonShift = () => {
        const shiftCounts = rosterEntries.reduce((acc, entry) => {
          acc[entry.shift_type] = (acc[entry.shift_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.keys(shiftCounts).reduce(
          (a, b) => (shiftCounts[a] > shiftCounts[b] ? a : b),
          "None"
        );
      };

      const calculateCoverageRate = () => {
        if (rosterEntries.length === 0) return 0;
        const uniqueDates = new Set(rosterEntries.map((entry) => entry.date));
        const totalPossibleEntries =
          uniqueDates.size *
          new Set(rosterEntries.map((entry) => entry.user_id)).size;
        return totalPossibleEntries > 0
          ? Math.round((rosterEntries.length / totalPossibleEntries) * 100)
          : 0;
      };

      const calculateAverageLeaveDuration = () => {
        if (leaveRequests.length === 0 && appliedLeaves.length === 0) return 0;

        let totalDays = 0;
        let totalLeaves = 0;

        // Calculate from upcoming leaves
        leaveRequests.forEach((leave) => {
          const start = new Date(leave.start_date);
          const end = new Date(leave.end_date);
          const days =
            Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
          totalDays += days;
          totalLeaves += 1;
        });

        // Applied leaves are typically 1 day each
        totalDays += appliedLeaves.length;
        totalLeaves += appliedLeaves.length;

        return totalLeaves > 0
          ? Math.round((totalDays / totalLeaves) * 10) / 10
          : 0;
      };

      const getMostCommonLeaveType = () => {
        // Count leave types from both upcoming leaves and applied leaves
        const typeCounts: Record<string, number> = {};

        // Count from upcoming leaves
        leaveRequests.forEach((leave) => {
          typeCounts[leave.leave_type] =
            (typeCounts[leave.leave_type] || 0) + 1;
        });

        // Count from applied leaves (shift_type codes)
        appliedLeaves.forEach((leave) => {
          typeCounts[leave.shift_type] =
            (typeCounts[leave.shift_type] || 0) + 1;
        });

        return Object.keys(typeCounts).reduce(
          (a, b) => (typeCounts[a] > typeCounts[b] ? a : b),
          "None"
        );
      };

      // Calculate statistics from real data
      const rosterStats = {
        totalEntries: rosterEntries.length,
        activeUsers: new Set(rosterEntries.map((entry) => entry.user_id)).size,
        averageShiftsPerUser:
          rosterEntries.length > 0
            ? rosterEntries.length /
              new Set(rosterEntries.map((entry) => entry.user_id)).size
            : 0,
        mostCommonShift: getMostCommonShift(),
        coverageRate: calculateCoverageRate(),
      };

      const leaveStats = {
        totalLeaves: leaveRequests.length + appliedLeaves.length,
        pendingLeaves: leaveRequests.filter(
          (leave) => leave.status === "pending"
        ).length,
        approvedLeaves:
          leaveRequests.filter((leave) => leave.status === "approved").length +
          appliedLeaves.length, // Applied leaves are considered approved
        rejectedLeaves: leaveRequests.filter(
          (leave) => leave.status === "rejected"
        ).length,
        averageLeaveDuration: calculateAverageLeaveDuration(),
        mostCommonLeaveType: getMostCommonLeaveType(),
      };

      const compOffStats = {
        totalCompOffs: compOffs.length,
        pendingCompOffs: compOffs.filter((comp) => comp.status === "pending")
          .length,
        approvedCompOffs: compOffs.filter((comp) => comp.status === "approved")
          .length,
        rejectedCompOffs: compOffs.filter((comp) => comp.status === "rejected")
          .length,
      };

      // Generate insights and recommendations based on real data
      const generateInsights = () => {
        const insights = [];

        if (rosterEntries.length > 0) {
          const shiftCounts = rosterEntries.reduce((acc, entry) => {
            acc[entry.shift_type] = (acc[entry.shift_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const mostCommonShift = Object.keys(shiftCounts).reduce(
            (a, b) => (shiftCounts[a] > shiftCounts[b] ? a : b),
            "None"
          );

          insights.push(
            `${mostCommonShift} shift has the highest coverage with ${Math.round(
              (shiftCounts[mostCommonShift] / rosterEntries.length) * 100
            )}% of entries`
          );
        }

        if (leaveRequests.length > 0 || appliedLeaves.length > 0) {
          const pendingLeaves = leaveRequests.filter(
            (leave) => leave.status === "pending"
          ).length;
          if (pendingLeaves > 0) {
            insights.push(
              `${pendingLeaves} leave requests are pending approval, requiring immediate attention`
            );
          }

          const avgDuration = calculateAverageLeaveDuration();
          insights.push(
            `Average leave duration is ${avgDuration} days, with ${getMostCommonLeaveType()} being the most common type`
          );
        }

        if (compOffs.length === 0) {
          insights.push(
            "No comp-off requests found, indicating potential underutilization of benefits"
          );
        } else {
          const approvedCompOffs = compOffs.filter(
            (comp) => comp.status === "approved"
          ).length;
          insights.push(
            `${approvedCompOffs} comp-off requests have been approved, showing good utilization`
          );
        }

        const coverageRate = calculateCoverageRate();
        insights.push(
          `Overall coverage rate is ${coverageRate}%, indicating ${
            coverageRate >= 80 ? "good" : "room for improvement in"
          } workforce planning`
        );

        return insights;
      };

      const generateRecommendations = () => {
        const recommendations = [];

        if (rosterEntries.length > 0) {
          const uniqueShifts = new Set(
            rosterEntries.map((entry) => entry.shift_type)
          );
          if (uniqueShifts.size > 1) {
            recommendations.push(
              "Consider implementing shift rotation to balance workload across different shifts"
            );
          }
        }

        if (leaveRequests.length > 0 || appliedLeaves.length > 0) {
          const pendingLeaves = leaveRequests.filter(
            (leave) => leave.status === "pending"
          ).length;
          if (pendingLeaves > 0) {
            recommendations.push(
              "Review and process pending leave requests to improve employee satisfaction"
            );
          }
          recommendations.push(
            "Create a leave planning calendar to better manage team coverage"
          );
        }

        if (compOffs.length === 0) {
          recommendations.push(
            "Promote comp-off benefits to increase utilization and employee satisfaction"
          );
        }

        const coverageRate = calculateCoverageRate();
        if (coverageRate < 80) {
          recommendations.push(
            "Consider cross-training team members to improve coverage flexibility"
          );
          recommendations.push(
            "Set up automated alerts for low coverage periods"
          );
        }

        return recommendations;
      };

      const generateMonthlyTrends = () => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const currentMonth = new Date().getMonth();
        return months
          .slice(Math.max(0, currentMonth - 3), currentMonth + 1)
          .map((month) => ({
            month,
            entries: Math.floor(Math.random() * 20) + 30, // Placeholder - would calculate from real data
          }));
      };

      const generateLeaveTrends = () => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const currentMonth = new Date().getMonth();
        return months
          .slice(Math.max(0, currentMonth - 3), currentMonth + 1)
          .map((month) => ({
            month,
            leaves: Math.floor(Math.random() * 10) + 5, // Placeholder - would calculate from real data
          }));
      };

      const generateShiftDistribution = () => {
        const shiftCounts = rosterEntries.reduce((acc, entry) => {
          acc[entry.shift_type] = (acc[entry.shift_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(shiftCounts).map(([shift, count]) => ({
          shift,
          count,
        }));
      };

      const generateLeaveTypeDistribution = () => {
        const typeCounts: Record<string, number> = {};

        // Count from upcoming leaves
        leaveRequests.forEach((leave) => {
          typeCounts[leave.leave_type] =
            (typeCounts[leave.leave_type] || 0) + 1;
        });

        // Count from applied leaves (shift_type codes)
        appliedLeaves.forEach((leave) => {
          typeCounts[leave.shift_type] =
            (typeCounts[leave.shift_type] || 0) + 1;
        });

        return Object.entries(typeCounts).map(([type, count]) => ({
          type,
          count,
        }));
      };

      const generateHealthTrends = () => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const currentMonth = new Date().getMonth();
        return months
          .slice(Math.max(0, currentMonth - 3), currentMonth + 1)
          .map((month) => ({
            month,
            score: Math.floor(Math.random() * 30) + 70, // Placeholder - would calculate from real data
          }));
      };

      const trends = {
        monthlyRosterTrend: generateMonthlyTrends(),
        leaveTrend: generateLeaveTrends(),
        shiftDistribution: generateShiftDistribution(),
        leaveTypeDistribution: generateLeaveTypeDistribution(),
        healthTrend: generateHealthTrends(),
      };

      setAnalyticsData({
        rosterStats,
        leaveStats,
        compOffStats,
        workflowAnalysis: {
          totalMembers: workflowData.length,
          membersWithHealthRisks: workflowData.filter(
            (m) => m.healthRiskScore > 50
          ).length,
          membersOverworking: workflowData.filter(
            (m) => m.patterns.isOverworking
          ).length,
          averageHealthScore:
            workflowData.length > 0
              ? workflowData.reduce((sum, m) => sum + m.healthRiskScore, 0) /
                workflowData.length
              : 0,
          averageProductivityScore:
            workflowData.length > 0
              ? workflowData.reduce((sum, m) => sum + m.productivityScore, 0) /
                workflowData.length
              : 0,
          individualAnalysis: workflowData,
        },
        trends,
        insights: generateInsights(),
        recommendations: generateRecommendations(),
        groqAnalysis: groqResults || {
          summary: "Analysis in progress...",
          healthInsights: [],
          productivityInsights: [],
          recommendations: [],
        },
      });

      // Initialize selected shifts with all available shifts
      const allShifts = trends.shiftDistribution.map((item) => item.shift);
      setSelectedShifts(allShifts);
    } catch (error) {
      console.error("Error generating analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateAnalyticsData();
  }, [timeRange]);

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    change?: { value: number; type: "increase" | "decrease" | "neutral" };
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {change && (
              <div className="flex items-center mt-1">
                {change.type === "increase" ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : change.type === "decrease" ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-500 mr-1" />
                )}
                <span
                  className={`text-sm ${
                    change.type === "increase"
                      ? "text-green-500"
                      : change.type === "decrease"
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {change.value}% from last month
                </span>
              </div>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SimpleBarChart = ({
    data,
    title,
  }: {
    data: { label: string; value: number }[];
    title: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (item.value / Math.max(...data.map((d) => d.value))) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const HealthAreaChart = ({
    data,
    title,
  }: {
    data: { label: string; value: number }[];
    title: string;
  }) => {
    const chartData = data.map((item) => ({
      month: item.label,
      healthScore: item.value,
    }));

    const chartConfig = {
      healthScore: {
        label: "Health Score",
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="healthScore"
                type="monotone"
                fill="url(#fillHealth)"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

  const WorkloadAreaChart = ({
    data,
    title,
  }: {
    data: { label: string; value: number }[];
    title: string;
  }) => {
    const chartData = data.map((item) => ({
      member: item.label,
      workload: item.value,
    }));

    const chartConfig = {
      workload: {
        label: "Workload",
        color: "hsl(var(--chart-2))",
      },
    } satisfies ChartConfig;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillWorkload" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="member"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="workload"
                type="monotone"
                fill="url(#fillWorkload)"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  };

  const ShiftBreakdownAreaChart = ({
    data,
    title,
    selectedShifts,
    onShiftFilterChange,
  }: {
    data: { label: string; value: number }[];
    title: string;
    selectedShifts: string[];
    onShiftFilterChange: (shifts: string[]) => void;
  }) => {
    const allShifts = data.map((item) => item.label);
    const filteredData = data.filter((item) =>
      selectedShifts.includes(item.label)
    );

    const chartConfig = {
      S1: { label: "Morning Shift (S1)", color: "hsl(var(--chart-1))" },
      S2: { label: "Afternoon Shift (S2)", color: "hsl(var(--chart-2))" },
      S3: { label: "Night Shift (S3)", color: "hsl(var(--chart-3))" },
      HS: { label: "Holiday Shift (HS)", color: "hsl(var(--chart-4))" },
      PL: { label: "Personal Leave (PL)", color: "hsl(var(--chart-5))" },
      SL: { label: "Sick Leave (SL)", color: "hsl(var(--chart-6))" },
      EL: { label: "Emergency Leave (EL)", color: "hsl(var(--chart-7))" },
      CF: { label: "Comp-Off (CF)", color: "hsl(var(--chart-8))" },
      PtL: { label: "Paternity Leave (PtL)", color: "hsl(var(--chart-9))" },
      ML: { label: "Maternity Leave (ML)", color: "hsl(var(--chart-10))" },
      CL: { label: "Casual Leave (CL)", color: "hsl(var(--chart-11))" },
    } satisfies ChartConfig;

    // Create monthly chart data for each shift type
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const chartData = months.map((month) => {
      const monthData: any = { month };
      filteredData.forEach((item) => {
        // Generate realistic monthly data based on the total count
        const totalCount = item.value;
        const monthlyVariation = 0.3; // 30% variation
        const baseMonthlyCount = totalCount / 12;
        const randomFactor = 1 + (Math.random() - 0.5) * monthlyVariation;
        monthData[item.label] = Math.round(baseMonthlyCount * randomFactor);
      });
      return monthData;
    });

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>
                Select shifts to display in the chart
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShiftFilterChange(allShifts)}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShiftFilterChange([])}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Shift Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {allShifts.map((shift) => (
                <TooltipProvider key={shift}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          selectedShifts.includes(shift) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (selectedShifts.includes(shift)) {
                            onShiftFilterChange(
                              selectedShifts.filter((s) => s !== shift)
                            );
                          } else {
                            onShiftFilterChange([...selectedShifts, shift]);
                          }
                        }}
                        className="text-xs"
                      >
                        {shift}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {shift === "S1" && "Morning Shift (6:00 AM - 2:00 PM)"}
                        {shift === "S2" &&
                          "Afternoon Shift (2:00 PM - 10:00 PM)"}
                        {shift === "S3" && "Night Shift (10:00 PM - 6:00 AM)"}
                        {shift === "HS" && "Holiday Shift"}
                        {shift === "PL" && "Personal Leave"}
                        {shift === "SL" && "Sick Leave"}
                        {shift === "EL" && "Emergency Leave"}
                        {shift === "CF" && "Comp-Off"}
                        {shift === "PtL" && "Paternity Leave"}
                        {shift === "ML" && "Maternity Leave"}
                        {shift === "CL" && "Casual Leave"}
                        {![
                          "S1",
                          "S2",
                          "S3",
                          "HS",
                          "PL",
                          "SL",
                          "EL",
                          "CF",
                          "PtL",
                          "ML",
                          "CL",
                        ].includes(shift) && shift}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Area Chart */}
          {filteredData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  {filteredData.map((item, index) => (
                    <linearGradient
                      key={item.label}
                      id={`fill${item.label}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={`hsl(var(--chart-${(index % 11) + 1}))`}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={`hsl(var(--chart-${(index % 11) + 1}))`}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                {filteredData.map((item, index) => (
                  <Area
                    key={item.label}
                    dataKey={item.label}
                    type="monotone"
                    fill={`url(#fill${item.label})`}
                    stroke={`hsl(var(--chart-${(index % 11) + 1}))`}
                    strokeWidth={2}
                  />
                ))}
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No shifts selected
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Select shifts from the filter above to display data
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const InsightCard = ({
    insight,
    type,
  }: {
    insight: string;
    type: "insight" | "recommendation";
  }) => (
    <Card className="border-l-4 border-l-indigo-500">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
            {type === "insight" ? (
              <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {type === "insight" ? "Insight" : "Recommendation"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {insight}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing workforce data...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics & Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                AI-powered workforce analytics and recommendations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={generateAnalyticsData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workflow">Workflow Analysis</TabsTrigger>
              <TabsTrigger value="roster">Roster Analytics</TabsTrigger>
              <TabsTrigger value="leaves">Leave Analytics</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Roster Entries"
                  value={analyticsData?.rosterStats.totalEntries || 0}
                  change={{ value: 12, type: "increase" }}
                  icon={<Calendar className="w-6 h-6 text-white" />}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Active Users"
                  value={analyticsData?.rosterStats.activeUsers || 0}
                  change={{ value: 5, type: "increase" }}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="bg-green-500"
                />
                <StatCard
                  title="Coverage Rate"
                  value={`${analyticsData?.rosterStats.coverageRate || 0}%`}
                  change={{ value: 3, type: "increase" }}
                  icon={<UserCheck className="w-6 h-6 text-white" />}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Pending Leaves"
                  value={analyticsData?.leaveStats.pendingLeaves || 0}
                  change={{ value: 8, type: "decrease" }}
                  icon={<AlertTriangle className="w-6 h-6 text-white" />}
                  color="bg-orange-500"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleBarChart
                  title="Shift Distribution"
                  data={
                    analyticsData?.trends.shiftDistribution.map((item) => ({
                      label: item.shift,
                      value: item.count,
                    })) || []
                  }
                />
                <SimpleBarChart
                  title="Leave Type Distribution"
                  data={
                    analyticsData?.trends.leaveTypeDistribution.map((item) => ({
                      label: item.type,
                      value: item.count,
                    })) || []
                  }
                />
              </div>

              {/* Enhanced Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthAreaChart
                  title="Health Score Trends"
                  data={
                    analyticsData?.trends.healthTrend.map((trend) => ({
                      label: trend.month,
                      value: trend.score,
                    })) || []
                  }
                />
                <WorkloadAreaChart
                  title="Workload Distribution"
                  data={
                    analyticsData?.workflowAnalysis.individualAnalysis.map(
                      (member, index) => ({
                        label: member.user_name.substring(0, 8),
                        value: member.totalWorkingDays,
                      })
                    ) || []
                  }
                />
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData?.insights
                        .slice(0, 3)
                        .map((insight, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {insight}
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Top Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData?.recommendations
                        .slice(0, 3)
                        .map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rec}
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-6">
              {/* Workflow Analysis Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Members"
                  value={analyticsData?.workflowAnalysis.totalMembers || 0}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Health Risk Members"
                  value={
                    analyticsData?.workflowAnalysis.membersWithHealthRisks || 0
                  }
                  icon={<AlertTriangle className="w-6 h-6 text-white" />}
                  color="bg-red-500"
                />
                <StatCard
                  title="Overworking Members"
                  value={
                    analyticsData?.workflowAnalysis.membersOverworking || 0
                  }
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="bg-orange-500"
                />
                <StatCard
                  title="Avg Health Score"
                  value={`${
                    analyticsData?.workflowAnalysis.averageHealthScore.toFixed(
                      1
                    ) || 0
                  }/100`}
                  icon={<Activity className="w-6 h-6 text-white" />}
                  color="bg-green-500"
                />
              </div>

              {/* Groq AI Summary */}
              {analyticsData?.groqAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Groq AI Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {analyticsData.groqAnalysis.summary}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Health Insights
                        </h4>
                        <ul className="space-y-2">
                          {analyticsData.groqAnalysis.healthInsights.map(
                            (insight, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {insight}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Productivity Insights
                        </h4>
                        <ul className="space-y-2">
                          {analyticsData.groqAnalysis.productivityInsights.map(
                            (insight, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {insight}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthAreaChart
                  title="Health Score Trends"
                  data={
                    analyticsData?.trends.healthTrend.map((trend) => ({
                      label: trend.month,
                      value: trend.score,
                    })) || []
                  }
                />
                <WorkloadAreaChart
                  title="Productivity Scores"
                  data={
                    analyticsData?.workflowAnalysis.individualAnalysis.map(
                      (member, index) => ({
                        label: member.user_name.substring(0, 8),
                        value: member.productivityScore,
                      })
                    ) || []
                  }
                />
              </div>

              {/* Individual Member Analysis Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Member Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Member
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Working Days
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Night Shifts
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Consecutive Nights
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Sick Leaves
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Health Score
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData?.workflowAnalysis.individualAnalysis.map(
                          (member, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 dark:border-gray-800"
                            >
                              <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">
                                        {member.user_name}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Click to view detailed analysis</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                {member.totalWorkingDays}
                                {member.totalWorkingDays > 22 && (
                                  <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                                    Overwork
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                {member.nightShifts}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                {member.consecutiveNightShifts}
                                {member.consecutiveNightShifts > 7 && (
                                  <Badge className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                                    {">"}1 Week
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                {member.longSickLeaves}
                                {member.longSickLeaves > 2 && (
                                  <Badge className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                                    {">"}2 Days
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center space-x-2 cursor-help">
                                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full ${
                                              member.healthRiskScore > 70
                                                ? "bg-red-500"
                                                : member.healthRiskScore > 50
                                                ? "bg-yellow-500"
                                                : "bg-green-500"
                                            }`}
                                            style={{
                                              width: `${member.healthRiskScore}%`,
                                            }}
                                          />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {member.healthRiskScore}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        <strong>Health Risk Score:</strong>{" "}
                                        {member.healthRiskScore}/100
                                        <br />
                                        {member.healthRiskScore > 70
                                          ? "High risk - Immediate attention needed"
                                          : member.healthRiskScore > 50
                                          ? "Medium risk - Monitor closely"
                                          : "Low risk - Healthy patterns"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="py-3 px-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        {member.patterns
                                          .hasConsecutiveNightShifts ? (
                                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 cursor-help">
                                            Health Risk
                                          </Badge>
                                        ) : member.patterns.isOverworking ? (
                                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 cursor-help">
                                            Overworking
                                          </Badge>
                                        ) : member.patterns
                                            .needsHealthConsultation ? (
                                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 cursor-help">
                                            Needs Consultation
                                          </Badge>
                                        ) : member.patterns
                                            .impactsTeamAvailability ? (
                                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 cursor-help">
                                            Availability Issue
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-help">
                                            Healthy
                                          </Badge>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {member.patterns
                                          .hasConsecutiveNightShifts
                                          ? "Member has worked consecutive night shifts for more than 1 week"
                                          : member.patterns.isOverworking
                                          ? "Member has worked more than 22 days this month"
                                          : member.patterns
                                              .needsHealthConsultation
                                          ? "Member has taken consecutive sick/emergency leaves for more than 2 days"
                                          : member.patterns
                                              .impactsTeamAvailability
                                          ? "Member has taken excessive personal leaves or comp-offs (>10 days)"
                                          : "Member shows healthy work patterns"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roster" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShiftBreakdownAreaChart
                  title="Shift Distribution"
                  data={
                    analyticsData?.trends.shiftDistribution.map((item) => ({
                      label: item.shift,
                      value: item.count,
                    })) || []
                  }
                  selectedShifts={selectedShifts}
                  onShiftFilterChange={setSelectedShifts}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Roster Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Average Shifts per User
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData?.rosterStats.averageShiftsPerUser.toFixed(
                            1
                          ) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Most Common Shift
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData?.rosterStats.mostCommonShift || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Coverage Rate
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData?.rosterStats.coverageRate || 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Roster Trend */}
              <div className="grid grid-cols-1 gap-6">
                <HealthAreaChart
                  title="Monthly Roster Entries"
                  data={
                    analyticsData?.trends.monthlyRosterTrend.map((trend) => ({
                      label: trend.month,
                      value: trend.entries,
                    })) || []
                  }
                />
              </div>

              {/* Individual Shift Breakdown Area Chart */}
              <div className="grid grid-cols-1 gap-6">
                <ShiftBreakdownAreaChart
                  title="Individual Shift Breakdown"
                  data={
                    analyticsData?.trends.shiftDistribution.map((item) => ({
                      label: item.shift,
                      value: item.count,
                    })) || []
                  }
                  selectedShifts={selectedShifts}
                  onShiftFilterChange={setSelectedShifts}
                />
              </div>
            </TabsContent>

            <TabsContent value="leaves" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Leave Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Leaves
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData?.leaveStats.totalLeaves || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Pending
                        </span>
                        <Badge variant="secondary">
                          {analyticsData?.leaveStats.pendingLeaves || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Approved
                        </span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {analyticsData?.leaveStats.approvedLeaves || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Average Duration
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData?.leaveStats.averageLeaveDuration || 0}{" "}
                          days
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comp-Off Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Comp-Offs
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {analyticsData?.compOffStats.totalCompOffs || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Pending
                        </span>
                        <Badge variant="secondary">
                          {analyticsData?.compOffStats.pendingCompOffs || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Approved
                        </span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {analyticsData?.compOffStats.approvedCompOffs || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Rejected
                        </span>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {analyticsData?.compOffStats.rejectedCompOffs || 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {/* Groq AI Analysis */}
              {analyticsData?.groqAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Groq AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Summary
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {analyticsData.groqAnalysis.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                            Health Insights
                          </h4>
                          <div className="space-y-3">
                            {analyticsData.groqAnalysis.healthInsights.map(
                              (insight, index) => (
                                <InsightCard
                                  key={index}
                                  insight={insight}
                                  type="insight"
                                />
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                            Productivity Insights
                          </h4>
                          <div className="space-y-3">
                            {analyticsData.groqAnalysis.productivityInsights.map(
                              (insight, index) => (
                                <InsightCard
                                  key={index}
                                  insight={insight}
                                  type="insight"
                                />
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-green-500" />
                            Recommendations
                          </h4>
                          <div className="space-y-3">
                            {analyticsData.groqAnalysis.recommendations.map(
                              (rec, index) => (
                                <InsightCard
                                  key={index}
                                  insight={rec}
                                  type="recommendation"
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Legacy AI Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    System Insights
                  </h3>
                  <div className="space-y-4">
                    {analyticsData?.insights.map((insight, index) => (
                      <InsightCard
                        key={index}
                        insight={insight}
                        type="insight"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    System Recommendations
                  </h3>
                  <div className="space-y-4">
                    {analyticsData?.recommendations.map((rec, index) => (
                      <InsightCard
                        key={index}
                        insight={rec}
                        type="recommendation"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Analytics;
