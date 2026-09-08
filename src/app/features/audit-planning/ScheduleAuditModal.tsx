"use client";

import React, { useState, useEffect } from "react";
import { AuditPlan, AuditFirm, Customer, AuditTemplate, User, AuditType, LocationType } from "../../shared/types/audit";
import { CalendarCheck2, X, Users, Calendar, MapPin } from "lucide-react";
import { MultiSelectDropdown } from "../../shared/components/ui";

interface ScheduleAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (auditData: Partial<AuditPlan>) => void;
  editingAudit: AuditPlan | null;
  firm: AuditFirm;
  customers: Customer[];
  templates: AuditTemplate[];
  users: User[];
}

export const ScheduleAuditModal: React.FC<ScheduleAuditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAudit,
  firm,
  customers,
  templates,
  users,
}) => {
  const [title, setTitle] = useState("");
  const [auditType, setAuditType] = useState<AuditType>("Surveillance");
  const [leadAuditorIds, setLeadAuditorIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openingMeetingTime, setOpeningMeetingTime] = useState("09:30 AM");
  const [closingMeetingTime, setClosingMeetingTime] = useState("04:30 PM");
  const [locationType, setLocationType] = useState<LocationType>("On-Site");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [scope, setScope] = useState("");
  const [objectives, setObjectives] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");

  const eligibleAuditors = users.filter((u) => {
    const isFirmAuditor = u.role === "Auditor" || u.role === "Audit Manager" || u.role === "Platform Admin" || u.role === "Company Admin";
    return isFirmAuditor;
  });

  const auditorOptions = eligibleAuditors.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.role})`,
    description: `${u.department || firm.name} • ${u.email}`,
  }));

  useEffect(() => {
    if (editingAudit) {
      setTitle(editingAudit.title);
      setAuditType(editingAudit.auditType);
      setLeadAuditorIds(editingAudit.leadAuditorIds || [editingAudit.leadAuditorId].filter(Boolean));
      setStartDate(editingAudit.startDate);
      setEndDate(editingAudit.endDate);
      setOpeningMeetingTime(editingAudit.openingMeetingTime || "09:30 AM");
      setClosingMeetingTime(editingAudit.closingMeetingTime || "04:30 PM");
      setLocationType(editingAudit.locationType || "On-Site");
      setFacilityAddress(editingAudit.facilityAddress || editingAudit.location || "");
      setScope(editingAudit.scope || "");
      setObjectives(editingAudit.objectives || "");
      setScheduleNotes(editingAudit.scheduleNotes || "");
    } else {
      setTitle("");
      setAuditType("Surveillance");
      setLeadAuditorIds([]);
      setStartDate("");
      setEndDate("");
      setOpeningMeetingTime("09:30 AM");
      setClosingMeetingTime("04:30 PM");
      setLocationType("On-Site");
      setFacilityAddress("");
      setScope("");
      setObjectives("");
      setScheduleNotes("");
    }
  }, [editingAudit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryLead = users.find((u) => u.id === leadAuditorIds[0]) || eligibleAuditors[0];
    const team = users.filter((u) => leadAuditorIds.includes(u.id));

    onSave({
      title: title.trim(),
      auditType,
      leadAuditorId: primaryLead?.id || "aud_1",
      leadAuditorName: primaryLead?.name || "Victoria Sterling",
      leadAuditorIds,
      leadAuditorNames: team.map((t) => t.name),
      auditorTeam: team.map((t) => `${t.name} (${t.role})`),
      auditTeam: team.map((t) => `${t.name} (${t.role})`),
      startDate,
      endDate,
      openingMeetingTime,
      closingMeetingTime,
      locationType,
      facilityAddress,
      scope,
      objectives,
      scheduleNotes,
      status: "Scheduled",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl xl:max-w-6xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-indigo-600" />
              <span>
                {editingAudit ? "Maintain Audit Engagement Plan" : `Schedule New Audit Plan for ${firm.name}`}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Accredited Certification Body: <strong className="text-slate-800">{firm.name} ({firm.code})</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Audit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Audit Engagement Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apex Global Logistics – Annual ISO 9001 Surveillance"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Audit Type / Stage *
              </label>
              <select
                value={auditType}
                onChange={(e) => setAuditType(e.target.value as AuditType)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Certification">Initial Certification</option>
                <option value="Surveillance">Annual Surveillance</option>
                <option value="Recertification">Recertification</option>
                <option value="Internal Quality">Internal Audit</option>
                <option value="Supplier Audit">Supplier Audit</option>
                <option value="Regulatory">Regulatory Inspection</option>
              </select>
            </div>
          </div>

          {/* Certified Lead Auditor Multi-Select */}
          <div>
            <MultiSelectDropdown
              label={`Certified Lead Auditor (${firm.code})`}
              required
              options={auditorOptions}
              selectedValues={leadAuditorIds}
              onChange={setLeadAuditorIds}
              placeholder="Select certified lead auditors..."
            />
          </div>

          {/* Dates and Times */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date *
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
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opening Meeting
              </label>
              <input
                type="text"
                value={openingMeetingTime}
                onChange={(e) => setOpeningMeetingTime(e.target.value)}
                placeholder="09:30 AM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Closing Meeting
              </label>
              <input
                type="text"
                value={closingMeetingTime}
                onChange={(e) => setClosingMeetingTime(e.target.value)}
                placeholder="04:30 PM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Location and Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location Type
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as LocationType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="On-Site">On-Site Audit</option>
                <option value="Hybrid">Hybrid (On-Site & Remote)</option>
                <option value="Remote">Remote Virtual Audit</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Facility Address / Meeting Link *
              </label>
              <input
                type="text"
                required
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
                placeholder="e.g. 12 Marina Boulevard, Jurong Hub 3, Singapore"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Scope & Objectives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit Scope Statement
              </label>
              <textarea
                rows={2}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Areas, departments, processes included in audit scope..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit Objectives
              </label>
              <textarea
                rows={2}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Key assessment goals, compliance thresholds, and deliverables..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Safety Inductions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Safety Inductions / Site Entry Requirements
            </label>
            <input
              type="text"
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="e.g. Cleanroom gowning qualification required. Safety shoes & ear protection required for plant tours."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Managing Body: <strong className="text-slate-800">{firm.code}</strong> • Accreditation Active
            </span>
            <div className="flex items-center gap-2.5">
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
                <span>{editingAudit ? "Update Plan" : `Save & Schedule under ${firm.code}`}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
