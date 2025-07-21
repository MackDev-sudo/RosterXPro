import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "../hooks/useAuth";
import { organizationService } from "../lib/organizationService";
import { useToast } from "@/hooks/use-toast";

interface UpcommingLeavesProps {
  open: boolean;
  onClose: () => void;
}

const leaveTypes = [
  { label: "Planned Leave", value: "PL" },
  { label: "Sick Leave", value: "SL" },
  { label: "Emergency Leave", value: "EL" },
  { label: "Comp-off", value: "CF" },
  { label: "Paternity Leave", value: "PtL" },
  { label: "Maternity Leave", value: "ML" },
  { label: "Care Leave", value: "CL" },
];

function getNextMonthRange() {
  const now = new Date();
  const year =
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const month = (now.getMonth() + 1) % 12;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    min: start.toISOString().slice(0, 10),
    max: end.toISOString().slice(0, 10),
  };
}

const UpcommingLeaves: React.FC<UpcommingLeavesProps> = ({ open, onClose }) => {
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    status: "",
    officeLeaveCode: "",
  });
  const [leaves, setLeaves] = useState<
    Array<{
      leaveType: string;
      startDate: string;
      endDate: string;
      reason: string;
      status: string;
      officeLeaveCode: string;
    }>
  >([]);
  const { min, max } = getNextMonthRange();
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLeave = () => {
    setLeaves((prev) => [...prev, form]);
    setForm({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      status: "",
      officeLeaveCode: "",
    });
  };

  const handleRemoveLeave = (idx: number) => {
    setLeaves((prev) => prev.filter((_, i) => i !== idx));
  };

  const formValid =
    form.leaveType && form.startDate && form.endDate && form.status;
  const canSave = leaves.length > 0;

  const handleSave = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to save leaves.",
      });
      return;
    }
    setIsSaving(true);

    const formattedLeaves = leaves.map((l) => ({
      leave_type: l.leaveType,
      start_date: l.startDate,
      end_date: l.endDate,
      reason: l.reason,
      status: l.status,
      lrid: l.officeLeaveCode || undefined,
    }));

    const { success, error } = await organizationService.addUpcomingLeaves(
      formattedLeaves,
      user.id
    );

    setIsSaving(false);

    if (success) {
      toast({
        title: "Leaves Saved!",
        description: "Your upcoming leaves have been successfully recorded.",
      });
      onClose();
      // TODO: Add a callback to refresh the dashboard data if needed
    } else {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description:
          error?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Upcoming Leave (Next Month Only)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Row 1: Leave Type, Status, OLC */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Leave Type
              </label>
              <Select
                value={form.leaveType}
                onValueChange={(v) => handleFormChange("leaveType", v)}
              >
                <SelectTrigger className="w-full">
                  {form.leaveType ? (
                    leaveTypes.find((t) => t.value === form.leaveType)?.label
                  ) : (
                    <span className="text-gray-400">Select leave type</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Approval Status
              </label>
              <Select
                value={form.status}
                onValueChange={(v) => handleFormChange("status", v)}
              >
                <SelectTrigger className="w-full">
                  {form.status ? (
                    form.status === "approved" ? (
                      <span className="text-green-700 font-semibold">
                        Approved
                      </span>
                    ) : (
                      <span className="text-yellow-700 font-semibold">
                        Pending
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400">Select status</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Leave Request ID (LRID)
              </label>
              <Input
                type="text"
                value={form.officeLeaveCode}
                onChange={(e) =>
                  handleFormChange("officeLeaveCode", e.target.value)
                }
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Row 2: Dates */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={form.startDate}
                min={min}
                max={max}
                onChange={(e) => handleFormChange("startDate", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={form.endDate}
                min={min}
                max={max}
                onChange={(e) => handleFormChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Reason */}
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <div className="relative">
              <textarea
                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 resize-none ${
                  reasonExpanded ? "h-24" : "h-11"
                }`}
                value={form.reason}
                onChange={(e) => handleFormChange("reason", e.target.value)}
                placeholder="Optional"
              />
              {form.reason.length > 40 && (
                <button
                  type="button"
                  onClick={() => setReasonExpanded(!reasonExpanded)}
                  className="text-xs text-blue-600 absolute bottom-1.5 right-2 hover:underline bg-white/80 backdrop-blur-sm px-1 rounded"
                >
                  {reasonExpanded ? "less" : "more"}
                </button>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="mb-2 mt-2"
            onClick={handleAddLeave}
            disabled={!formValid}
          >
            Add
          </Button>
        </div>
        {leaves.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 font-semibold text-sm text-gray-700">
              Added Leaves
            </div>
            <div className="rounded-xl border divide-y bg-white max-h-56 overflow-y-auto shadow-sm">
              {leaves.map((leave, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {leaveTypes.find((t) => t.value === leave.leaveType)
                          ?.label || "Type"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          leave.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {leave.status === "approved"
                          ? "✔️ Approved"
                          : "⏳ Pending"}
                      </span>
                      {leave.officeLeaveCode && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <span>LRID:</span> {leave.officeLeaveCode}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      <span>
                        <strong>From:</strong> {leave.startDate}
                      </span>
                      <span>
                        <strong>To:</strong> {leave.endDate}
                      </span>
                    </div>
                    {leave.reason && (
                      <span className="text-xs text-gray-600">
                        <strong>Reason:</strong> {leave.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50 ml-2 h-6 w-6"
                    onClick={() => handleRemoveLeave(idx)}
                    title="Remove"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            type="button"
            disabled={!canSave || isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpcommingLeaves;
