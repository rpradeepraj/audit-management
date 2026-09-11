"use client";

import React, { useState } from "react";
import { AuditPlan } from "../../shared/types/audit";
import { Clock, X } from "lucide-react";

interface RescheduleModalProps {
  audit: AuditPlan;
  onClose: () => void;
  onSave: (auditId: string, updates: any) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  audit,
  onClose,
  onSave,
}) => {
  const [startDate, setStartDate] = useState(audit.startDate);
  const [endDate, setEndDate] = useState(audit.endDate);
  const [openingMeeting, setOpeningMeeting] = useState(audit.openingMeetingTime || "09:30 AM");
  const [closingMeeting, setClosingMeeting] = useState(audit.closingMeetingTime || "04:30 PM");
  const [notes, setNotes] = useState(audit.scheduleNotes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(audit.id, {
      startDate,
      endDate,
      openingMeetingTime: openingMeeting,
      closingMeetingTime: closingMeeting,
      scheduleNotes: notes,
      isScheduleConfirmed: true,
      status: "Scheduled",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Reschedule Audit Engagement</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {audit.auditNumber} • {audit.customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opening Meeting
              </label>
              <input
                type="text"
                value={openingMeeting}
                onChange={(e) => setOpeningMeeting(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Closing Meeting
              </label>
              <input
                type="text"
                value={closingMeeting}
                onChange={(e) => setClosingMeeting(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reschedule Justification / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for schedule adjustment (e.g. auditee turnaround, auditor availability)..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Confirm New Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
