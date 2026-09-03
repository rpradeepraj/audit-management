import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import {
  X,
  Sparkles,
  FileSpreadsheet,
  LifeBuoy,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { aiService } from "../../services/aiService";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "template" | "capa" | "report" | "risk";
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "template",
}) => {
  const { addTemplate, audits, customers, currentUser, setActiveTab, setActiveAuditId } = useAudit();
  const [tab, setTab] = useState<"template" | "capa" | "report" | "risk">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  // Template gen
  const [tmplTitle, setTmplTitle] = useState("ISO 27001 Cloud Security & Privacy Audit");
  const [tmplIndustry, setTmplIndustry] = useState("Cloud SaaS & Fintech");
  const [tmplStandard, setTmplStandard] = useState("ISO/IEC 27001:2022");
  const [tmplScope, setTmplScope] = useState("AWS Cloud Infrastructure, CI/CD, and Data Privacy Controls");

  // CAPA gen
  const [findingTitle, setFindingTitle] = useState("Missing Secondary Sign-offs on Cold-Chain Temperature Logs");
  const [findingDesc, setFindingDesc] = useState("Physical temperature logs in Warehouse Bay 4 lacked mandatory QA supervisor sign-off on 3 dates in July.");
  const [findingSeverity, setFindingSeverity] = useState("Major");
  const [findingClause, setFindingClause] = useState("ISO 9001: Clause 8.1");

  // Report Summary gen
  const [selectedAuditForReport, setSelectedAuditForReport] = useState(audits[0]?.id || "");

  // Risk Advisor
  const [selectedCustomerForRisk, setSelectedCustomerForRisk] = useState(customers[0]?.id || "");

  if (!isOpen) return null;

  const handleGenerateTemplate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await aiService.generateTemplate({
        title: tmplTitle,
        industry: tmplIndustry,
        standard: tmplStandard,
        scope: tmplScope,
        questionsCount: 8,
      });
      setResult(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyGeneratedTemplate = () => {
    if (!result) return;
    addTemplate({
      title: result.title || tmplTitle,
      code: `TMPL-AI-${Math.floor(100 + Math.random() * 900)}`,
      description: result.description || "AI-generated checklist template.",
      standard: result.standard || tmplStandard,
      industry: result.industry || tmplIndustry,
      version: "1.0",
      passingScore: result.passingScore || 80,
      tags: ["AI-Generated", tmplStandard.split(" ")[0]],
      createdBy: currentUser.name,
      sections: result.sections || [],
    });
    alert("Audit Template successfully added to your template library!");
    onClose();
    setActiveTab("templates");
  };

  const handleGenerateCapa = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await aiService.analyzeFinding({
        findingTitle,
        description: findingDesc,
        severity: findingSeverity,
        standardClause: findingClause,
      });
      setResult(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReportSummary = async () => {
    const audit = audits.find((a) => a.id === selectedAuditForReport);
    if (!audit) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiService.generateReportSummary({
        auditTitle: audit.title,
        customerName: audit.customerName,
        standard: audit.standard,
        totalScore: audit.overallScore || 85,
        passedQuestions: Object.values(audit.responses || {}).filter((r: any) => r?.status === "PASS").length,
        failedQuestions: Object.values(audit.responses || {}).filter((r: any) => r?.status === "MAJOR_NC" || r?.status === "MINOR_NC").length,
        findingsSummary: [
          { severity: "Major", count: audit.findingsCount.major },
          { severity: "Minor", count: audit.findingsCount.minor },
        ],
        leadAuditor: audit.leadAuditorName,
      });
      setResult(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRiskAdvice = async () => {
    const cust = customers.find((c) => c.id === selectedCustomerForRisk);
    if (!cust) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiService.getRiskAdvice({
        customerName: cust.name,
        industry: cust.industry,
        previousAuditScore: cust.complianceRating,
        pastIncidents: "Minor cold-chain temperature deviations recorded in past surveillance cycle",
        plannedStandard: "ISO 9001 & ISO 27001",
      });
      setResult(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-violet-300 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Veritas AI Audit Copilot</span>
                <span className="text-xs bg-violet-500/40 text-violet-200 px-2.5 py-0.5 rounded-full font-mono border border-violet-400/30">
                  Gemini 3.7
                </span>
              </h3>
              <p className="text-xs text-violet-200">
                AI assistance for templates, 5-Why root cause analysis, executive summaries & risk intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2.5 gap-3 text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setTab("template");
              setResult(null);
            }}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              tab === "template"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Audit Template</span>
          </button>
          <button
            onClick={() => {
              setTab("capa");
              setResult(null);
            }}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              tab === "capa"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>5-Why & CAPA Assistant</span>
          </button>
          <button
            onClick={() => {
              setTab("report");
              setResult(null);
            }}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              tab === "report"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Executive Report Summary</span>
          </button>
          <button
            onClick={() => {
              setTab("risk");
              setResult(null);
            }}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              tab === "risk"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Risk & Scope Advisor</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm space-y-4">
          {/* TAB 1: TEMPLATE GENERATOR */}
          {tab === "template" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Template Title
                  </label>
                  <input
                    type="text"
                    value={tmplTitle}
                    onChange={(e) => setTmplTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Standard / Framework
                  </label>
                  <input
                    type="text"
                    value={tmplStandard}
                    onChange={(e) => setTmplStandard(e.target.value)}
                    placeholder="e.g. ISO 9001:2015, SOC 2, HIPAA, GMP"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Target Industry
                  </label>
                  <input
                    type="text"
                    value={tmplIndustry}
                    onChange={(e) => setTmplIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Audit Scope & Focus
                  </label>
                  <input
                    type="text"
                    value={tmplScope}
                    onChange={(e) => setTmplScope(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateTemplate}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gemini is generating structured checklist & clauses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Structured Checklist Template</span>
                  </>
                )}
              </button>

              {result && result.sections && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{result.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">{result.description}</p>
                    </div>
                    <button
                      onClick={handleApplyGeneratedTemplate}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Save into Templates
                    </button>
                  </div>

                  <div className="space-y-3 mt-2">
                    {result.sections.map((sec: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                          <span>{sec.title}</span>
                          <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded font-mono">
                            Weight: {sec.weight}%
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">{sec.description}</p>
                        <div className="mt-3 pl-3 border-l-2 border-indigo-200 space-y-2">
                          {sec.questions.map((q: any, qidx: number) => (
                            <div key={qidx} className="text-xs text-slate-700">
                              <span className="font-semibold text-indigo-700 mr-1.5">
                                [{q.requirementId}]
                              </span>
                              {q.question}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 5-WHY & CAPA ASSISTANT */}
          {tab === "capa" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Finding Title
                  </label>
                  <input
                    type="text"
                    value={findingTitle}
                    onChange={(e) => setFindingTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">
                    Standard Requirement Clause
                  </label>
                  <input
                    type="text"
                    value={findingClause}
                    onChange={(e) => setFindingClause(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">
                  Non-Conformity Description & Notes
                </label>
                <textarea
                  rows={2}
                  value={findingDesc}
                  onChange={(e) => setFindingDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleGenerateCapa}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing 5 Whys & formulating CAPA remediation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Perform 5-Why RCA & Formulate CAPA Plan</span>
                  </>
                )}
              </button>

              {result && result.fiveWhys && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      5-Why Root Cause Analysis (RCA)
                    </span>
                    <button
                      onClick={() => handleCopyText(JSON.stringify(result, null, 2))}
                      className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-xs"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy JSON"}
                    </button>
                  </div>

                  <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                    {result.fiveWhys.map((why: string, i: number) => (
                      <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="font-bold text-indigo-600 shrink-0">W{i + 1}:</span>
                        <span>{why.replace(/^Why \d+:\s*/, "")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-violet-50/80 border border-violet-200 rounded-xl">
                    <div className="font-bold text-violet-900 text-xs mb-1">
                      Root Cause Conclusion:
                    </div>
                    <p className="text-violet-800 text-xs leading-relaxed">
                      {result.rootCauseSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="font-bold text-slate-900 text-xs mb-1">
                        Corrective Action (Immediate & Recurrence):
                      </div>
                      <p className="text-slate-700 text-xs">
                        {result.correctiveActionPlan}
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="font-bold text-slate-900 text-xs mb-1">
                        Preventive Action (Systemic Safeguard):
                      </div>
                      <p className="text-slate-700 text-xs">
                        {result.preventiveActionPlan}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPORT SUMMARY */}
          {tab === "report" && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">
                  Select Completed or Reviewed Audit
                </label>
                <select
                  value={selectedAuditForReport}
                  onChange={(e) => setSelectedAuditForReport(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {audits.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.auditNumber} - {a.customerName} ({a.standard}) - Score: {a.overallScore}%
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateReportSummary}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing audit metrics & writing executive summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Draft Executive Audit Summary & Conclusion</span>
                  </>
                )}
              </button>

              {result && result.executiveSummary && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Executive Summary & Audit Conclusion
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-100 text-indigo-800">
                      Rating: {result.riskRating}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                    {result.executiveSummary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="font-bold text-emerald-900 text-xs mb-1.5">
                        Key Demonstrated Strengths:
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-emerald-800">
                        {result.keyStrengths?.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="font-bold text-rose-900 text-xs mb-1.5">
                        Critical Vulnerabilities / Gaps:
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-rose-800">
                        {result.criticalVulnerabilities?.map((v: string, i: number) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium">
                    <span className="font-bold text-slate-900">Lead Auditor Conclusion: </span>
                    {result.conclusionRecommendation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RISK & SCOPE ADVISOR */}
          {tab === "risk" && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">
                  Select Customer for Risk Assessment
                </label>
                <select
                  value={selectedCustomerForRisk}
                  onChange={(e) => setSelectedCustomerForRisk(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry}) - Compliance: {c.complianceRating}% ({c.riskLevel} Risk)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateRiskAdvice}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing compliance risk profile & sampling rates...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Run AI Risk Advisor & Sampling Recommender</span>
                  </>
                )}
              </button>

              {result && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Predictive Risk Evaluation
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                      Calculated Risk: {result.riskLevel} ({result.riskScore}/100)
                    </span>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs mb-2">
                      Priority Audit Focus Areas:
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                      {result.priorityFocusAreas?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                      <div className="font-bold mb-1">Recommended Sampling Rate:</div>
                      {result.recommendedSampleRate}
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <div className="font-bold mb-1">Regulatory Alerts:</div>
                      {result.regulatoryAlerts}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by Gemini 3.7 Flash
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Copilot
          </button>
        </div>
      </div>
    </div>
  );
};
