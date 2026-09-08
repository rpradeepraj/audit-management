"use client";

import React, { useState } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import { Finding, FindingSeverity, FindingStatus } from "../../shared/types/audit";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  LifeBuoy,
  Paperclip,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Calendar,
  Building2,
  UserCheck,
  FileText,
  ExternalLink,
} from "lucide-react";
import { LogFindingModal } from "../../features/findings/LogFindingModal";

interface FindingsViewProps {
  onOpenAiCapa?: (finding: Finding) => void;
  onBack?: () => void;
  auditId?: string;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  onOpenAiCapa,
  onBack,
  auditId,
}) => {
  const {
    findings,
    audits,
    currentUser,
    activeFindingId,
    setActiveFindingId,
    setActiveTab,
    setActiveCapaId,
    searchQuery,
  } = useAudit();

  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLogFindingModalOpen, setIsLogFindingModalOpen] = useState(false);
  const [selectedDetailFinding, setSelectedDetailFinding] = useState<Finding | null>(null);

  const filteredFindings = findings.filter((f) => {
    if (auditId && f.auditId !== auditId) return false;
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.findingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.requirementId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || f.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case "Critical":
        return "bg-rose-100 text-rose-800 border-rose-200 font-black";
      case "Major":
        return "bg-rose-50 text-rose-700 border-rose-200 font-bold";
      case "Minor":
        return "bg-amber-100 text-amber-800 border-amber-200 font-bold";
      case "Observation":
        return "bg-blue-100 text-blue-800 border-blue-200 font-semibold";
    }
  };

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case "Open":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "CAPA In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Pending Review":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Closed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-rose-200 text-rose-900 border-rose-300";
    }
  };

  // If a detailed finding is selected, show the full detailed view
  if (selectedDetailFinding) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDetailFinding(null)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Findings List</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
                  {selectedDetailFinding.findingNumber}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${getSeverityBadge(selectedDetailFinding.severity)}`}>
                  {selectedDetailFinding.severity} Non-Conformity
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${getStatusBadge(selectedDetailFinding.status)}`}>
                  {selectedDetailFinding.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveCapaId(selectedDetailFinding.id);
                setActiveTab("capa");
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Submit / View CAPA Plan</span>
            </button>
          </div>
        </div>

        {/* Detailed Finding Content */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-6">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Finding Title & Overview
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {selectedDetailFinding.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
              <span>Client: <strong className="text-slate-900">{selectedDetailFinding.customerName}</strong></span>
              <span>Audit Ref: <strong className="text-slate-900 font-mono">{selectedDetailFinding.auditNumber}</strong></span>
              <span>Logged Date: <strong>{selectedDetailFinding.loggedAt}</strong></span>
              <span>Lead Auditor: <strong className="text-slate-900">{selectedDetailFinding.loggedByAuditorName}</strong></span>
            </div>
          </div>

          {/* Key Parameters Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Violated Requirement Clause
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs block">
                {selectedDetailFinding.requirementId}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Category: <strong className="text-slate-700">{selectedDetailFinding.category}</strong>
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Remediation Due Date & Assignee
              </span>
              <span className="font-semibold text-rose-700 text-xs block flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {selectedDetailFinding.dueDate}
              </span>
              <span className="text-[11px] text-slate-600 mt-1 block">
                Assigned Rep: <strong className="text-slate-700">{selectedDetailFinding.assignedToCustomerRepName}</strong>
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Classification & Impact
              </span>
              <span className="font-semibold text-slate-800 text-xs block">
                {selectedDetailFinding.severity} Impact Level
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Workflow Status: <strong className="text-slate-700">{selectedDetailFinding.status}</strong>
              </span>
            </div>
          </div>

          {/* Non-Conformity Description */}
          <div className="space-y-1.5 text-xs">
            <h3 className="text-xs uppercase font-semibold text-slate-900 tracking-wider">
              Non-Conformity Statement & Factual Evidence
            </h3>
            <p className="text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              {selectedDetailFinding.description}
            </p>
          </div>

          {/* Objective Evidence Notes */}
          {selectedDetailFinding.evidenceNotes && (
            <div className="space-y-1.5 text-xs">
              <h3 className="text-xs uppercase font-semibold text-slate-900 tracking-wider">
                Auditor Field Evidence Notes
              </h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                {selectedDetailFinding.evidenceNotes}
              </p>
            </div>
          )}

          {/* Evidence Attachments */}
          {selectedDetailFinding.evidenceAttachments && selectedDetailFinding.evidenceAttachments.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <h3 className="text-xs uppercase font-semibold text-slate-900 tracking-wider">
                Attached Objective Evidence ({selectedDetailFinding.evidenceAttachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {selectedDetailFinding.evidenceAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-slate-800 font-medium truncate text-xs">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{att.fileName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {att.fileSize}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT LIST VIEW (Clean full-width table without descriptions)
  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-in fade-in duration-150">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-2xs shrink-0"
              title="Return to Execution Workstation"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Execution Workstation</span>
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Audit Findings & NCs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {auditId ? `Filtered for Audit Engagement ${audits.find((a) => a.id === auditId)?.auditNumber || auditId}` : "Track deviations against requirements and corrective action workflows."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsLogFindingModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log New Finding</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs font-semibold">
        <span className="text-slate-400 text-[11px] uppercase font-bold mr-1">
          Severity:
        </span>
        {["ALL", "Critical", "Major", "Minor", "Observation"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              severityFilter === sev
                ? "bg-slate-900 text-white font-semibold"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {sev}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-200 mx-2" />

        <span className="text-slate-400 text-[11px] uppercase font-bold mr-1">
          Status:
        </span>
        {["ALL", "Open", "CAPA In Progress", "Pending Review", "Closed"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              statusFilter === st
                ? "bg-slate-900 text-white font-semibold"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Full-Width Findings Table (List item only, without descriptions) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Finding Ref</th>
                <th className="py-3 px-4">Finding Title</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Requirement Clause</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No findings found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => {
                      setActiveFindingId(finding.id);
                      setSelectedDetailFinding(finding);
                    }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Finding Ref */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs inline-block">
                        {finding.findingNumber}
                      </span>
                    </td>

                    {/* Finding Title */}
                    <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs">
                      {finding.title}
                    </td>

                    {/* Client */}
                    <td className="py-3 px-4 font-medium text-slate-800 text-xs whitespace-nowrap">
                      {finding.customerName}
                    </td>

                    {/* Requirement Clause */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-slate-800 text-xs">
                          {finding.requirementId}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {finding.category}
                        </span>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium border inline-block ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 text-xs text-rose-700 font-medium whitespace-nowrap">
                      {finding.dueDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium border inline-block ${getStatusBadge(finding.status)}`}>
                        {finding.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFindingId(finding.id);
                          setSelectedDetailFinding(finding);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Finding Modal */}
      {isLogFindingModalOpen && (
        <LogFindingModal
          isOpen={isLogFindingModalOpen}
          onClose={() => setIsLogFindingModalOpen(false)}
        />
      )}
    </div>
  );
};
