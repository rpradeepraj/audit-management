"use client";

import React from "react";
import { AuditPlan, AuditFirm } from "../../shared/types/audit";
import {
  X,
  Printer,
  ArrowRight,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";

interface AuditDetailModalProps {
  audit: AuditPlan;
  firm: AuditFirm;
  onClose: () => void;
  onLaunchExecution: (auditId: string) => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  audit,
  firm,
  onClose,
  onLaunchExecution,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl xl:max-w-6xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              {firm.code.split("-")[0]}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Official Audit Engagement Plan & Itinerary
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit Ref: <strong className="font-mono text-indigo-700">{audit.auditNumber}</strong> • {firm.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dossier Body */}
        <div className="space-y-4 text-xs">
          {/* Engagement Overview Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-black text-sm text-slate-900 leading-snug">
                {audit.title}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                {audit.auditType}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 text-[11px] flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Lead Auditor</span>
                <strong className="text-slate-800">{audit.leadAuditorName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Engagement Status</span>
                <strong className="text-emerald-700">{audit.status}</strong>
              </div>
            </div>
          </div>

          {/* Schedule & Logistics */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Timeline & Daily Session Schedule</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-[11px]">
              <div>
                <span className="text-slate-400 block">Dates:</span>
                <span className="font-bold text-slate-800">
                  {audit.startDate} to {audit.endDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Opening Meeting:</span>
                <span className="font-bold text-slate-800">
                  {audit.openingMeetingTime || "09:30 AM"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Closing Meeting:</span>
                <span className="font-bold text-slate-800">
                  {audit.closingMeetingTime || "04:30 PM"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 pt-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Location: {audit.facilityAddress || audit.location}</span>
            </div>
          </div>

          {/* Scope and Objectives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Scope of Assessment</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {audit.scope || "Operational units, facilities, and processes governed by the standard."}
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Audit Objectives</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {audit.objectives || "Assess compliance, verify statutory records, and identify non-conformities."}
              </p>
            </div>
          </div>

          {/* Sample Daily Agenda Milestones */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">Engagement Execution Itinerary</span>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-black rounded text-[10px]">
                  Day 1
                </span>
                <div>
                  <div className="font-bold text-slate-800">
                    Opening Conference & Management Governance Review
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Opening meeting at {audit.openingMeetingTime || "09:30 AM"}. Quality policy review, organigram inspection, risk register review.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-black rounded text-[10px]">
                  Day 2
                </span>
                <div>
                  <div className="font-bold text-slate-800">
                    Operational Walkthrough & Objective Evidence Verification
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Physical walkthrough of facility floors, equipment calibration log inspection, operator interviews, and process traceability checks.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-black rounded text-[10px]">
                  Day 3
                </span>
                <div>
                  <div className="font-bold text-slate-800">
                    Findings Consolidation & Formal Exit Conference
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Lead auditor synthesis of non-conformances (NCRs/OFIs). Formal closing conference at {audit.closingMeetingTime || "04:30 PM"} with executive team.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Protocol notes */}
          {audit.scheduleNotes && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Safety & Entry Inductions:</strong>
                <span>{audit.scheduleNotes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dossier Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onLaunchExecution(audit.id);
                onClose();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Launch Execution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
