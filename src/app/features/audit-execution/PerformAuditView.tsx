"use client";

import React, { useState } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import {
  AuditPlan,
  ChecklistResponse,
  EvidenceAttachment,
  ResponseStatus,
} from "../../shared/types/audit";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Paperclip,
  Upload,
  Sparkles,
  Save,
  Send,
  ArrowLeft,
  Filter,
  FileCheck2,
  TrendingUp,
  Percent,
  Layers,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { LogFindingModal } from "../../features/findings/LogFindingModal";
import { EvidenceUploadModal } from "../../shared/components/ui/EvidenceUploadModal";
import { FindingsView } from "../../features/findings/FindingsView";
import { AuditReportView } from "../../features/reports/AuditReportView";

export const NC_SEVERITY_OPTIONS = [
  "Critical Severity",
  "High Risk",
  "Medium Risk",
  "Low / Isolated",
  "Process Deviation",
  "Documentation & Records Gap",
  "Regulatory / Statutory Risk",
  "Operational Control Failure",
  "Safety / Product Integrity",
];

export interface PerformAuditViewProps {
  auditId?: string | null;
  onBack?: () => void;
}

export const PerformAuditView: React.FC<PerformAuditViewProps> = ({
  auditId,
  onBack,
}) => {
  const {
    audits,
    templates,
    activeAuditId,
    setActiveAuditId,
    updateAuditResponse,
    completeAuditExecution,
    currentUser,
    setActiveTab,
  } = useAudit();

  const [selectedAuditId, setSelectedAuditId] = useState<string>(
    auditId || activeAuditId || audits[0]?.id || ""
  );
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [workstationMode, setWorkstationMode] = useState<"checklist" | "findings" | "report">("checklist");
  const [isLogFindingModalOpen, setIsLogFindingModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [targetQuestionForFinding, setTargetQuestionForFinding] = useState<{
    id: string;
    requirementId: string;
    notes: string;
  } | null>(null);
  const [targetQuestionForEvidence, setTargetQuestionForEvidence] = useState<string | null>(null);

  // Sync if auditId prop changes externally
  React.useEffect(() => {
    if (auditId) {
      setSelectedAuditId(auditId);
      setActiveSectionIndex(0);
    }
  }, [auditId]);

  // Current active audit resolution
  const currentAudit =
    audits.find((a) => a.id === selectedAuditId) ||
    audits.find((a) => a.id === auditId) ||
    audits.find((a) => a.id === activeAuditId) ||
    audits[0];

  // Dynamic audit switching handler
  const handleSwitchAudit = (newId: string) => {
    setSelectedAuditId(newId);
    setActiveAuditId(newId);
    setActiveSectionIndex(0);
  };

  // Filter selectable audits to the current firm's audits (or all audits if no firm assigned)
  const firmAudits = currentAudit?.firmId
    ? audits.filter((a) => a.firmId === currentAudit.firmId)
    : audits;
  const selectableAudits = firmAudits.length > 0 ? firmAudits : audits;
  
  // Resolve templates (support multiple chosen templates)
  const resolvedTemplates = (currentAudit?.templateIds && currentAudit.templateIds.length > 0)
    ? templates.filter((t) => currentAudit.templateIds?.includes(t.id))
    : [templates.find((t) => t.id === currentAudit?.templateId) || templates[0]].filter(Boolean);
  
  const activeTemplates = resolvedTemplates.length > 0 ? resolvedTemplates : [templates[0]];
  const allSections = activeTemplates.flatMap((tmpl) =>
    tmpl.sections.map((sec) => ({
      ...sec,
      templateTitle: tmpl.title,
      templateStandard: tmpl.standard,
    }))
  );

  if (!currentAudit) {
    return (
      <div className="p-8 text-center text-slate-500">
        <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-800 text-base">No Audit Selected for Execution</h3>
        <p className="text-xs text-slate-500 mt-1">Please plan or select an audit to launch the workstation.</p>
        <button
          onClick={() => setActiveTab("planning")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Go to Audit Planning
        </button>
      </div>
    );
  }

  // Calculate stats
  const totalQuestions = allSections.reduce((acc, s) => acc + s.questions.length, 0);
  const responses = currentAudit.responses || {};
  const answeredQuestionsCount = Object.keys(responses).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestionsCount / totalQuestions) * 100) : 0;

  const safeSectionIndex = Math.min(activeSectionIndex, Math.max(0, allSections.length - 1));
  const currentSection = allSections[safeSectionIndex] || allSections[0];

  const handleResponseChange = (questionId: string, status: ResponseStatus, score?: number) => {
    const existing = responses[questionId];
    let defaultSeverities = existing?.severities;
    if (!defaultSeverities || defaultSeverities.length === 0) {
      if (status === "MINOR_NC") {
        defaultSeverities = ["Medium Risk", "Process Deviation"];
      } else if (status === "MAJOR_NC") {
        defaultSeverities = ["Critical Severity", "Regulatory / Statutory Risk"];
      }
    }

    updateAuditResponse(currentAudit.id, questionId, {
      status,
      score: score !== undefined ? score : (status === "PASS" ? 100 : status === "MINOR_NC" ? 60 : status === "MAJOR_NC" ? 0 : 100),
      notes: existing?.notes || "",
      evidenceFiles: existing?.evidenceFiles || [],
      severities: (status === "MINOR_NC" || status === "MAJOR_NC") ? defaultSeverities : [],
      severityTags: (status === "MINOR_NC" || status === "MAJOR_NC") ? defaultSeverities : [],
    });
  };

  const handleToggleSeverity = (questionId: string, severityName: string) => {
    const existing = responses[questionId];
    const currentSeverities = existing?.severities || [];
    const updated = currentSeverities.includes(severityName)
      ? currentSeverities.filter((s) => s !== severityName)
      : [...currentSeverities, severityName];

    updateAuditResponse(currentAudit.id, questionId, {
      status: existing?.status || "MINOR_NC",
      score: existing?.score,
      notes: existing?.notes || "",
      evidenceFiles: existing?.evidenceFiles || [],
      severities: updated,
      severityTags: updated,
    });
  };

  const handleNotesChange = (questionId: string, notes: string) => {
    const existing = responses[questionId];
    updateAuditResponse(currentAudit.id, questionId, {
      status: existing?.status || "PASS",
      score: existing?.score !== undefined ? existing.score : 100,
      notes,
      evidenceFiles: existing?.evidenceFiles || [],
      severities: existing?.severities,
      severityTags: existing?.severityTags,
    });
  };

  const handleAddEvidence = (questionId: string, attachment: EvidenceAttachment) => {
    const existing = responses[questionId];
    const currentFiles = existing?.evidenceFiles || [];
    updateAuditResponse(currentAudit.id, questionId, {
      status: existing?.status || "PASS",
      score: existing?.score !== undefined ? existing.score : 100,
      notes: existing?.notes || "",
      evidenceFiles: [...currentFiles, attachment],
      severities: existing?.severities,
      severityTags: existing?.severityTags,
    });
  };

  const handleTriggerFindingModal = (qId: string, reqId: string, notes: string) => {
    setTargetQuestionForFinding({
      id: qId,
      requirementId: reqId,
      notes,
    });
    setIsLogFindingModalOpen(true);
  };

  const handleSubmitAudit = () => {
    if (answeredQuestionsCount < totalQuestions) {
      if (!confirm(`You have completed ${answeredQuestionsCount} of ${totalQuestions} checklist items. Do you want to submit for review anyway?`)) {
        return;
      }
    }
    completeAuditExecution(currentAudit.id);
    setWorkstationMode("report");
  };

  if (workstationMode === "findings") {
    return (
      <FindingsView
        auditId={currentAudit.id}
        onBack={() => setWorkstationMode("checklist")}
      />
    );
  }

  if (workstationMode === "report") {
    return (
      <AuditReportView
        auditId={currentAudit.id}
        onBack={() => setWorkstationMode("checklist")}
      />
    );
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-150">
      {/* ========================================================================= */}
      {/* TOP PINNED WORKSTATION HEADER & STEPPER BAR */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-5 pb-2 space-y-3 shrink-0 bg-slate-50 border-b border-slate-200">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  setActiveTab("planning");
                }
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-2xs"
              title="Exit Execution Workstation and return to Audit Planning"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Audit Planning</span>
            </button>

            <div className="flex items-center gap-2 pl-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">Audit Execution:</span>
              <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentAudit.auditNumber}
              </span>
              <span className="text-slate-500 hidden md:inline">
                — {currentAudit.customerName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600 text-xs whitespace-nowrap">
              Switch Active Audit:
            </label>
            <select
              value={currentAudit.id}
              onChange={(e) => handleSwitchAudit(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-slate-900 transition-colors cursor-pointer"
            >
              {selectableAudits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.auditNumber} - {a.customerName} ({a.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workstation Header Details & Progress Pill */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {currentAudit.auditNumber}
              </span>
              <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                {currentAudit.status} Workstation
              </span>
              <span className="text-xs text-slate-500">
                Standard: <strong className="text-slate-700">{currentAudit.standard}</strong>
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {currentAudit.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span>Customer: <strong className="text-slate-800">{currentAudit.customerName}</strong></span>
              <span>Lead Auditor: <strong className="text-slate-800">{currentAudit.leadAuditorName}</strong></span>
              <span>Date: {currentAudit.startDate}</span>
            </div>
          </div>

          {/* Audit Progress & Score Pill */}
          <div className="flex items-center gap-4 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-500">
                Live Score
              </div>
              <div className="text-lg font-bold text-slate-900">
                {currentAudit.overallScore || 0}%
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center justify-between gap-2">
                <span>Checklist Progress</span>
                <span className="font-mono text-slate-800 font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-32 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {answeredQuestionsCount} of {totalQuestions} evaluated
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION STEPPER BAR (Full-Width Stepper Functionality) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full py-0.5 scrollbar-thin">
              {allSections.map((sec, idx) => {
                const isActive = idx === activeSectionIndex;
                const sectionQuestions = sec.questions;
                const answeredInSec = sectionQuestions.filter((q) => !!responses[q.id]).length;
                const isSecComplete = answeredInSec === sectionQuestions.length;

                return (
                  <React.Fragment key={`${sec.id}_${idx}`}>
                    <button
                      onClick={() => setActiveSectionIndex(idx)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left shrink-0 border ${
                        isActive
                          ? "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20 font-bold"
                          : isSecComplete
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {/* Step Circle Badge */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 transition-colors ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-xs"
                            : isSecComplete
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isSecComplete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                      </div>

                      {/* Step Title & Progress */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Section {idx + 1}
                          </span>
                          {activeTemplates.length > 1 && (
                            <span className="font-mono text-[9px] font-bold bg-slate-200/80 text-slate-600 px-1 rounded">
                              {sec.templateStandard}
                            </span>
                          )}
                        </div>
                        <div className={`text-xs truncate max-w-[200px] sm:max-w-[260px] leading-tight ${
                          isActive ? "text-indigo-950 font-bold" : "text-slate-800 font-semibold"
                        }`}>
                          {sec.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                          <span className={`font-mono ${
                            isSecComplete ? "text-emerald-700 font-bold" : "text-slate-500"
                          }`}>
                            {answeredInSec}/{sectionQuestions.length} answered
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">{sec.weight}% wt</span>
                        </div>
                      </div>
                    </button>

                    {/* Stepper Connecting Arrow / Line */}
                    {idx < allSections.length - 1 && (
                      <div className="hidden sm:flex items-center shrink-0">
                        <div
                          className={`h-0.5 w-4 lg:w-8 rounded-full transition-colors ${
                            isSecComplete ? "bg-emerald-400" : "bg-slate-200"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Stepper Previous / Next Controls */}
            <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200">
              <button
                disabled={activeSectionIndex === 0}
                onClick={() => setActiveSectionIndex((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Section"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={activeSectionIndex === allSections.length - 1}
                onClick={() => setActiveSectionIndex((prev) => Math.min(allSections.length - 1, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Section"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Scrollable Questions Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
        {/* Active Section Info Header */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px]">
                Section {safeSectionIndex + 1} of {allSections.length}
              </span>
              <span>{currentSection.title}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentSection.description}</p>
          </div>
          <span className="text-xs font-mono font-semibold bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
            Section Weight: {currentSection.weight}%
          </span>
        </div>

        {/* Questions Checklist Items List (Full Width) */}
        <div className="space-y-3.5">
          {currentSection.questions.map((q, qIndex) => {
            const resp = responses[q.id];
            const currentStatus = resp?.status;
            const currentScore = resp?.score !== undefined ? resp.score : 100;
            const notes = resp?.notes || "";
            const evidenceList = resp?.evidenceFiles || [];

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-colors ${
                  currentStatus === "PASS"
                    ? "bg-emerald-50/20 border-emerald-200"
                    : currentStatus === "MAJOR_NC"
                    ? "bg-rose-50/20 border-rose-200"
                    : currentStatus === "MINOR_NC"
                    ? "bg-amber-50/20 border-amber-200"
                    : currentStatus === "NOT_APPLICABLE"
                    ? "bg-slate-50 border-slate-200 opacity-75"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                {/* Question Clause Code, Points, Mandatory & Response Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {q.requirementId}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Weight: {q.weight} pts
                    </span>
                    {q.mandatory && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        Mandatory Clause
                      </span>
                    )}
                  </div>

                  {/* Response Toggle Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleResponseChange(q.id, "PASS")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        currentStatus === "PASS"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Conform</span>
                    </button>

                    <button
                      onClick={() => handleResponseChange(q.id, "MINOR_NC")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        currentStatus === "MINOR_NC"
                          ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Minor NC</span>
                    </button>

                    <button
                      onClick={() => handleResponseChange(q.id, "MAJOR_NC")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        currentStatus === "MAJOR_NC"
                          ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Major NC</span>
                    </button>

                    <button
                      onClick={() => handleResponseChange(q.id, "NOT_APPLICABLE")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        currentStatus === "NOT_APPLICABLE"
                          ? "bg-slate-700 text-white border-slate-700"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>N/A</span>
                    </button>
                  </div>
                </div>

                {/* Requirement Prompt */}
                <div className="mt-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h4>
                  {q.guidance && (
                    <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Verification Criteria:</strong>{" "}
                        {q.guidance}
                      </div>
                    </div>
                  )}
                </div>

                {/* Auditor Field Observation Notes */}
                <div className="mt-3">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Auditor Field Observations & Record Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => handleNotesChange(q.id, e.target.value)}
                    placeholder="Record sampled document serial numbers, interviewed operators, observed deviations or confirmed practices..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 shadow-2xs"
                  />
                </div>

                {/* Severity Multi-Select Section for Minor NC / Major NC */}
                {(currentStatus === "MINOR_NC" || currentStatus === "MAJOR_NC") && (
                  <div
                    className={`mt-3 p-3 rounded-xl border transition-all ${
                      currentStatus === "MAJOR_NC"
                        ? "bg-rose-50/60 border-rose-200"
                        : "bg-amber-50/60 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <ShieldAlert
                          className={`w-4 h-4 ${
                            currentStatus === "MAJOR_NC" ? "text-rose-600" : "text-amber-600"
                          }`}
                        />
                        <span
                          className={
                            currentStatus === "MAJOR_NC" ? "text-rose-950" : "text-amber-950"
                          }
                        >
                          {currentStatus === "MAJOR_NC"
                            ? "Major NC Severity Classification (Multi-Select)"
                            : "Minor NC Severity Classification (Multi-Select)"}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          currentStatus === "MAJOR_NC"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {resp?.severities?.length || 0} Selected
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {NC_SEVERITY_OPTIONS.map((severityOpt) => {
                        const isSelected = (resp?.severities || []).includes(severityOpt);
                        return (
                          <button
                            key={severityOpt}
                            type="button"
                            onClick={() => handleToggleSeverity(q.id, severityOpt)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                              isSelected
                                ? currentStatus === "MAJOR_NC"
                                  ? "bg-rose-600 text-white border-rose-600"
                                  : "bg-amber-600 text-white border-amber-600"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{severityOpt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Row: Evidence and Findings */}
                <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetQuestionForEvidence(q.id);
                        setIsEvidenceModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>Attach Evidence ({evidenceList.length})</span>
                    </button>

                    {(currentStatus === "MINOR_NC" || currentStatus === "MAJOR_NC") && (
                      <button
                        onClick={() =>
                          handleTriggerFindingModal(q.id, q.requirementId, notes)
                        }
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Log Finding Form</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Status: <strong className="text-slate-700">{currentStatus || "UNANSWERED"}</strong>
                  </div>
                </div>

                {/* Attached Evidence List */}
                {evidenceList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {evidenceList.map((ev) => (
                      <div
                        key={ev.id}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-800 font-medium flex items-center gap-1.5"
                      >
                        <Paperclip className="w-3 h-3 text-slate-500" />
                        <span>{ev.fileName}</span>
                        <span className="text-slate-400">({ev.fileSize})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM PINNED ACTION FOOTER */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:px-6 bg-white border-t border-slate-200 shadow-xl shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
        <div className="text-xs text-slate-600">
          Evaluated <strong className="text-slate-900">{answeredQuestionsCount}</strong> of{" "}
          <strong className="text-slate-900">{totalQuestions}</strong> items. Current compliance score:{" "}
          <strong className="text-slate-900 font-bold">{currentAudit.overallScore || 0}%</strong>.
        </div>

        <div className="flex items-center gap-2">
          {/* Stepper Next / Prev quick jump */}
          {activeSectionIndex < allSections.length - 1 ? (
            <button
              onClick={() => setActiveSectionIndex((prev) => Math.min(allSections.length - 1, prev + 1))}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next Section</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : null}

          <button
            onClick={() => setWorkstationMode("findings")}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Review Findings
          </button>

          <button
            onClick={handleSubmitAudit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Complete & Submit Audit</span>
          </button>
        </div>
      </div>

      {/* Log Finding Modal */}
      {isLogFindingModalOpen && targetQuestionForFinding && (
        <LogFindingModal
          isOpen={isLogFindingModalOpen}
          onClose={() => {
            setIsLogFindingModalOpen(false);
            setTargetQuestionForFinding(null);
          }}
          defaultAuditId={currentAudit.id}
          defaultQuestionId={targetQuestionForFinding.id}
          defaultRequirementId={targetQuestionForFinding.requirementId}
          defaultNotes={targetQuestionForFinding.notes}
        />
      )}

      {/* Evidence Upload Modal */}
      {isEvidenceModalOpen && targetQuestionForEvidence && (
        <EvidenceUploadModal
          isOpen={isEvidenceModalOpen}
          onClose={() => {
            setIsEvidenceModalOpen(false);
            setTargetQuestionForEvidence(null);
          }}
          onAddAttachment={(attachment) => {
            handleAddEvidence(targetQuestionForEvidence, attachment);
          }}
        />
      )}
    </div>
  );
};
