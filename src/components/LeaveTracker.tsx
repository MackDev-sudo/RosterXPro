import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, FileText } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { organizationService } from "../lib/organizationService";

interface LeaveEntry {
  id: string;
  user_id: string;
  username: string;
  email: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  lrid?: string;
  created_at: string;
}

interface AppliedLeaveEntry {
  id: string;
  user_id: string;
  username: string;
  email: string;
  date: string;
  shift_type: string;
  notes?: string;
}

interface LeaveTrackerProps {
  selectedTeam: any;
  userRole: string | null;
}

const LeaveTracker: React.FC<LeaveTrackerProps> = ({
  selectedTeam,
  userRole,
}) => {
  const { user } = useAuth();
  const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveEntry[]>([]);
  const [appliedLeaves, setAppliedLeaves] = useState<AppliedLeaveEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Load leave data based on user role
  useEffect(() => {
    if (user && selectedTeam) {
      loadLeaveData();
    }
  }, [user, selectedTeam, userRole]);

  const loadLeaveData = async () => {
    setLoading(true);
    try {
      if (userRole === "admin") {
        // Admin: Load all team members' leaves
        await loadAllTeamLeaves();
      } else {
        // Member: Load only current user's leaves
        await loadUserLeaves();
      }
    } catch (error) {
      console.error("Error loading leave data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllTeamLeaves = async () => {
    // Load upcoming leaves for all team members
    const upcomingData = await organizationService.getAllTeamUpcomingLeaves(
      selectedTeam.id
    );
    setUpcomingLeaves(upcomingData);

    // Load applied leaves for all team members
    const appliedData = await organizationService.getAllTeamAppliedLeaves(
      selectedTeam.id
    );
    setAppliedLeaves(appliedData);
  };

  const loadUserLeaves = async () => {
    if (!user) return;

    // Load upcoming leaves for current user
    const upcomingData = await organizationService.getUserUpcomingLeaves(
      user.id
    );
    setUpcomingLeaves(upcomingData);

    // Load applied leaves for current user
    const appliedData = await organizationService.getUserAppliedLeaves(
      user.id,
      selectedTeam.id
    );
    setAppliedLeaves(appliedData);
  };

  const getLeaveTypeBadge = (leaveType: string) => {
    const leaveMap: {
      [key: string]: { label: string; bgColor: string; textColor: string };
    } = {
      PL: {
        label: "Paid Leave",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      },
      SL: {
        label: "Sick Leave",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      },
      EL: {
        label: "Emergency Leave",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
      },
      CF: {
        label: "Comp-off",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
      },
      PtL: {
        label: "Paternity Leave",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
      },
      ML: {
        label: "Maternity Leave",
        bgColor: "bg-pink-100",
        textColor: "text-pink-800",
      },
      CL: {
        label: "Care Leave",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
      },
    };

    const config = leaveMap[leaveType] || {
      label: leaveType,
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    };

    return (
      <Badge className={`${config.bgColor} ${config.textColor} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const isApproved = status === "approved";
    return (
      <Badge
        className={`${
          isApproved
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        } font-medium`}
      >
        {isApproved ? "Approved" : "Pending"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const getMeaningfulNotes = (leave: any, isUpcoming: boolean = false) => {
    if (isUpcoming) {
      // For upcoming leaves, show reason if available, otherwise show leave type description
      if (
        leave.reason &&
        leave.reason.trim() !== "" &&
        leave.reason !== "Regular Shift"
      ) {
        return leave.reason;
      }

      // Generate meaningful description based on leave type
      const leaveDescriptions: { [key: string]: string } = {
        PL: "Paid leave request",
        SL: "Sick leave request",
        EL: "Emergency leave request",
        CF: "Comp-off utilization",
        PtL: "Paternity leave request",
        ML: "Maternity leave request",
        CL: "Care leave request",
      };

      return leaveDescriptions[leave.leave_type] || "Leave request";
    } else {
      // For applied leaves, show notes if meaningful, otherwise show leave type description
      if (
        leave.notes &&
        leave.notes.trim() !== "" &&
        leave.notes !== "Regular Shift"
      ) {
        return leave.notes;
      }

      // Generate meaningful description based on leave type
      const leaveDescriptions: { [key: string]: string } = {
        PL: "Paid leave applied",
        SL: "Sick leave applied",
        EL: "Emergency leave applied",
        CF: "Comp-off utilized",
        PtL: "Paternity leave applied",
        ML: "Maternity leave applied",
        CL: "Care leave applied",
      };

      return leaveDescriptions[leave.shift_type] || "Leave applied";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading leave data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Leave Tracker
          {userRole === "admin" && (
            <Badge variant="secondary" className="ml-2">
              Admin View
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Leaves
              <Badge variant="secondary" className="ml-1">
                {upcomingLeaves.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="applied" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Applied Leaves
              <Badge variant="secondary" className="ml-1">
                {appliedLeaves.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingLeaves.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming leaves found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {userRole === "admin" && <TableHead>Team Member</TableHead>}
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>LRID</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      {userRole === "admin" && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {leave.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {leave.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {leave.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {getLeaveTypeBadge(leave.leave_type)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {calculateLeaveDays(leave.start_date, leave.end_date)}{" "}
                          day(s)
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(leave.start_date)}</div>
                          {leave.start_date !== leave.end_date && (
                            <div className="text-gray-500">
                              to {formatDate(leave.end_date)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        {leave.lrid ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {leave.lrid}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-xs truncate"
                          title={getMeaningfulNotes(leave, true)}
                        >
                          {getMeaningfulNotes(leave, true)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="applied" className="mt-6">
            {appliedLeaves.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No applied leaves found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {userRole === "admin" && <TableHead>Team Member</TableHead>}
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliedLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      {userRole === "admin" && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {leave.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {leave.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {leave.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {getLeaveTypeBadge(leave.shift_type)}
                      </TableCell>
                      <TableCell>{formatDate(leave.date)}</TableCell>
                      <TableCell>
                        <div
                          className="max-w-xs truncate"
                          title={getMeaningfulNotes(leave)}
                        >
                          {getMeaningfulNotes(leave)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeaveTracker;
