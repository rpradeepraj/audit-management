"use client";

import React, { useState } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import { CorrectiveAction, CapaStatus } from "../../shared/types/audit";
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Paperclip,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Send,
  Upload,
  Calendar,
  UserCheck,
} from "lucide-react";
import { EvidenceUploadModal } from "../../shared/components/ui/EvidenceUploadModal";

export const CapaView: React.FC = () => {
  const {
    capas,
    findings,
    currentUser,
    activeCapaId,
    setActiveCapaId,
    submitCapa,
    reviewCapa,
    searchQuery,
  } = useAudit();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedFindingIdForCapa, setSelectedFindingIdForCapa] = useState<string>(findings[0]?.id || "");
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedDetailCapa, setSelectedDetailCapa] = useState<CorrectiveAction | null>(null);

  // Form states for New CAPA
  const [fiveWhys, setFiveWhys] = useState<string[]>([
    "Process execution missed secondary check step",
    "Supervisor was covering dual shifts during plant surge",
    "No digital alert or hard gate in the workflow system",
    "Legacy paper log SOP not updated to digital validation standard",
    "Root training curriculum lacked recurring SOP refresher",
  ]);
  const [rootCause, setRootCause] = useState("");
  const [immediateCorrection, setImmediateCorrection] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [remediationDueDate, setRemediationDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  // Review states
  const [reviewNotes, setReviewNotes] = useState("");

  const filteredCapas = capas.filter((c) => {
    return (
      c.findingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.findingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rootCause.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateCapaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFinding = findings.find((f) => f.id === selectedFindingIdForCapa);
    if (!targetFinding) {
      alert("Please select a target non-conformity finding.");
      return;
    }

    if (!rootCause.trim() || !correctiveAction.trim() || !preventiveAction.trim()) {
      alert("Please complete root cause, corrective action, and preventive action.");
      return;
    }

    submitCapa({
      findingId: targetFinding.id,
      findingNumber: targetFinding.findingNumber,
      findingTitle: targetFinding.title,
      rootCause,
      fiveWhys,
      immediateCorrection,
      correctiveAction,
      preventiveAction,
      remediationDueDate,
      submittedBy: currentUser.name,
      implementationEvidence: [
        {
          id: `ev_capa_${Date.now()}`,
          fileName: "CAPA_Remediation_Verification_Dossier.pdf",
          fileSize: "2.1 MB",
          fileType: "application/pdf",
          uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          uploadedBy: currentUser.name,
          description: "Verified retrained staff logs and updated SOP v3.2",
        },
      ],
    });

    setIsSubmitModalOpen(false);
  };

  const handleReviewAction = (capaId: string, status: "Accepted" | "Rejected") => {
    if (!reviewNotes.trim()) {
      alert("Please provide auditor verification notes before completing the review.");
      return;
    }
    reviewCapa(capaId, status, reviewNotes);
    setReviewNotes("");
    if (selectedDetailCapa && selectedDetailCapa.id === capaId) {
      setSelectedDetailCapa({
        ...selectedDetailCapa,
        status,
        reviewedBy: currentUser.name,
        reviewedAt: new Date().toISOString().substring(0, 10),
        reviewNotes,
      });
    }
  };

  const getStatusBadge = (status: CapaStatus) => {
    switch (status) {
      case "Accepted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-200 font-bold";
      case "Under Verification":
        return "bg-amber-100 text-amber-800 border-amber-200 font-semibold";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200 font-semibold";
    }
  };

  // IF DETAILED CAPA IS SELECTED, RENDER DETAILED VIEW SCREEN
  if (selectedDetailCapa) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDetailCapa(null)}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to CAPA List</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded text-xs">
                CAPA • {selectedDetailCapa.findingNumber}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(selectedDetailCapa.status)}`}>
                {selectedDetailCapa.status}
              </span>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Remediation Due: {selectedDetailCapa.remediationDueDate}</span>
          </div>
        </div>

        {/* Detailed CAPA Inspector */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
              Associated Non-Conformity Finding
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {selectedDetailCapa.findingTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Submitted by: <strong className="text-slate-800">{selectedDetailCapa.submittedBy}</strong> on{" "}
              {selectedDetailCapa.submittedAt}
            </p>
          </div>

          {/* 5-Why RCA Tree */}
          {selectedDetailCapa.fiveWhys && selectedDetailCapa.fiveWhys.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>5-Why Systematic Investigation</span>
                <span className="text-[11px] text-purple-600 font-normal">Root Cause Derivation Steps</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                {selectedDetailCapa.fiveWhys.map((why, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px] shrink-0 font-mono">
                      Why {i + 1}:
                    </span>
                    <span className="text-slate-800 font-medium leading-relaxed">
                      {why.replace(/^Why \d+:\s*/, "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Root Cause Statement */}
          <div className="p-4 sm:p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1.5 text-xs">
            <span className="text-[11px] uppercase font-bold text-purple-900 block">
              Primary Root Cause Finding
            </span>
            <p className="text-purple-950 font-semibold leading-relaxed text-sm">
              {selectedDetailCapa.rootCause}
            </p>
          </div>

          {/* Action Matrix: Immediate vs Corrective vs Preventive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Immediate Correction (Containment)
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {selectedDetailCapa.immediateCorrection || "Direct containment applied on active inventory."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Corrective Action (Prevent Recurrence)
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {selectedDetailCapa.correctiveAction}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Preventive Action (Systemic Safeguard)
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {selectedDetailCapa.preventiveAction}
              </p>
            </div>
          </div>

          {/* Implementation Proof Attachments */}
          {selectedDetailCapa.implementationEvidence && selectedDetailCapa.implementationEvidence.length > 0 && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Implementation Evidence & Verification Proof
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedDetailCapa.implementationEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-slate-800 font-semibold truncate text-xs">
                      <Paperclip className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate">{ev.fileName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ev.fileSize}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auditor Verification / Sign-off Box */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Lead Auditor & Manager Verification
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Current Status: {selectedDetailCapa.status}
              </span>
            </div>

            {selectedDetailCapa.status === "Accepted" ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-700/50 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CAPA Verification Accepted & Finding Closed</span>
                </div>
                <p className="text-emerald-200 text-[11px]">
                  Auditor Reviewer: <strong>{selectedDetailCapa.reviewedBy}</strong> on {selectedDetailCapa.reviewedAt}
                </p>
                <p className="text-emerald-300/80 text-[11px] italic mt-1">
                  "{selectedDetailCapa.reviewNotes}"
                </p>
              </div>
            ) : selectedDetailCapa.status === "Rejected" ? (
              <div className="p-4 bg-rose-950/80 border border-rose-700/50 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                  <XCircle className="w-4 h-4" />
                  <span>CAPA Plan Rejected - Re-submission Required</span>
                </div>
                <p className="text-rose-200 text-[11px]">
                  Feedback from {selectedDetailCapa.reviewedBy}: "{selectedDetailCapa.reviewNotes}"
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Auditor Verification Statement & Effectiveness Notes *
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Verify whether documented root cause and preventive measures provide sufficient assurance of non-recurrence..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleReviewAction(selectedDetailCapa.id, "Rejected")}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject & Request Revision</span>
                  </button>
                  <button
                    onClick={() => handleReviewAction(selectedDetailCapa.id, "Accepted")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept & Close Finding</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT LIST VIEW (Clean full-width table without descriptions)
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>CAPA Resolution & Root Cause Engineering</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Corrective & Preventive Actions (CAPA)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute 5-Why root cause investigations, preventive plans, implementation evidence, and manager verification sign-offs.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-200 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Formulate CAPA Plan</span>
        </button>
      </div>

      {/* Full-Width CAPA Table (List item only, without descriptions) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-5">CAPA Ref</th>
                <th className="py-3.5 px-4 sm:px-5">Finding Title</th>
                <th className="py-3.5 px-4 sm:px-5">Submitted By</th>
                <th className="py-3.5 px-4 sm:px-5">Submission Date</th>
                <th className="py-3.5 px-4 sm:px-5">Remediation Due</th>
                <th className="py-3.5 px-4 sm:px-5">Status</th>
                <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCapas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No CAPA records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredCapas.map((capa) => (
                  <tr
                    key={capa.id}
                    onClick={() => {
                      setActiveCapaId(capa.id);
                      setSelectedDetailCapa(capa);
                    }}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                  >
                    {/* CAPA Ref */}
                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-xs inline-block">
                        {capa.findingNumber}
                      </span>
                    </td>

                    {/* Finding Title */}
                    <td className="py-3.5 px-4 sm:px-5 font-bold text-slate-900 group-hover:text-purple-600 transition-colors text-xs sm:text-sm">
                      {capa.findingTitle}
                    </td>

                    {/* Submitted By */}
                    <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-800 text-xs whitespace-nowrap">
                      {capa.submittedBy}
                    </td>

                    {/* Submission Date */}
                    <td className="py-3.5 px-4 sm:px-5 text-xs text-slate-500 whitespace-nowrap">
                      {capa.submittedAt}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 sm:px-5 text-xs text-rose-600 font-semibold whitespace-nowrap">
                      {capa.remediationDueDate}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border inline-block ${getStatusBadge(capa.status)}`}>
                        {capa.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCapaId(capa.id);
                          setSelectedDetailCapa(capa);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 cursor-pointer"
                      >
                        Review / Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit New CAPA Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-150 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Formulate Corrective & Preventive Action Plan (CAPA)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Structured 8D containment, root cause determination, and preventive measure workflows
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCapaSubmit} className="flex-1 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Select Target Non-Conformity *
                  </label>
                  <select
                    value={selectedFindingIdForCapa}
                    onChange={(e) => setSelectedFindingIdForCapa(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {findings.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.findingNumber} - {f.title} ({f.severity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Implementation Due Date *
                  </label>
                  <input
                    type="date"
                    value={remediationDueDate}
                    onChange={(e) => setRemediationDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* 5-Why inputs */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 text-sm">
                  5-Why Root Cause Investigation Steps
                </label>
                <div className="space-y-2">
                  {fiveWhys.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-purple-700 w-14 shrink-0">
                        Why {idx + 1}:
                      </span>
                      <input
                        type="text"
                        value={w}
                        onChange={(e) => {
                          const updated = [...fiveWhys];
                          updated[idx] = e.target.value;
                          setFiveWhys(updated);
                        }}
                        className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">
                  Comprehensive Root Cause Summary *
                </label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="State the underlying systemic cause that allowed this deviation to occur..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Immediate Correction (Containment)
                  </label>
                  <textarea
                    rows={2}
                    value={immediateCorrection}
                    onChange={(e) => setImmediateCorrection(e.target.value)}
                    placeholder="Describe direct remediation taken on affected product/records..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Corrective Action (Recurrence Prevention) *
                  </label>
                  <textarea
                    rows={2}
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    placeholder="Describe procedural changes and staff re-certification..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">
                  Preventive Action (Systemic Safeguard) *
                </label>
                <textarea
                  rows={2}
                  value={preventiveAction}
                  onChange={(e) => setPreventiveAction(e.target.value)}
                  placeholder="Describe software validation hard-gates, automated alerts, or quarterly sampling..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Submit CAPA for Verification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
