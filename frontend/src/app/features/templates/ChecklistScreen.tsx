"use client";

import React, { useState, useMemo } from "react";
import { AuditTemplate, ChecklistSection, ChecklistQuestion } from "../../shared/types/audit";
import {
  FileSpreadsheet,
  ArrowLeft,
  Calendar,
  Copy,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Award,
  CheckSquare,
  HelpCircle,
  Sliders,
  Check,
  BarChart3,
  BookOpen,
  LayoutGrid,
  List,
  Download,
  Info,
  Building2,
  Tag,
  Share2,
} from "lucide-react";

interface ChecklistScreenProps {
  template: AuditTemplate;
  onBack: () => void;
  onPlanAudit: (template: AuditTemplate) => void;
  onCloneTemplate: (template: AuditTemplate) => void;
}

export const ChecklistScreen: React.FC<ChecklistScreenProps> = ({
  template,
  onBack,
  onPlanAudit,
  onCloneTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [filterMandatoryOnly, setFilterMandatoryOnly] = useState(false);
  const [scoringFilter, setScoringFilter] = useState<"ALL" | "PASS_FAIL" | "COMPLIANCE_RATING">("ALL");
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");

  // Interactive Live Scoring Simulator State
  const [simulatedAnswers, setSimulatedAnswers] = useState<
    Record<string, "PASS" | "FAIL" | "CONFORMING" | "MINOR" | "MAJOR">
  >({});
  const [showSimulator, setShowSimulator] = useState(false);

  // Total stats
  const totalQuestions = useMemo(() => {
    return template.sections.reduce((acc, s) => acc + s.questions.length, 0);
  }, [template]);

  const totalMandatory = useMemo(() => {
    return template.sections.reduce(
      (acc, s) => acc + s.questions.filter((q) => q.mandatory).length,
      0
    );
  }, [template]);

  // Section calculation for active tab
  const activeSectionIndex = template.sections.findIndex((s) => s.id === activeTab);
  const activeSection = activeSectionIndex >= 0 ? template.sections[activeSectionIndex] : null;

  // Filter questions based on search & criteria
  const filterQuestion = (q: ChecklistQuestion) => {
    if (filterMandatoryOnly && !q.mandatory) return false;
    if (scoringFilter !== "ALL" && q.scoringType !== scoringFilter) return false;
    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase();
      const matchText =
        q.question.toLowerCase().includes(query) ||
        q.requirementId.toLowerCase().includes(query) ||
        (q.guidance && q.guidance.toLowerCase().includes(query));
      if (!matchText) return false;
    }
    return true;
  };

  const handleCopyClause = (clauseText: string, id: string) => {
    navigator.clipboard.writeText(clauseText);
    setCopiedClauseId(id);
    setTimeout(() => setCopiedClauseId(null), 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  // Simulator scoring calculation
  const simulationScore = useMemo(() => {
    const answeredKeys = Object.keys(simulatedAnswers);
    if (answeredKeys.length === 0) return null;
    let earned = 0;
    let max = 0;

    template.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        const ans = simulatedAnswers[q.id];
        if (ans) {
          max += q.weight;
          if (ans === "PASS" || ans === "CONFORMING") {
            earned += q.weight;
          } else if (ans === "MINOR") {
            earned += q.weight * 0.5;
          }
        }
      });
    });

    return max > 0 ? Math.round((earned / max) * 100) : 0;
  }, [template, simulatedAnswers]);

  return (
    <div className="w-full min-h-screen bg-slate-50/70 pb-16 animate-in fade-in duration-150">
      {/* Top Sticky Breadcrumbs & Quick Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Back Button & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors shrink-0"
              title="Return to Templates List"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Templates</span>
            </button>

            <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />

            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 truncate">
                {template.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {template.code}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {template.standard}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showSimulator
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSimulator ? "Close Simulator" : "Score Simulator"}</span>
            </button>

            <button
              onClick={() => onCloneTemplate(template)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Clone Template</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors hidden md:flex items-center justify-center"
              title="Print Checklist"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => onPlanAudit(template)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Audit Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Width Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Flagship Header Banner Card */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-4xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {template.standard}
                </span>
                {template.isDefaultIndustryTemplate && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Industry Standard Framework
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {template.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Metric Cards in Ribbon */}
            <div className="grid grid-cols-3 gap-3 lg:min-w-[340px]">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Sections
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {template.sections.length}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Requirements
                </span>
                <span className="text-base sm:text-lg font-black text-indigo-700">
                  {totalQuestions}
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-semibold text-amber-700 block mb-0.5">
                  Mandatory
                </span>
                <span className="text-base sm:text-lg font-black text-amber-800">
                  {totalMandatory}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulator Banner (When Toggled) */}
        {showSimulator && (
          <div className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-indigo-950">
                  Interactive Checklist Scoring Simulator Active
                </h3>
                <p className="text-[11px] sm:text-xs text-indigo-700 mt-0.5">
                  Click the Pass/Fail or Compliance ratings on any clause below to test real-time audit grading.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {simulationScore !== null ? (
                <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-indigo-200 shadow-2xs">
                  <span className="text-xs text-slate-600 font-medium">Calculated Score:</span>
                  <span
                    className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                      simulationScore >= template.passingScore
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {simulationScore}% ({simulationScore >= template.passingScore ? "PASSED" : "FAILED"})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-indigo-600 bg-white/70 px-3 py-1.5 rounded-lg border border-indigo-100 italic">
                  Select ratings on items below to start calculation
                </span>
              )}
              {Object.keys(simulatedAnswers).length > 0 && (
                <button
                  onClick={() => setSimulatedAnswers({})}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 bg-white transition-colors"
                >
                  Reset Scores
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECTION TABS BAR - Full Width Responsive Tabs Strip */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
          {/* Scrollable Horizontal Tabs Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {/* "All Sections" Tab */}
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Sections</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === "all"
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {totalQuestions}
              </span>
            </button>

            {/* Individual Section Tabs */}
            {template.sections.map((sec, idx) => {
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs font-bold ring-2 ring-indigo-400/30"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold opacity-85">
                    Section {idx + 1}
                  </span>
                  <span className="max-w-[200px] truncate">
                    {sec.title.replace(/^Section\s*\d+:\s*/i, "")}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive
                        ? "bg-indigo-700 text-indigo-100"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {sec.questions.length} items
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isActive
                        ? "bg-indigo-800 text-indigo-200"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    }`}
                  >
                    {sec.weight}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter, Search & View Controls Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search requirements by clause ID, keyword, or guidance..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filters & View Density Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilterMandatoryOnly(!filterMandatoryOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  filterMandatoryOnly
                    ? "bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Mandatory Clauses Only</span>
              </button>

              {/* Scoring Type Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setScoringFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    scoringFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setScoringFilter("PASS_FAIL")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    scoringFilter === "PASS_FAIL"
                      ? "bg-white text-indigo-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Pass/Fail
                </button>
                <button
                  onClick={() => setScoringFilter("COMPLIANCE_RATING")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    scoringFilter === "COMPLIANCE_RATING"
                      ? "bg-white text-indigo-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Rating
                </button>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode("detailed")}
                  className={`p-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-all ${
                    viewMode === "detailed" ? "bg-white text-indigo-600 shadow-2xs" : ""
                  }`}
                  title="Detailed View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-all ${
                    viewMode === "compact" ? "bg-white text-indigo-600 shadow-2xs" : ""
                  }`}
                  title="Compact Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FULL WIDTH TAB CONTENT AREA */}
        <div className="w-full space-y-4">
          {/* View Single Active Section Tab */}
          {activeSection && (
            <div className="space-y-4">
              {/* Section Header Card */}
              <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-bold text-sm flex items-center justify-center border border-indigo-100">
                      §
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {activeSection.title}
                      </h2>
                      <span className="text-xs text-slate-500 font-medium">
                        Section {activeSectionIndex + 1} of {template.sections.length} • {activeSection.questions.length} Requirements
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                      Section Weight: {activeSection.weight}% of Total Audit
                    </span>
                  </div>
                </div>

                {activeSection.description && (
                  <p className="text-xs sm:text-sm text-slate-600 pl-11 pt-1 leading-relaxed">
                    {activeSection.description}
                  </p>
                )}
              </div>

              {/* Requirements Cards */}
              <div
                className={
                  viewMode === "compact"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-3"
                    : "space-y-3"
                }
              >
                {activeSection.questions.filter(filterQuestion).length === 0 ? (
                  <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No requirements match your current search/filter criteria in this section.
                  </div>
                ) : (
                  activeSection.questions
                    .filter(filterQuestion)
                    .map((q, qIndex) => (
                      <FullWidthQuestionCard
                        key={q.id}
                        q={q}
                        index={qIndex}
                        viewMode={viewMode}
                        showSimulator={showSimulator}
                        simulatedAnswer={simulatedAnswers[q.id]}
                        onSimulate={(val) =>
                          setSimulatedAnswers((prev) => ({ ...prev, [q.id]: val }))
                        }
                        onCopy={() =>
                          handleCopyClause(
                            `[${q.requirementId}] ${q.question}\nGuidance: ${q.guidance || "N/A"}`,
                            q.id
                          )
                        }
                        isCopied={copiedClauseId === q.id}
                      />
                    ))
                )}
              </div>
            </div>
          )}

          {/* View All Sections Combined */}
          {activeTab === "all" && (
            <div className="space-y-6">
              {template.sections.map((section, secIdx) => {
                const filteredQuestions = section.questions.filter(filterQuestion);
                if (filteredQuestions.length === 0 && searchFilter) return null;

                return (
                  <div key={section.id} className="space-y-3">
                    {/* Section Separator & Header */}
                    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {secIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {section.title}
                          </h3>
                          {section.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTab(section.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 border border-indigo-100 bg-white transition-colors"
                        >
                          <span>Open Section Tab</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                          {section.weight}% Weight
                        </span>
                      </div>
                    </div>

                    {/* Section Questions */}
                    <div
                      className={
                        viewMode === "compact"
                          ? "grid grid-cols-1 md:grid-cols-2 gap-3"
                          : "space-y-3"
                      }
                    >
                      {filteredQuestions.length === 0 ? (
                        <div className="col-span-full bg-white p-6 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs italic">
                          No matching requirements in this section.
                        </div>
                      ) : (
                        filteredQuestions.map((q, qIndex) => (
                          <FullWidthQuestionCard
                            key={q.id}
                            q={q}
                            index={qIndex}
                            viewMode={viewMode}
                            showSimulator={showSimulator}
                            simulatedAnswer={simulatedAnswers[q.id]}
                            onSimulate={(val) =>
                              setSimulatedAnswers((prev) => ({ ...prev, [q.id]: val }))
                            }
                            onCopy={() =>
                              handleCopyClause(
                                `[${q.requirementId}] ${q.question}\nGuidance: ${q.guidance || "N/A"}`,
                                q.id
                              )
                            }
                            isCopied={copiedClauseId === q.id}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation & Actions Bar */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {activeSectionIndex > 0 && (
              <button
                onClick={() => setActiveTab(template.sections[activeSectionIndex - 1].id)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Section ({template.sections[activeSectionIndex - 1].title.substring(0, 20)}...)</span>
              </button>
            )}

            {activeSectionIndex >= 0 && activeSectionIndex < template.sections.length - 1 && (
              <button
                onClick={() => setActiveTab(template.sections[activeSectionIndex + 1].id)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <span>Next Section ({template.sections[activeSectionIndex + 1].title.substring(0, 20)}...)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline pl-2"
              >
                View All Sections
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Back to Templates
            </button>
            <button
              onClick={() => onPlanAudit(template)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Use in Audit Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponent: Full-Width Question Card
interface FullWidthQuestionCardProps {
  q: ChecklistQuestion;
  index: number;
  viewMode: "detailed" | "compact";
  showSimulator: boolean;
  simulatedAnswer?: "PASS" | "FAIL" | "CONFORMING" | "MINOR" | "MAJOR";
  onSimulate: (val: "PASS" | "FAIL" | "CONFORMING" | "MINOR" | "MAJOR") => void;
  onCopy: () => void;
  isCopied: boolean;
}

const FullWidthQuestionCard: React.FC<FullWidthQuestionCardProps> = ({
  q,
  index,
  viewMode,
  showSimulator,
  simulatedAnswer,
  onSimulate,
  onCopy,
  isCopied,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all space-y-3">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs sm:text-sm font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg">
            {q.requirementId || `Q${index + 1}`}
          </span>

          <span
            className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg border uppercase ${
              q.scoringType === "PASS_FAIL"
                ? "bg-slate-50 text-slate-700 border-slate-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {q.scoringType.replace("_", " ")}
          </span>

          {q.mandatory && (
            <span className="text-[10px] sm:text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Mandatory Requirement
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            Weight: {q.weight} pts
          </span>
          <button
            onClick={onCopy}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Copy requirement text to clipboard"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Requirement Statement */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
        {q.question}
      </h3>

      {/* Auditor Guidance Box */}
      {q.guidance && viewMode === "detailed" && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs">
          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 text-[11px] block">
              Auditor Verification & Evidence Notes:
            </span>
            <p className="text-slate-600 text-xs leading-relaxed">{q.guidance}</p>
          </div>
        </div>
      )}

      {/* Live Scoring Simulator Interactive Strip */}
      {showSimulator && (
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-xs font-semibold text-slate-500">Test Rating:</span>
          {q.scoringType === "PASS_FAIL" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSimulate("PASS")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  simulatedAnswer === "PASS"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Pass (+{q.weight})
              </button>
              <button
                onClick={() => onSimulate("FAIL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  simulatedAnswer === "FAIL"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                Fail (0)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onSimulate("CONFORMING")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  simulatedAnswer === "CONFORMING"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Conforming (100%)
              </button>
              <button
                onClick={() => onSimulate("MINOR")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  simulatedAnswer === "MINOR"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                Minor Non-Conf (50%)
              </button>
              <button
                onClick={() => onSimulate("MAJOR")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  simulatedAnswer === "MAJOR"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                Major Non-Conf (0%)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
